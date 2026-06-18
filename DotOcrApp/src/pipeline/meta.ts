import type { ReferenceDefaults } from "@dottools/shared/reference";
import type { BrightcoveVideo } from "@dottools/shared";

/**
 * Per-playlist default OCR language (ISO 639-1), used when a video's
 * custom_fields don't specify one. Keyed by Brightcove playlist reference_id.
 * Editable without redeploy of the editor — this only affects OCR runs.
 */
export const PLAYLIST_LANGS: Record<string, string> = {
  "benin-new-testament": "fr",
  "ghana-new-testament": "en",
  "cote-d'ivoire-new-testament": "fr",
  "togo-new-testament": "fr",
  "malawi-new-testament": "en",
  "cameroon-new-testament": "fr",
  "tanzania-new-testament": "sw",
  "congo-french-nt": "fr",
  "ase-x-bukavusl": "sw",
  "marathi-nt": "mr",
  "brazil-nt": "pt",
  "pys-nt": "es",
  "ins-x-keralasl": "ml",
};

export interface VideoMeta {
  srclang: string;
  defaults: ReferenceDefaults;
}

/**
 * Resolve OCR language + reference defaults for a video.
 *
 * srclang order: custom_fields → playlist default → global default.
 * Reference defaults (book/chapter hints) come from custom_fields when present
 * — these seed `normalizeReference` so a frame showing only "3:14" can still
 * resolve to "<book> 3:14".
 */
export function resolveVideoMeta(
  video: BrightcoveVideo,
  playlistRef: string,
  defaultLang: string,
): VideoMeta {
  const cf = video.custom_fields ?? {};
  const srclang = cf.srclang ?? cf.language ?? PLAYLIST_LANGS[playlistRef] ?? defaultLang;

  const bookName = cf.localized_book_name ?? cf.book ?? undefined;
  const chapterNum = parseIntOrUndefined(cf.chapter);

  return {
    srclang,
    defaults: {
      bookName,
      chapterNum,
    },
  };
}

function parseIntOrUndefined(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}
