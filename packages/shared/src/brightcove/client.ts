import { DEFAULT_SRCLANG, VTT_TRACK_CONSTANTS } from "../constants.ts";
import { BrightcoveApiError } from "./errors.ts";
import type {
  BrightcoveIngestResponse,
  BrightcoveOAuthTokenResponse,
  BrightcovePlaybackPlaylist,
  BrightcovePlaylist,
  BrightcoveSource,
  BrightcoveTextTrack,
  BrightcoveVideo,
} from "./types.ts";

/** Brightcove playlists are hard-capped at 1000 videos; default to the cap. */
const PLAYBACK_PLAYLIST_LIMIT = 1000;

export interface BrightcoveConfig {
  accountId: string;
  clientId: string;
  clientSecret: string;
  /** Optional. Required only if you call Playback-API-backed methods. */
  policyKey?: string;
  /** Override for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Optional clock for token expiry tests. Defaults to Date.now. */
  now?: () => number;
}

interface CachedToken {
  value: string;
  expiresAtMs: number;
}

/**
 * Thin TypeScript client over the Brightcove APIs we actually use:
 *   - OAuth v4 token exchange (HTTP Basic + client_credentials)
 *   - CMS API: get_video, get_video_sources, list_playlists, list_playlist_videos, get_text_tracks
 *   - Playback API: get_playback_playlist (policy-key auth; what the cache worker
 *     warms and the public apps read)
 *   - Dynamic Ingest: ingest_text_tracks (APPEND-only — the verbatim body
 *     shape from the alt app is locked in `VTT_TRACK_CONSTANTS`)
 *   - CMS API: PATCH text_tracks (delete/replace the array — Dynamic Ingest can
 *     only append, so removing a stale track requires this)
 *
 * No retries. No server-side cache. Token cache only.
 */
export class BrightcoveClient {
  private readonly accountId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly policyKey: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private token: CachedToken | null = null;

  constructor(config: BrightcoveConfig) {
    this.accountId = config.accountId;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.policyKey = config.policyKey;
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.now = config.now ?? (() => Date.now());
  }

  /* -------------------------- OAuth -------------------------- */

