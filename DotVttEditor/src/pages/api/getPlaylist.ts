import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { playbackApi } from "@customTypes/Api";
import { getPlaylistFromCache } from "@lib/playlistCache";

export const GET: APIRoute = async (context) => {
  const url = context.url;
  const playlist = url.searchParams?.get("playlist") as string;
  const policyKey = env.POLICY_KEY;
  const accountId = env.ACCOUNT_ID;

  if (!playlist) {
    return new Response(null, {
      status: 400,
      statusText: "Missing parameters",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Warm-cache read-through first; fall back to a live Playback API fetch below.
  const cached = await getPlaylistFromCache(playlist);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { "Access-Control-Allow-Origin": "*", "X-Cache": "HIT" },
    });
  }

  try {
    const pbApi = new playbackApi({
      baseUrl: "https://edge.api.brightcove.com/playback/v1",
      baseApiParams: {
        headers: {
          Accept: `application/json;pk=${policyKey}`,
        },
      },
    });

    const res = await pbApi.accounts.getPlaylistsByIdOrReferenceId(accountId, `ref:${playlist}`, {
      limit: 2000,
    });
    if (res.ok) {
      return new Response(JSON.stringify(res.data), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      console.log(`404 from not finding playlist`);
      return new Response(null, {
        status: 404,
      });
    }
  } catch (error) {
    console.log(`err thrown in getPlaylist catch`);
    console.error(error);
    return new Response(null, {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
