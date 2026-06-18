export interface ReferenceDefaults {
  bookName?: string | undefined;
  chapterNum?: number | undefined;
  verseStart?: number | undefined;
  verseEnd?: number | undefined;
}

const REF_COLON_RE = /(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/;
const REF_SPACE_RE = /(\d{1,3})\s+(\d{1,3})\s*[-–]\s*(\d{1,3})/;
const CHAPTER_ONLY_RE = /(?:^|\s)(\d{1,3})(?:\s|$)/;

const LETTER_CLASS = "A-Za-zÀ-ÿ";

/**
 * True if the text contains an explicit chapter:verse (or chapter verse-verse)
 * reference — not merely a bare chapter number. Used by the OCR pipeline to
 * decide whether a frame is a "clean" reference match vs. noise, since
 * `normalizeReference` always returns *something* (falling back to chapter 1).
 */
export function hasExplicitReference(rawText: string): boolean {
  const cleaned = cleanText(rawText);
  return REF_COLON_RE.test(cleaned) || REF_SPACE_RE.test(cleaned);
}

export function normalizeReference(rawText: string, defaults: ReferenceDefaults = {}): string {
  const cleaned = cleanText(rawText);

  const verseStartDefault = defaults.verseStart ?? 1;
  const verseEndDefault = defaults.verseEnd ?? 12;

  let chapter: number | undefined = defaults.chapterNum;
  let verseStart = verseStartDefault;
  let verseEnd = verseEndDefault;

  const colonMatch = REF_COLON_RE.exec(cleaned);
  if (colonMatch) {
    // Trust the metadata chapter (from custom_fields) when present; OCR only
    // needs to supply the verse range. Falls back to the OCR'd chapter when no
    // chapter default was given.
    chapter = defaults.chapterNum ?? Number.parseInt(colonMatch[1]!, 10);
    verseStart = Number.parseInt(colonMatch[2]!, 10);
    verseEnd =
      colonMatch[3] === undefined
        ? Number.parseInt(colonMatch[2]!, 10)
        : Number.parseInt(colonMatch[3], 10);
  } else {
    const spaceMatch = REF_SPACE_RE.exec(cleaned);
    if (spaceMatch) {
      chapter = defaults.chapterNum ?? Number.parseInt(spaceMatch[1]!, 10);
      verseStart = Number.parseInt(spaceMatch[2]!, 10);
      verseEnd = Number.parseInt(spaceMatch[3]!, 10);
    } else {
      const chapterMatch = CHAPTER_ONLY_RE.exec(cleaned);
      if (chapterMatch && chapter === undefined) {
        chapter = Number.parseInt(chapterMatch[1]!, 10);
      }
    }
  }

  if (chapter === undefined) {
    chapter = 1;
  }

  const book = (defaults.bookName ?? extractBookText(cleaned) ?? "UNKNOWN")
    .replace(/\s+/g, " ")
    .trim();

  return `${book} ${chapter}:${verseStart}-${verseEnd}`;
}

function cleanText(value: string): string {
  let s = value.trim();
  s = s.replaceAll("—", "-").replaceAll("–", "-");
  // Insert space before a digit if preceded by a non-digit char.
  s = s.replace(/(?<=\D)(\d)/g, " $1");
  // Insert space after a digit if followed by a letter.
  s = s.replace(new RegExp(`(\\d)(?=[${LETTER_CLASS}])`, "g"), "$1 ");
  // Insert space between a letter and a digit (belt + suspenders).
  s = s.replace(new RegExp(`([${LETTER_CLASS}])(\\d)`, "g"), "$1 $2");
  // Collapse whitespace runs to a single space.
  s = s.replace(/\s+/g, " ");
  return s;
}

function extractBookText(cleaned: string): string | undefined {
  // 1. Strip explicit chapter:verse(-verse) tokens.
  let book = cleaned.replace(/\d{1,3}\s*[:.]\s*\d{1,3}(?:\s*[-]\s*\d{1,3})?/g, "");
  // 2. Strip bare 1-3 digit numbers.
  book = book.replace(/\b\d{1,3}\b/g, " ");
  // 3. Strip leftover lone hyphens (e.g. the dash from "1 1-5" once "1" and "5"
  //    are gone). Without this we'd return "Genesis -" instead of "Genesis".
  book = book.replace(/(^|\s)-+(\s|$)/g, " ");
  // 4. Collapse whitespace.
  book = book.replace(/\s+/g, " ").trim();
  return book === "" ? undefined : book;
}
