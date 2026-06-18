import { env } from "cloudflare:workers";
import type { BrightcovePlaybackPlaylist } from "@dottools/shared";

/**
 * Reads the warm Brightcove-playlist cache populated by the `dot-playlist-cache`
 * worker, via the bound `BRIGHTCOVE_PLAYLISTS` KV namespace (zero-HTTP — same
 * Cloudflare account). Every function returns null on a miss so callers fall
 * back to hitting Brightcove directly; the cache is an accelerator, never a hard
 * dependency.
 *
 * The KV shapes below mirror the contract in `DotPlaylistCache/src/warm.ts`
 * (the worker owns the contract). Only the fields we read are typed.
 */

const INDEX_KEY = "__index";

interface CachedIndexEntry {
  id: string;
  reference_id: string | null;
  name: string;
  ok: boolean;
}

interface CachedIndex {
  playlists: CachedIndexEntry[];
}

interface StoredPlaylist {
  body: BrightcovePlaybackPlaylist;
  etag: string;
  warmedAt: string;
}

export interface CachedPlaylistSummary {
  id: string;
  name: string;
  reference_id: string;
}

function kv(): KVNamespace | null {
  return env.BRIGHTCOVE_PLAYLISTS ?? null;
}

/**
 * The full playlist list from the warm index, restricted to playlists that have
 * a `reference_id` and warmed cleanly. The missing-reference_id filter doubles
 * as a junk filter — test playlists that never got a ref are dropped.
 * Returns null if the cache is unbound or never warmed.
 */
export async function listPlaylistsFromCache(): Promise<CachedPlaylistSummary[] | null> {
  const ns = kv();
  if (!ns) return null;
  const raw = await ns.get(INDEX_KEY);
  if (!raw) return null;
  try {
    const index = JSON.parse(raw) as CachedIndex;
    return index.playlists
      .filter((e) => e.ok && e.reference_id)
      .map((e) => ({ id: e.id, name: e.name, reference_id: e.reference_id as string }));
  } catch {
    return null;
  }
}

/**
 * A single warmed playlist (Playback-API shape) by `reference_id` or numeric id.
 * Returns null on a miss so the caller can fall back to a live Brightcove fetch.
 */
export async function getPlaylistFromCache(
  refOrId: string,
): Promise<BrightcovePlaybackPlaylist | null> {
  const ns = kv();
  if (!ns) return null;
  const raw = (await ns.get(`ref:${refOrId}`)) ?? (await ns.get(`id:${refOrId}`));
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as StoredPlaylist).body;
  } catch {
    return null;
  }
}
