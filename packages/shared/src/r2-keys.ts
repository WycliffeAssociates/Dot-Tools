/**
 * The single canonical VTT per video — written by OCR, edited in the editor,
 * and pulled by Brightcove on publish. There is intentionally no separate
 * seed/draft/ingest-stage copy: one file is the source of truth, and rerunning
 * OCR overwrites it (see DotOcrApp README).
 */
export const vttKey = (playlist: string, videoId: string): string =>
  `${playlist}/${videoId}.vtt`;

export const thumbKey = (videoId: string, cueIndex: number): string => `${videoId}/${cueIndex}.jpg`;

export const winnersJsonKey = (videoId: string): string => `${videoId}/winners.json`;

export const completedJsonKey = (playlist: string): string => `${playlist}/completed.json`;
