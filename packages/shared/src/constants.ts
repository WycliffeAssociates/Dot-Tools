export const VTT_TRACK_CONSTANTS = Object.freeze({
  kind: "chapters",
  label: "Verse Markers",
  default: true,
  status: "published",
  embed_closed_caption: false,
} as const);

export type VttTrackConstants = typeof VTT_TRACK_CONSTANTS;

export const DEFAULT_SRCLANG = "en";

export const VTT_CONTENT_TYPE = "text/vtt";
