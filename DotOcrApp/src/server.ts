import { Hono } from "hono";
import { BrightcoveClient, books, r2Keys } from "@dottools/shared";
import type { Config } from "./config.ts";
import { R2 } from "./r2.ts";
import { OcrEnginePool } from "./ocr/index.ts";
import { createJobRunner, type JobRunner } from "./jobs.ts";
import { UI_HTML } from "./ui/html.ts";

export function buildServer(config: Config): Hono {
  const bc = new BrightcoveClient({
    accountId: config.brightcove.accountId,
    clientId: config.brightcove.clientId,
    clientSecret: config.brightcove.clientSecret,
    policyKey: config.brightcove.policyKey,
  });
  const r2 = new R2(config.r2);
  const enginePool = new OcrEnginePool(config.ocr.executionProviders);
  const jobs: JobRunner = createJobRunner({
    bc,
    r2,
    enginePool,
    defaultLang: config.ocr.defaultLang,
    concurrency: config.ocr.concurrency,
  });

  const app = new Hono();

  app.get("/", (c) => c.html(UI_HTML));

  app.get("/api/playlists", async (c) => {
    const playlists = await bc.getAllPlaylists(500);
    return c.json(
      playlists
        .map((p) => ({ id: p.id, name: p.name, reference_id: p.reference_id ?? null }))
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    );
  });

  app.get("/api/playlists/:ref/videos", async (c) => {
    const ref = c.req.param("ref");
    const videos = await bc.getPlaylistVideos(`ref:${ref}`);
    const rows = await Promise.all(
      videos.map(async (v) => {
        const [hasVtt, hasThumbs] = await Promise.all([
          r2.exists("assets", r2Keys.vttKey(ref, v.id)),
          r2.exists("tmp", r2Keys.thumbKey(v.id, 0)),
        ]);
        const hasBrightcoveChapters = (v.text_tracks ?? []).some((t) => t.kind === "chapters");
        const cf = v.custom_fields ?? {};
        const resolved = books.resolveBook(cf.book);
        return {
          id: v.id,
          name: v.name,
          // Canonical English book name (resolved from `book`, slug-tolerant)
          // for grouping; the localized name is what actually lands in the VTT.
          book: resolved?.name ?? cf.book ?? null,
          localizedBookName: cf.localized_book_name ?? null,
          chapter: cf.chapter ?? null,
          bookOrder: books.bookOrderFromFields(cf),
          hasBrightcoveChapters,
          hasVtt,
          hasThumbs,
        };
      }),
    );
    rows.sort(
      (a, b) =>
        a.bookOrder - b.bookOrder ||
        (Number.parseInt(a.chapter ?? "", 10) || 0) - (Number.parseInt(b.chapter ?? "", 10) || 0) ||
        a.name.localeCompare(b.name),
    );
    return c.json(rows);
  });

  app.post("/api/jobs", async (c) => {
    const body = await c.req.json<{
      mode: "whole-playlist" | "specific";
      playlistRef: string;
      videoIds?: string[];
    }>();
    if (!body.playlistRef) return c.json({ error: "playlistRef required" }, 400);

    let videoIds = body.videoIds ?? [];
    if (body.mode === "whole-playlist") {
      const videos = await bc.getPlaylistVideos(`ref:${body.playlistRef}`);
      videoIds = videos.map((v) => v.id);
    }
    if (videoIds.length === 0) return c.json({ error: "no videos to enqueue" }, 400);

    const created = jobs.enqueue(body.playlistRef, videoIds);
    return c.json({ enqueued: created.length, jobs: created });
  });

  app.get("/api/jobs", (c) => c.json(jobs.list()));
  app.get("/api/jobs/failures", (c) => c.json(jobs.failures()));

  app.post("/api/publish", async (c) => {
    const body = await c.req.json<{ playlistRef: string; videoId: string; srclang?: string }>();
    if (!body.playlistRef || !body.videoId) {
      return c.json({ error: "playlistRef and videoId required" }, 400);
    }
    const key = r2Keys.vttKey(body.playlistRef, body.videoId);
    if (!(await r2.exists("assets", key))) {
      return c.json({ error: `no VTT at ${key} — run OCR first` }, 404);
    }
    const base = r2.publicAssetUrl(key);
    if (!base) {
      return c.json({ error: "R2_PUBLIC_ASSETS_URL not configured — cannot publish" }, 500);
    }
    // Brightcove pulls this URL during ingest. Append a cache-buster so a
    // re-publish after an edit isn't served a stale CDN copy of the same key.
    const publicUrl = `${base}?v=${Date.now()}`;
    const resp = await bc.upsertChaptersTrack(body.videoId, publicUrl, body.srclang);
    return c.json({ ok: true, jobId: resp.id, key });
  });

  return app;
}
