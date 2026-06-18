import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { BrightcoveClient } from "@dottools/shared";

/**
 * Download the smallest MP4 rendition of a Brightcove video to `destPath`.
 * "Smallest" keeps the network + decode cost low — we only need legible text,
 * not full resolution. Returns the chosen source's byte size.
 */
export async function downloadSmallestMp4(
  bc: BrightcoveClient,
  videoId: string,
  destPath: string,
): Promise<{ sizeBytes: number | undefined }> {
  const source = await bc.getSmallestMp4Source(videoId);
  if (!source?.src) {
    throw new Error(`No MP4 source found for video ${videoId}`);
  }
  await mkdir(dirname(destPath), { recursive: true });
  const resp = await fetch(source.src);
  if (!resp.ok || !resp.body) {
    throw new Error(`Download failed for ${videoId}: ${resp.status} ${resp.statusText}`);
  }
  await pipeline(
    Readable.fromWeb(resp.body as Parameters<typeof Readable.fromWeb>[0]),
    createWriteStream(destPath),
  );
  return { sizeBytes: source.size };
}
