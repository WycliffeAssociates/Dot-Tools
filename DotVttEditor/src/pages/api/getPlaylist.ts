import type { APIRoute } from "astro";
import { fetchPlaylist } from "@lib/routes";

const CORS = { "Access-Control-Allow-Origin": "*" };

export const GET: APIRoute = async (context) => {
  const playlist = context.url.searchParams?.get("playlist");
  if (!playlist) {
    return new Response(null, { status: 400, statusText: "Missing parameters", headers: CORS });
  }

  const data = await fetchPlaylist(playlist);
  if (!data) return new Response(null, { status: 404, headers: CORS });

  return new Response(JSON.stringify(data), { headers: CORS });
};