  async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAtMs > this.now() + 5_000) {
      return this.token.value;
    }
    const url = "https://oauth.brightcove.com/v4/access_token";
    const basic = base64(`${this.clientId}:${this.clientSecret}`);
    const body = new URLSearchParams({ grant_type: "client_credentials" });
    const resp = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!resp.ok) {
      throw new BrightcoveApiError({
        method: "POST",
        url,
        status: resp.status,
        statusText: resp.statusText,
        body: await safeText(resp),
      });
    }
    const data = (await resp.json()) as BrightcoveOAuthTokenResponse;
    if (!data.access_token) {
      throw new Error("Brightcove OAuth did not return access_token");
    }
    // Refresh slightly before stated expiry to avoid race-on-the-edge.
    const ttlMs = Math.max(0, (data.expires_in - 30) * 1000);
    this.token = { value: data.access_token, expiresAtMs: this.now() + ttlMs };
    return this.token.value;
  }

  /* --------------------------- CMS --------------------------- */

  getVideo(videoId: string): Promise<BrightcoveVideo> {
    return this.cms<BrightcoveVideo>("GET", `/videos/${encodeURIComponent(videoId)}`);
  }

  getVideoSources(videoId: string): Promise<BrightcoveSource[]> {
    return this.cms<BrightcoveSource[]>("GET", `/videos/${encodeURIComponent(videoId)}/sources`);
  }

  /** Picks the smallest MP4 source by file size (`size` field). */
  async getSmallestMp4Source(videoId: string): Promise<BrightcoveSource | null> {
    const sources = await this.getVideoSources(videoId);
    const mp4s = sources.filter(
      (s) => isMp4(s) && typeof s.src === "string" && typeof s.size === "number",
    );
    if (mp4s.length === 0) return null;
    mp4s.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
    return mp4s[0] ?? null;
  }

  async getPlaylists(
    opts: { limit?: number; offset?: number; sort?: string } = {},
  ): Promise<BrightcovePlaylist[]> {
    const params = new URLSearchParams({
      limit: String(Math.min(opts.limit ?? 100, 100)),
      offset: String(Math.max(opts.offset ?? 0, 0)),
      sort: opts.sort ?? "updated_at",
    });
    return this.cms<BrightcovePlaylist[]>("GET", `/playlists?${params.toString()}`);
  }

  /** Pages through playlists up to `totalLimit` (default 1000). */
  async getAllPlaylists(totalLimit = 1000, sort = "updated_at"): Promise<BrightcovePlaylist[]> {
    const out: BrightcovePlaylist[] = [];
    const pageSize = 100;
    let offset = 0;
    while (out.length < totalLimit) {
      const page = await this.getPlaylists({ limit: pageSize, offset, sort });
      if (page.length === 0) break;
      out.push(...page);
      if (page.length < pageSize) break;
      offset += pageSize;
    }
    return out.slice(0, totalLimit);
  }

  async getPlaylistVideos(playlistId: string): Promise<BrightcoveVideo[]> {
    const out: BrightcoveVideo[] = [];
    const pageSize = 100;
    let offset = 0;
    // Brightcove's behavior on paging /playlists/:id/videos varies — try paged,
    // and fall back to a single unpaged request on error (mirrors alt app).
    try {
      while (out.length < 1000) {
        const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
        const page = await this.cms<BrightcoveVideo[]>(
          "GET",
          `/playlists/${encodeURIComponent(playlistId)}/videos?${params.toString()}`,
        );
        if (page.length === 0) break;
        out.push(...page);
        if (page.length < pageSize) break;
        offset += pageSize;
      }
      return out.slice(0, 1000);
    } catch {
      return this.cms<BrightcoveVideo[]>(
        "GET",
        `/playlists/${encodeURIComponent(playlistId)}/videos`,
      );
    }
  }

  /** Fetches `text_tracks` from the video object (CMS doesn't expose a dedicated endpoint). */
  async getTextTracks(videoId: string): Promise<BrightcoveTextTrack[]> {
    const video = await this.getVideo(videoId);
    return video.text_tracks ?? [];
  }

  /**
   * Text-track bodies are served from a public URL — no Brightcove auth needed.
   * Uses the same fetch impl so tests can mock both halves.
   */
  async fetchTextTrackBody(srcUrl: string): Promise<string> {
    const resp = await this.fetchImpl(srcUrl);
    if (!resp.ok) {
      throw new BrightcoveApiError({
        method: "GET",
        url: srcUrl,
        status: resp.status,
        statusText: resp.statusText,
        body: await safeText(resp),
      });
    }
    return resp.text();
  }

  /* ----------------------- Playback API ----------------------- */

  /**
   * Reads a playlist (with its resolved `videos`) from the Playback API
   * (`edge.api.brightcove.com/playback/v1`) — the Akamai-fronted, policy-key
   * API the public apps use. Accepts either a numeric playlist id or a
   * `ref:<reference_id>` lookup. Requires `policyKey` to be configured.
   *
   * This is the read the playlist cache worker warms and the public apps
   * (DotWeb/DotMobile) consume; it is distinct from the CMS `getPlaylists()`.
   */
  async getPlaybackPlaylist(
    refOrId: string,
    opts: { limit?: number } = {},
  ): Promise<BrightcovePlaybackPlaylist> {
    if (!this.policyKey) {
      throw new Error("getPlaybackPlaylist requires a policyKey in BrightcoveConfig");
    }
    const params = new URLSearchParams({
      limit: String(Math.min(opts.limit ?? PLAYBACK_PLAYLIST_LIMIT, PLAYBACK_PLAYLIST_LIMIT)),
    });
    // Path params are interpolated raw (not percent-encoded) to match the
    // generated client the public apps use: Brightcove expects a literal
    // `ref:<reference_id>` and tolerates `'` in ids (e.g. cote-d'ivoire-...).
    const url =
      `https://edge.api.brightcove.com/playback/v1/accounts/${this.accountId}` +
      `/playlists/${refOrId}?${params.toString()}`;
    return await this.playback<BrightcovePlaybackPlaylist>(url);
  }

  /* ----------------------- Dynamic Ingest ----------------------- */

  /**
   * Publishes a `chapters` text track to Brightcove via Dynamic Ingest.
   *
   * The body shape is locked to `VTT_TRACK_CONSTANTS` so it cannot drift from
   * the working alt-app contract: { kind: "chapters", label: "Verse Markers",
   * default: true, status: "published", embed_closed_caption: false }.
   *
   * IMPORTANT: Dynamic Ingest is APPEND-ONLY for text tracks — it always adds a
   * new track and ignores any `id`/replace hint in the body (per Brightcove's
   * WebVTT ingest guide). Calling this directly on a video that already has a
   * chapters track creates a DUPLICATE. To re-publish without duplicating, use
   * `upsertChaptersTrack`, which deletes the existing track via the CMS API
   * first (the only API that can remove an ingested track).
   *
   * Per-call inputs: `url` (a public R2 URL of the VTT) and `srclang` (defaults
   * to "en"; override per video from custom_fields).
   */
  async ingestTextTrack(
    videoId: string,
    publicVttUrl: string,
    srclang: string = DEFAULT_SRCLANG,
  ): Promise<BrightcoveIngestResponse> {
    const body = {
      text_tracks: [
        {
          url: publicVttUrl,
          srclang,
          kind: VTT_TRACK_CONSTANTS.kind,
          label: VTT_TRACK_CONSTANTS.label,
          default: VTT_TRACK_CONSTANTS.default,
          status: VTT_TRACK_CONSTANTS.status,
          embed_closed_caption: VTT_TRACK_CONSTANTS.embed_closed_caption,
        },
      ],
    };
    return this.ingest<BrightcoveIngestResponse>(
      "POST",
      `/videos/${encodeURIComponent(videoId)}/ingest-requests`,
      body,
    );
  }

  /**
   * Replace the video's entire `text_tracks` list via the CMS API.
   *
   * The CMS PATCH is NOT a delta — you must send the FULL array you want the
   * video to end up with. Tracks omitted from `tracks` are deleted; `[]` clears
   * all of them. This is the only API that can delete an ingested text track
   * (Dynamic Ingest can only append). Note the CMS API treats an ingested
   * track's `src` as read-only, so this can't swap VTT content — only delete or
   * edit metadata.
   */
  async setTextTracks(videoId: string, tracks: BrightcoveTextTrack[]): Promise<void> {
    await this.cms<void>("PATCH", `/videos/${encodeURIComponent(videoId)}`, {
      text_tracks: tracks,
    });
  }

  /**
   * Publish the chapters track without duplicating it.
   *
   * Dynamic Ingest is append-only, so to keep a single chapters track we must
   * delete any existing one(s) BEFORE ingesting the new VTT:
   *   1. GET the current text tracks.
   *   2. If any look like ours — `kind: "chapters"` AND a case-insensitive
   *      "Verse Markers" label (both must match so we never touch an unrelated
   *      chapters track or a same-labelled track of a different kind) — CMS-PATCH
   *      the array with them removed (this also sweeps up pre-existing duplicates).
   *   3. Dynamic Ingest the new VTT, which appends exactly one fresh track.
   *
   * There's a brief window between delete and ingest-completion where the video
   * has no chapters track; that's acceptable for the review workflow. A rapid
   * double-publish within the ~30s–2min ingest delay can still race (step 1
   * won't see the in-flight track), but a single publish is now duplicate-free.
   */
  async upsertChaptersTrack(
    videoId: string,
    publicVttUrl: string,
    srclang: string = DEFAULT_SRCLANG,
  ): Promise<BrightcoveIngestResponse> {
    const tracks = await this.getTextTracks(videoId);
    const isOurs = (t: BrightcoveTextTrack) =>
      t.kind === VTT_TRACK_CONSTANTS.kind &&
      t.label?.trim().toLowerCase() === VTT_TRACK_CONSTANTS.label.toLowerCase();
    if (tracks.some(isOurs)) {
      await this.setTextTracks(
        videoId,
        tracks.filter((t) => !isOurs(t)),
      );
    }
    return this.ingestTextTrack(videoId, publicVttUrl, srclang);
  }

  /* --------------------------- Internals --------------------------- */

  private async cms<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.authed<T>(
      method,
      `https://cms.api.brightcove.com/v1/accounts/${encodeURIComponent(this.accountId)}${path}`,
      body,
    );
  }

  private async ingest<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.authed<T>(
      method,
      `https://ingest.api.brightcove.com/v1/accounts/${encodeURIComponent(this.accountId)}${path}`,
      body,
    );
  }

  /** Playback API GET — policy-key auth via the `Accept` header, no OAuth bearer. */
  private async playback<T>(url: string): Promise<T> {
    const resp = await this.fetchImpl(url, {
      method: "GET",
      headers: { Accept: `application/json;pk=${this.policyKey}` },
    });
    if (!resp.ok) {
      throw new BrightcoveApiError({
        method: "GET",
        url,
        status: resp.status,
        statusText: resp.statusText,
        body: await safeText(resp),
      });
    }
    return (await resp.json()) as T;
  }

  private async authed<T>(method: string, url: string, body?: unknown): Promise<T> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    let payload: string | undefined;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    const resp = await this.fetchImpl(url, { method, headers, body: payload });
    if (!resp.ok) {
      throw new BrightcoveApiError({
        method,
        url,
        status: resp.status,
        statusText: resp.statusText,
        body: await safeText(resp),
      });
    }
    if (resp.status === 204) return undefined as T;
    const text = await resp.text();
    if (text === "") return undefined as T;
    return JSON.parse(text) as T;
  }

  /* --------------------------- Misc --------------------------- */

  /** Exposed for callers that need to attach the policy key directly (e.g. Playback API or BC player). */
  getPolicyKey(): string | undefined {
    return this.policyKey;
  }
}

// `btoa` is a global in both Node 22+ and Workers, so no Node `Buffer` branch is
// needed (which also keeps this typecheckable under worker-only tsconfig types).
// btoa expects Latin-1; client_id/secret should be ASCII.
function base64(input: string): string {
  return btoa(input);
}

function isMp4(source: BrightcoveSource): boolean {
  return (
    source.container === "MP4" ||
    source.type === "video/mp4" ||
    source.src?.endsWith(".mp4") === true
  );
}

async function safeText(resp: Response): Promise<string> {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}
