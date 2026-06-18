import type { PlaylistResponse } from "@customTypes/Api";

export const DOWNLOAD_SERVICE_WORK_URL = "download-video";

export async function getPlaylistData(origin: string, playlist: string, headers: Headers) {
  try {
    const urlToFetch = `${origin}/api/getPlaylist?playlist=${playlist}`;
    console.log(`Calling ${urlToFetch}`);
    const response = await fetch(urlToFetch, {
      headers: headers,
    });
    if (response.ok) {
      const data = response.json() as PlaylistResponse;
      return data;
    }
  } catch (error) {
    console.error("Error thrown in getPlaylistData Catch");
    console.error(error);
    return;
  }
}
