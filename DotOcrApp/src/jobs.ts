import { Cause, Effect, Queue } from "effect";
import type { BrightcoveClient } from "@dottools/shared";
import type { OcrEnginePool } from "./ocr/index.ts";
import type { R2 } from "./r2.ts";
import { runVideo, type Stage } from "./pipeline/runVideo.ts";

interface JobItem {
  jobId: string;
  playlistRef: string;
  videoId: string;
}

export interface JobRecord {
  id: string;
  playlistRef: string;
  videoId: string;
  status: "pending" | "running" | "done" | "failed";
  stage?: Stage;
  cueCount?: number;
  error?: string;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface JobRunnerDeps {
  bc: BrightcoveClient;
  r2: R2;
  enginePool: OcrEnginePool;
  defaultLang: string;
  concurrency: number;
}

export interface JobRunner {
  enqueue: (playlistRef: string, videoIds: string[]) => JobRecord[];
  list: () => JobRecord[];
  failures: () => JobRecord[];
  get: (id: string) => JobRecord | undefined;
}

const now = (): string => new Date().toISOString();

/**
 * In-process OCR job runner backed by an Effect Queue + a fixed worker pool.
 *
 * - `Queue.unbounded` holds pending video jobs; submissions return immediately.
 * - `concurrency` worker fibers each loop forever: take a job, run the pipeline,
 *   and fold success/failure into the job record. `Effect.matchCause` means a
 *   failed video never kills its worker — the failure is recorded and the loop
 *   continues (so one bad video doesn't sink a whole-playlist run).
 * - Job state is an in-memory Map. It's display/resumability scratch only and
 *   is NEVER the source of truth about VTTs — that's R2 + Brightcove. If the
 *   container restarts mid-run, just re-run; already-seeded videos are cheap to
 *   skip via the R2 indicators.
 */
export function createJobRunner(deps: JobRunnerDeps): JobRunner {
  const queue = Effect.runSync(Queue.unbounded<JobItem>());
  const records = new Map<string, JobRecord>();
  let seq = 0;

  const update = (id: string, patch: Partial<JobRecord>): void => {
    const r = records.get(id);
    if (r) Object.assign(r, patch);
  };

  const processOne = (item: JobItem): Effect.Effect<void> =>
    Effect.gen(function* () {
      update(item.jobId, { status: "running", startedAt: now() });
      yield* Effect.matchCause(
        Effect.tryPromise({
          try: () =>
            runVideo(item.playlistRef, item.videoId, {
              bc: deps.bc,
              r2: deps.r2,
              enginePool: deps.enginePool,
              defaultLang: deps.defaultLang,
              onStage: (stage) => update(item.jobId, { stage }),
            }),
          catch: (e) => e,
        }),
        {
          onFailure: (cause) =>
            Effect.sync(() =>
              update(item.jobId, {
                status: "failed",
                error: Cause.pretty(cause),
                finishedAt: now(),
              }),
            ),
          onSuccess: (res) =>
            Effect.sync(() =>
              update(item.jobId, {
                status: "done",
                stage: "done",
                cueCount: res.cueCount,
                finishedAt: now(),
              }),
            ),
        },
      );
    });

  const workerLoop = Effect.forever(
    Effect.gen(function* () {
      const item = yield* Queue.take(queue);
      yield* processOne(item);
    }),
  );

  const concurrency = Math.max(1, deps.concurrency);
  for (let i = 0; i < concurrency; i++) {
    Effect.runFork(workerLoop);
  }

  const list = (): JobRecord[] =>
    [...records.values()].toSorted((a, b) => b.enqueuedAt.localeCompare(a.enqueuedAt));

  return {
    enqueue(playlistRef, videoIds) {
      const created: JobRecord[] = [];
      for (const videoId of videoIds) {
        const id = `${Date.now()}-${seq++}`;
        const rec: JobRecord = {
          id,
          playlistRef,
          videoId,
          status: "pending",
          enqueuedAt: now(),
        };
        records.set(id, rec);
        Queue.offerUnsafe(queue, { jobId: id, playlistRef, videoId });
        created.push(rec);
      }
      return created;
    },
    list,
    failures: () => list().filter((r) => r.status === "failed"),
    get: (id) => records.get(id),
  };
}
