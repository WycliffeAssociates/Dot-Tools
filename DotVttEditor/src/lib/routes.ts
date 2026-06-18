import { env } from "cloudflare:workers";
import { playbackApi, type PlaylistResponse } from "@customTypes/Api";
import { getPlaylistFromCache } from "@lib/playlistCache";

export const DOWNLOAD_SERVICE_WORK_URL = "download-video";

/**
 * Fetch a playlist by reference_id — warm KV cache first, then a live Playback
 * API call. Runs IN-PROCESS (no HTTP), so it's safe to call from SSR pages.
 *
 * Previously the page did `fetch(${origin}/api/getPlaylist)` — a Worker calling
 * its own public URL, which works under `astro dev` but fails on a deployed
 * Worker, so every playlist route 404'd in production. Both the page and the
 * `/api/getPlaylist` endpoint now call this directly.
 */
export async function fetchPlaylist(playlist: string): Promise<PlaylistResponse | null> {
  const cached = await getPlaylistFromCache(playlist);
  if (cached) return cached as unknown as PlaylistResponse;

  try {
    const pbApi = new playbackApi({
      baseUrl: "https://edge.api.brightcove.com/playback/v1",
      baseApiParams: {
        headers: { Accept: `application/json;pk=${env.POLICY_KEY}` },
      },
    });
    const res = await pbApi.accounts.getPlaylistsByIdOrReferenceId(env.ACCOUNT_ID, `ref:${playlist}`, {
      limit: 2000,
    });
    return res.ok ? (res.data as PlaylistResponse) : null;
  } catch (error) {
    console.error("fetchPlaylist failed", error);
    return null;
  }
}
