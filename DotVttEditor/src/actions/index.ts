import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { env } from "cloudflare:workers";
import { r2Keys, VTT_CONTENT_TYPE, type WinnersFile } from "@dottools/shared";
import { brightcoveFromEnv } from "@lib/brightcove";
import { listPlaylistsFromCache } from "@lib/playlistCache";

const COMPLETED_JSON = "completed.json";

/**
 * Strip HLS WebVTT header lines (X-TIMESTAMP-MAP) that Brightcove's text-track
 * delivery prepends. They're valid but noise in the editor, and since Save
 * writes the textarea verbatim, leaving them in would round-trip them back into
 * Brightcove on every save. Brightcove re-adds its own at delivery time.
 */
function stripTimestampMap(vtt: string): string {
  return vtt
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("X-TIMESTAMP-MAP"))
    .join("\n");
}

export const server = {
  /**
   * VTT load order:
   *   1. R2 VTT  `{playlist}/{id}.vtt`   (the single source of truth — written
   *      by OCR, then overwritten by each "Save")
   *   2. Brightcove chapters text_track  (live state, only if no R2 VTT yet)
   *   3. Empty.
   */
  getVtt: defineAction({
    input: z.object({
      playlist: z.string(),
      // id arrives as "{videoId}.vtt" today; tolerate both.
      id: z.string(),
    }),
    handler: async (input) => {
      const playlist = input.playlist;
      const videoId = input.id.replace(/\.vtt$/, "");

      const assets: R2Bucket = env.DOT_ASSETS;

      // 1) R2 VTT (OCR output, then overwritten by edits)
      const vtt = await assets.get(r2Keys.vttKey(playlist, videoId));
      if (vtt) {
        return { text: stripTimestampMap((await vtt.text()) ?? ""), source: "draft" as const };
      }

      // 2) Brightcove chapters track
      try {
        const bc = brightcoveFromEnv(env);
        const tracks = await bc.getTextTracks(videoId);
        const chapters = tracks.find((t) => t.kind === "chapters");
        if (chapters?.src) {
          const body = await bc.fetchTextTrackBody(chapters.src);
          if (body && body.trim() !== "") {
            return { text: stripTimestampMap(body), source: "brightcove" as const };
          }
        }
      } catch (e) {
        // Brightcove read failure shouldn't block editing — fall through to empty.
        console.error("getVtt: Brightcove lookup failed", e);
      }

      // 3) empty
      return { text: "", source: "empty" as const };
    },
  }),

  /**
   * Save draft = persist the single R2 VTT only. The R2 VTT is the source of
   * truth and the write-through cache that covers Brightcove's 30s–2min ingest
   * delay so reloads stay coherent. Publishing to Brightcove is a SEPARATE,
   * explicit step (`publishVtt`) so a reviewer can edit incrementally without
   * pushing every keystroke live.
   *
   * Mark-finished is intentionally NOT done here — it has its own action.
   */
  updateVtt: defineAction({
    input: z.object({
      playlist: z.string(),
      id: z.string(),
      text: z.string(),
    }),
    handler: async (input) => {
      const playlist = input.playlist;
      const videoId = input.id.replace(/\.vtt$/, "");

      const assets: R2Bucket = env.DOT_ASSETS;
      await assets.put(r2Keys.vttKey(playlist, videoId), input.text, {
        httpMetadata: { contentType: VTT_CONTENT_TYPE },
      });
      return { ok: true as const };
    },
  }),

  /**
   * Publish = auto-save the current editor text to R2, then push it to
   * Brightcove via Dynamic Ingest. Saving first guarantees the published
   * content always matches what's on screen (no stale-draft footgun), since
   * Brightcove pulls the file's public URL.
   */
  publishVtt: defineAction({
    input: z.object({
      playlist: z.string(),
      id: z.string(),
      text: z.string(),
      srclang: z.string().optional(),
    }),
    handler: async (input) => {
      const playlist = input.playlist;
      const videoId = input.id.replace(/\.vtt$/, "");

      const assets: R2Bucket = env.DOT_ASSETS;
      const key = r2Keys.vttKey(playlist, videoId);

      // Auto-save the current text first, then push the same file.
      await assets.put(key, input.text, {
        httpMetadata: { contentType: VTT_CONTENT_TYPE },
      });

      const publicBase = env.DOT_ASSETS_PUBLIC_URL;
      if (!publicBase) {
        return {
          ok: false as const,
          stage: "missing-public-url" as const,
          message: "DOT_ASSETS_PUBLIC_URL is not configured — cannot publish to Brightcove.",
        };
      }
      // Cache-buster so a re-publish after an edit isn't served a stale CDN copy.
      const publicUrl = `${publicBase.replace(/\/+$/, "")}/${key}?v=${Date.now()}`;

      try {
        const bc = brightcoveFromEnv(env);
        const ingest = await bc.upsertChaptersTrack(videoId, publicUrl, input.srclang);
        return { ok: true as const, stage: "ingested" as const, jobId: ingest.id };
      } catch (e) {
        console.error("publishVtt: Dynamic Ingest failed", e);
        return {
          ok: false as const,
          stage: "ingest-failed" as const,
          message: e instanceof Error ? e.message : String(e),
        };
      }
    },
  }),

  /**
   * Lists Brightcove playlists for the dynamic home route. Reads the warm
   * `dot-playlist-cache` KV first (fast, edge-replicated); falls back to a live
   * CMS list when the cache is unbound/cold. Either way, only playlists with a
   * `reference_id` are returned — that filters out ref-less test/junk playlists.
   */
  listPlaylists: defineAction({
    handler: async () => {
      const cached = await listPlaylistsFromCache();
      if (cached) return cached;

      // Fallback: live CMS list (the cache is an accelerator, not a dependency).
      const bc = brightcoveFromEnv(env);
      const playlists = await bc.getAllPlaylists(500);
      return playlists
        .filter((p) => p.reference_id)
        .map((p) => ({ id: p.id, name: p.name, reference_id: p.reference_id as string }));
    },
  }),

  getImgsForId: defineAction({
    input: z.object({
      prefix: z.string(),
    }),
    handler: async (input) => {
      const publicBucketUrl = env.TMP_IMGS_BUCKET_URL;
      const prefix = input.prefix;
      const bucket: R2Bucket = env.DOT_TMP;
      const imgs = await bucket.list({
        prefix,
        limit: 1000,
      });
      const numRegexExtractor = /-(\d+)/;

      if (import.meta.env.DEV) {
        const retVal = [];
        for await (const img of imgs.objects) {
          try {
            const gotten = await bucket.get(img.key);
            const keyMatch = img.key.match(numRegexExtractor);
            const seconds = Number(keyMatch?.[1]);
            const buff = await gotten?.arrayBuffer();
            const u8 = new Uint8Array(buff!);
            const b64 = btoa(u8.reduce((data, byte) => data + String.fromCharCode(byte), ""));
            const src = `data:image/webp;base64,${b64}`;
            retVal.push({ key: img.key, url: src, seconds });
          } catch (e) {
            console.error(e);
            return undefined;
          }
        }
        return retVal;
      }
      return imgs.objects.map((img) => {
        const keyMatch = img.key.match(numRegexExtractor);
        const seconds = Number(keyMatch?.[1]);
        return {
          key: img.key,
          url: `${publicBucketUrl}/${img.key}`,
          seconds,
        };
      });
    },
  }),

  /**
   * Reads the OCR producer's `DOT_TMP/{videoId}/winners.json` and returns
   * display-ready thumbnails enriched with the real picked timestamp, the
   * parsed reference, and OCR confidence — so the reviewer can see which frame
   * won each cue and why. Returns null when no winners.json exists (e.g. videos
   * OCR'd by the old pipeline); callers fall back to `getImgsForId`.
   */
  getWinnerThumbs: defineAction({
    input: z.object({
      videoId: z.string(),
    }),
    handler: async (input) => {
      const videoId = input.videoId;
      const bucket: R2Bucket = env.DOT_TMP;
      const publicBucketUrl = env.TMP_IMGS_BUCKET_URL;

      const obj = await bucket.get(r2Keys.winnersJsonKey(videoId));
      if (!obj) return null;
      const winners = JSON.parse(await obj.text()) as WinnersFile;

      const thumbs = [];
      for (const cue of winners.cues) {
        let url: string;
        if (import.meta.env.DEV) {
          // Inline the bytes as base64 in dev (no public bucket URL locally).
          const img = await bucket.get(cue.thumbnailKey);
          const buff = await img?.arrayBuffer();
          if (!buff) continue;
          const u8 = new Uint8Array(buff);
          const b64 = btoa(u8.reduce((data, byte) => data + String.fromCharCode(byte), ""));
          url = `data:image/jpeg;base64,${b64}`;
        } else {
          url = `${publicBucketUrl}/${cue.thumbnailKey}`;
        }
        thumbs.push({
          key: cue.thumbnailKey,
          url,
          seconds: cue.timestampSeconds,
          reference: cue.parsedReference,
          confidence: cue.confidence,
          rawText: cue.rawOcrText,
        });
      }
      return thumbs;
    },
  }),

  getFinishedMap: defineAction({
    input: z.object({
      playlist: z.string(),
    }),
    handler: async (input) => {
      const playlist = input.playlist;
      const bucket: R2Bucket = env.DOT_TMP;
      const completedJson = await bucket.get(`${playlist}/${COMPLETED_JSON}`);
      if (!completedJson) {
        return null;
      }
      const map = JSON.parse(await completedJson.text());
      return map as Record<string, boolean>;
    },
  }),

  initFinishedMap: defineAction({
    input: z.object({
      playlist: z.string(),
      map: z.record(z.string(), z.boolean()),
    }),
    handler: async (input) => {
      const playlist = input.playlist;
      const map = input.map;
      const bucket: R2Bucket = env.DOT_TMP;
      await bucket.put(`${playlist}/${COMPLETED_JSON}`, JSON.stringify(map));
    },
  }),

  changeCompletedStatusForVid: defineAction({
    input: z.object({
      playlist: z.string(),
      id: z.string(),
      finished: z.boolean(),
    }),
    handler: async (input) => {
      const playlist = input.playlist;
      const id = input.id;
      const finished = input.finished;
      const bucket: R2Bucket = env.DOT_TMP;
      const completedJson = await bucket.get(`${playlist}/${COMPLETED_JSON}`);
      const parsed = await completedJson?.text();
      const map = parsed ? JSON.parse(parsed) : {};
      map[id] = finished;
      await bucket.put(`${playlist}/${COMPLETED_JSON}`, JSON.stringify(map));
      return {
        text: "updated",
      };
    },
  }),
};
