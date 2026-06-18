import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { BrightcoveClient, WinnerCue } from "@dottools/shared";
import { r2Keys } from "@dottools/shared";
import { serializeVtt } from "@dottools/shared/vtt";
import type { OcrEnginePool } from "../ocr/index.ts";
import type { R2 } from "../r2.ts";
import {
  detectBlackBoundaries,
  extractFrameAt,
  extractFramesAtFps,
  getDurationSeconds,
  type ExtractedFrame,
} from "./frames.ts";
import { downloadSmallestMp4 } from "./download.ts";
import { resolveVideoMeta } from "./meta.ts";
import { type CueWinner, type FrameOcr, selectCues } from "./winners.ts";

export type Stage = "download" | "frames" | "ocr" | "normalize" | "write-r2" | "done";

export interface RunVideoResult {
  videoId: string;
  cueCount: number;
  srclang: string;
}

export interface RunVideoDeps {
  bc: BrightcoveClient;
  r2: R2;
  enginePool: OcrEnginePool;
  defaultLang: string;
  onStage?: (stage: Stage) => void;
}

/**
 * End-to-end OCR for one Brightcove video:
 *   download smallest MP4 → extract frames (1fps grid + black-cut boundaries)
 *   → OCR each frame → select cues (earliest clean reference) → write the VTT,
 *   per-cue winner thumbnails, and winners.json to R2.
 *
 * The editor reads the VTT (`{playlist}/{id}.vtt`) and surfaces winners.json +
 * thumbs so the reviewer can see which frame won each cue and why.
 */
export async function runVideo(
  playlistRef: string,
  videoId: string,
  deps: RunVideoDeps,
): Promise<RunVideoResult> {
  const { bc, r2, enginePool, defaultLang, onStage } = deps;
  const work = join(tmpdir(), "dot-ocr", videoId);
  const videoPath = join(work, "video.mp4");
  const framesDir = join(work, "frames");

  try {
    onStage?.("download");
    const video = await bc.getVideo(videoId);
    const meta = resolveVideoMeta(video, playlistRef, defaultLang);
    await downloadSmallestMp4(bc, videoId, videoPath);

    onStage?.("frames");
    const durationSeconds = await getDurationSeconds(videoPath);
    const gridFrames = await extractFramesAtFps(videoPath, framesDir, 1);
    const boundaries = await detectBlackBoundaries(videoPath);
    const boundaryFrames = await extractBoundaryFrames(videoPath, framesDir, boundaries);
    const frames = dedupeByTime([...gridFrames, ...boundaryFrames]);

    onStage?.("ocr");
    const engine = enginePool.forLang(meta.srclang);
    const frameOcr: FrameOcr[] = [];
    for (const frame of frames) {
      const words = await engine.recognize(frame.framePath);
      frameOcr.push({
        timestampSeconds: frame.timestampSeconds,
        framePath: frame.framePath,
        words,
      });
    }

    onStage?.("normalize");
    const cues = selectCues(frameOcr, {
      videoDurationSeconds: durationSeconds,
      defaults: meta.defaults,
    });

    onStage?.("write-r2");
    await writeOutputs(r2, playlistRef, videoId, cues);

    onStage?.("done");
    return { videoId, cueCount: cues.length, srclang: meta.srclang };
  } finally {
    await rm(work, { recursive: true, force: true }).catch(() => {});
  }
}

async function extractBoundaryFrames(
  videoPath: string,
  framesDir: string,
  boundaries: number[],
): Promise<ExtractedFrame[]> {
  const out: ExtractedFrame[] = [];
  for (const ts of boundaries) {
    try {
      out.push(await extractFrameAt(videoPath, framesDir, ts));
    } catch {
      // best-effort; the 1fps grid still covers the timeline
    }
  }
  return out;
}

/** Collapse frames whose timestamps round to the same half-second. */
function dedupeByTime(frames: ExtractedFrame[]): ExtractedFrame[] {
  const seen = new Set<number>();
  const out: ExtractedFrame[] = [];
  for (const f of frames.toSorted((a, b) => a.timestampSeconds - b.timestampSeconds)) {
    const bucket = Math.round(f.timestampSeconds * 2);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    out.push(f);
  }
  return out;
}

async function writeOutputs(
  r2: R2,
  playlistRef: string,
  videoId: string,
  cues: CueWinner[],
): Promise<void> {
  // The one canonical VTT (overwrites any prior run / edit for this video).
  const vtt = serializeVtt(
    cues.map((c) => ({
      startSeconds: c.startSeconds,
      endSeconds: c.endSeconds,
      text: c.reference,
    })),
  );
  await r2.putVtt(r2Keys.vttKey(playlistRef, videoId), vtt);

  // Per-cue winner thumbnail + winners.json provenance
  const winners: WinnerCue[] = [];
  for (const cue of cues) {
    const thumbKey = r2Keys.thumbKey(videoId, cue.cueIndex);
    const bytes = await readFile(cue.winnerFramePath);
    await r2.putThumb(thumbKey, bytes);
    winners.push({
      cueIndex: cue.cueIndex,
      timestampSeconds: cue.winnerTimestampSeconds,
      endSeconds: cue.endSeconds,
      confidence: cue.confidence,
      parsedReference: cue.reference,
      rawOcrText: cue.rawOcrText,
      thumbnailKey: thumbKey,
    });
  }
  await r2.putJson("tmp", r2Keys.winnersJsonKey(videoId), {
    videoId,
    generatedAt: new Date().toISOString(),
    cues: winners,
  });
}
