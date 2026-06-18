import type { BrightcoveClient, BrightcovePlaybackPlaylist } from "@dottools/shared/brightcove";
import { computeEtag } from "./etag.ts";

export const INDEX_KEY = "__index";
/** Max concurrent Playback API fetches during a warm pass — gentle on Akamai. */
const WARM_CONCURRENCY = 6;

/** One playlist as stored in KV (value is JSON.stringify of this). */
export interface StoredPlaylist {
  body: BrightcovePlaybackPlaylist;
  etag: string;
  warmedAt: string;
}

export interface WarmIndexEntry {
  id: string;
  reference_id: string | null;
  name: string;
  etag: string;
  warmedAt: string;
  ok: boolean;
  error?: string;
}

export interface WarmIndex {
  lastRunAt: string;
  playlistCount: number;
  okCount: number;
  playlists: WarmIndexEntry[];
  errors: { playlist: string; message: string }[];
}

export interface WarmDeps {
  client: BrightcoveClient;
  kv: KVNamespace;
  /** Injectable clock so warmedAt is deterministic in tests. Defaults to wall clock. */
  now?: () => Date;
}

/** KV key for a stored playlist: `ref:<reference_id>` or `id:<numericId>`. */
export function kvKeyFor(refOrId: string): string {
  return refOrId.startsWith("ref:") ? refOrId : `id:${refOrId}`;
}

/** Stores a playlist body under both its `ref:` (if any) and `id:` keys. */
async function store(
  kv: KVNamespace,
  pl: BrightcovePlaybackPlaylist,
  nowIso: string,
): Promise<StoredPlaylist> {
  const json = JSON.stringify(pl);
  const etag = await computeEtag(json);
  const stored: StoredPlaylist = { body: pl, etag, warmedAt: nowIso };
  const value = JSON.stringify(stored);
  const writes: Promise<void>[] = [];
  if (pl.id) writes.push(kv.put(`id:${pl.id}`, value));
  if (pl.reference_id) writes.push(kv.put(`ref:${pl.reference_id}`, value));
  await Promise.all(writes);
  return stored;
}

/** Warms a single playlist by `ref:<reference_id>` or numeric id, returns the stored entry. */
export async function warmOne(deps: WarmDeps, refOrId: string): Promise<StoredPlaylist> {
  const nowIso = (deps.now?.() ?? new Date()).toISOString();
  const pl = await deps.client.getPlaybackPlaylist(refOrId);
  return store(deps.kv, pl, nowIso);
}

/** Reads a stored playlist from KV (null on miss / parse failure). */
export async function readStored(kv: KVNamespace, refOrId: string): Promise<StoredPlaylist | null> {
  const raw = await kv.get(kvKeyFor(refOrId));
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as StoredPlaylist;
  } catch {
    return null;
  }
}

/** Reads the index manifest from KV (null if never warmed). */
export async function readIndex(kv: KVNamespace): Promise<WarmIndex | null> {
  const raw = await kv.get(INDEX_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as WarmIndex;
  } catch {
    return null;
  }
}

/**
 * Full warm pass: enumerate every playlist via CMS, fetch each via the Playback
 * API (concurrency-limited), store in KV, and write the index manifest.
 * Per-playlist failures are recorded but never fail the run — the last good KV
 * value stays in place.
 */
export async function warmAll(deps: WarmDeps): Promise<WarmIndex> {
  const nowIso = (deps.now?.() ?? new Date()).toISOString();
  const playlists = await deps.client.getAllPlaylists();

  const entries: WarmIndexEntry[] = [];
  const errors: { playlist: string; message: string }[] = [];

  await mapWithConcurrency(playlists, WARM_CONCURRENCY, async (pl) => {
    // Prefer the ref lookup (what consumers use); fall back to numeric id.
    const lookup = pl.reference_id ? `ref:${pl.reference_id}` : pl.id;
    try {
      const stored = await warmOne(deps, lookup);
      entries.push({
        id: pl.id,
        reference_id: pl.reference_id ?? null,
        name: pl.name,
        etag: stored.etag,
        warmedAt: stored.warmedAt,
        ok: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ playlist: lookup, message });
      entries.push({
        id: pl.id,
        reference_id: pl.reference_id ?? null,
        name: pl.name,
        etag: "",
        warmedAt: "",
        ok: false,
        error: message,
      });
    }
  });

  const index: WarmIndex = {
    lastRunAt: nowIso,
    playlistCount: entries.length,
    okCount: entries.filter((e) => e.ok).length,
    playlists: entries,
    errors,
  };
  await deps.kv.put(INDEX_KEY, JSON.stringify(index));
  return index;
}

/** Runs `fn` over `items` with at most `limit` in flight at once. */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      await fn(items[i]!);
    }
  });
  await Promise.all(workers);
}
