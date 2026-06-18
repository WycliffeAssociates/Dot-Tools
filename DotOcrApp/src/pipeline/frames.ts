import { execFile } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH ?? "ffprobe";

export interface ExtractedFrame {
  framePath: string;
  timestampSeconds: number;
}

/** Video duration in seconds via ffprobe. */
export async function getDurationSeconds(videoPath: string): Promise<number> {
  const { stdout } = await exec(FFPROBE, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ]);
  const seconds = Number.parseFloat(stdout.trim());
  return Number.isFinite(seconds) ? seconds : 0;
}

/**
 * Extract frames on a fixed grid (default 1 fps). Frame k (1-based) maps to
 * time (k-1)/fps. This is the reliable workhorse — title cards display for
 * several seconds so a 1s grid catches them.
 */
export async function extractFramesAtFps(
  videoPath: string,
  outDir: string,
  fps = 1,
): Promise<ExtractedFrame[]> {
  await mkdir(outDir, { recursive: true });
  await exec(FFMPEG, [
    "-i",
    videoPath,
    "-vf",
    `fps=${fps}`,
    "-q:v",
    "2",
    join(outDir, "grid-%05d.jpg"),
  ]);
  const files = (await readdir(outDir))
    .filter((f) => f.startsWith("grid-") && f.endsWith(".jpg"))
    .toSorted();
  return files.map((file, idx) => ({
    framePath: join(outDir, file),
    timestampSeconds: idx / fps,
  }));
}

/**
 * Detect black-segment boundaries (cuts between title cards). Returns the
 * timestamps just AFTER each black segment ends — where a new card typically
 * appears. Best-effort: parses ffmpeg's `blackdetect` stderr output.
 */
export async function detectBlackBoundaries(videoPath: string): Promise<number[]> {
  let stderr = "";
  try {
    await exec(FFMPEG, [
      "-i",
      videoPath,
      "-vf",
      "blackdetect=d=0.1:pix_th=0.10",
      "-an",
      "-f",
      "null",
      "-",
    ]);
  } catch (e) {
    // ffmpeg writes blackdetect output to stderr and may exit non-zero on
    // `-f null`; capture stderr from the thrown error.
    stderr = (e as { stderr?: string }).stderr ?? "";
  }
  const boundaries: number[] = [];
  const re = /black_end:(\d+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stderr)) !== null) {
    boundaries.push(Number.parseFloat(m[1]!));
  }
  return boundaries;
}

/** Extract a single frame at a specific timestamp. */
export async function extractFrameAt(
  videoPath: string,
  outDir: string,
  timestampSeconds: number,
): Promise<ExtractedFrame> {
  await mkdir(outDir, { recursive: true });
  const framePath = join(outDir, `at-${timestampSeconds.toFixed(2)}.jpg`);
  await exec(FFMPEG, [
    "-ss",
    String(timestampSeconds),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    "-y",
    framePath,
  ]);
  return { framePath, timestampSeconds };
}
