/**
 * Shape of `DOT_TMP/{videoId}/winners.json` — the provenance sidecar the OCR
 * producer writes and the editor reads. Lets the reviewer see which frame won
 * each cue and why (timestamp, confidence, the parsed reference, raw OCR text).
 *
 * One source of truth for the contract, shared by producer (writer) and editor
 * (reader) so the fields can't drift.
 */
export interface WinnerCue {
  cueIndex: number;
  /** Timestamp of the winning (earliest clean) frame, in seconds. */
  timestampSeconds: number;
  /** Where this cue ends (start of the next cue, or end of video). */
  endSeconds: number;
  /** OCR confidence of the winning frame's reference text, 0–1. */
  confidence: number;
  /** Normalized reference, e.g. "John 3:14-16". */
  parsedReference: string;
  /** Raw OCR text the reference was parsed from. */
  rawOcrText: string;
  /** R2 key (in DOT_TMP) of the winning frame's thumbnail. */
  thumbnailKey: string;
}

export interface WinnersFile {
  videoId: string;
  /** ISO timestamp of the OCR run. */
  generatedAt: string;
  cues: WinnerCue[];
}
