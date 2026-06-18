import {
  hasExplicitReference,
  normalizeReference,
  type ReferenceDefaults,
} from "@dottools/shared/reference";
import type { OcrWord } from "../ocr/index.ts";

/** OCR result for a single extracted frame. */
export interface FrameOcr {
  timestampSeconds: number;
  framePath: string;
  words: OcrWord[];
}

/** A frame whose text contains a clean, high-confidence Bible reference. */
export interface FrameMatch {
  timestampSeconds: number;
  framePath: string;
  reference: string;
  confidence: number;
  rawText: string;
}

/** The chosen cue + the frame that won it (for the editor's thumbnail strip). */
export interface CueWinner {
  cueIndex: number;
  reference: string;
  startSeconds: number;
  endSeconds: number;
  winnerTimestampSeconds: number;
  winnerFramePath: string;
  confidence: number;
  rawOcrText: string;
}

export interface SelectOptions {
  /** Minimum OCR confidence (0–1) for a frame to count as a clean match. */
  minConfidence?: number;
  /** Per-video hints (book/chapter/verse defaults) from custom_fields. */
  defaults?: ReferenceDefaults;
  /** Total video duration, used to close the final cue. */
  videoDurationSeconds: number;
}

/**
 * Turn per-frame OCR into cues, choosing for each distinct reference the
 * EARLIEST frame that cleanly parses above the confidence threshold.
 *
 * Why "earliest clean": title cards fade in, so the first frames where text is
 * detectable are often partial/garbled. We don't want the cue to start on that
 * noise — we anchor it to the earliest frame that yields a *complete* parse
 * (explicit chapter:verse) with sufficient confidence. The cue then runs until
 * the next reference begins (or end of video).
 */
export function selectCues(frames: FrameOcr[], opts: SelectOptions): CueWinner[] {
  const minConfidence = opts.minConfidence ?? 0.6;
  const defaults = opts.defaults ?? {};

  // 1) Reduce each frame to its best clean reference match (if any).
  const matches: FrameMatch[] = [];
  for (const frame of frames) {
    const match = bestMatchForFrame(frame, minConfidence, defaults);
    if (match) matches.push(match);
  }

  // 2) Sort by time and collapse consecutive runs of the same reference,
  //    keeping the earliest (= first) frame of each run as the winner.
  matches.sort((a, b) => a.timestampSeconds - b.timestampSeconds);

  const winners: Array<Omit<CueWinner, "cueIndex" | "endSeconds">> = [];
  let lastRef: string | null = null;
  for (const m of matches) {
    if (m.reference === lastRef) continue; // same run → earliest already kept
    winners.push({
      reference: m.reference,
      startSeconds: m.timestampSeconds,
      winnerTimestampSeconds: m.timestampSeconds,
      winnerFramePath: m.framePath,
      confidence: m.confidence,
      rawOcrText: m.rawText,
    });
    lastRef = m.reference;
  }

  // 3) Close each cue at the next cue's start (last one at end of video).
  return winners.map((w, i) => ({
    cueIndex: i,
    ...w,
    endSeconds: i + 1 < winners.length ? winners[i + 1]!.startSeconds : opts.videoDurationSeconds,
  }));
}

/**
 * Best clean reference for one frame, or null. "Clean" = the combined frame
 * text contains an explicit chapter:verse AND the words contributing digits
 * clear the confidence bar. Confidence reported is the min across the
 * reference-bearing words (a reference is only as trustworthy as its weakest
 * digit).
 */
function bestMatchForFrame(
  frame: FrameOcr,
  minConfidence: number,
  defaults: ReferenceDefaults,
): FrameMatch | null {
  // Consider each line/word individually first (a reference usually sits on one
  // line), then the whole-frame join as a fallback.
  const candidates = [
    ...frame.words.map((w) => ({ text: w.text, confidence: w.confidence })),
    {
      text: frame.words.map((w) => w.text).join(" "),
      confidence: minOf(frame.words.map((w) => w.confidence)),
    },
  ];

  let best: FrameMatch | null = null;
  for (const c of candidates) {
    if (!hasExplicitReference(c.text)) continue;
    if (c.confidence < minConfidence) continue;
    const reference = normalizeReference(c.text, defaults);
    if (reference.startsWith("UNKNOWN")) continue; // need a real book name
    if (!best || c.confidence > best.confidence) {
      best = {
        timestampSeconds: frame.timestampSeconds,
        framePath: frame.framePath,
        reference,
        confidence: c.confidence,
        rawText: c.text,
      };
    }
  }
  return best;
}

function minOf(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => Math.min(a, b), Infinity);
}
