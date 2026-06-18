/**
 * Canonical (Protestant, 66-book) Bible ordering plus tolerant name/abbreviation
 * resolution. Used to sort + group videos in the OCR picker so a whole book can
 * be re-run at once, regardless of whether the PO entered the full English name
 * ("Galatians") or a slug/abbreviation ("gal").
 *
 * Matching is case-insensitive, whitespace- and period-insensitive, and accepts
 * a no-space form (e.g. "1corinthians" === "1 Corinthians"). When a video also
 * carries `custom_fields.canonical_order`, prefer that integer (it is the
 * authoritative source); this table is the fallback when the name is all we have.
 */
export interface BookEntry {
  /** 1-based canonical position (Genesis = 1 … Revelation = 66). */
  order: number;
  /** Display name in English. */
  name: string;
  /** Lowercase aliases (abbreviations / slugs) that resolve to this book. */
  aliases: string[];
}

export const BOOKS: readonly BookEntry[] = [
  { order: 1, name: "Genesis", aliases: ["gen", "ge", "gn"] },
  { order: 2, name: "Exodus", aliases: ["exod", "exo", "ex"] },
  { order: 3, name: "Leviticus", aliases: ["lev", "lv", "le"] },
  { order: 4, name: "Numbers", aliases: ["num", "nm", "nb", "nu"] },
  { order: 5, name: "Deuteronomy", aliases: ["deut", "dt", "de"] },
  { order: 6, name: "Joshua", aliases: ["josh", "jos", "jsh"] },
  { order: 7, name: "Judges", aliases: ["judg", "jdg", "jg"] },
  { order: 8, name: "Ruth", aliases: ["rth", "ru"] },
  { order: 9, name: "1 Samuel", aliases: ["1sam", "1sa", "1sm"] },
  { order: 10, name: "2 Samuel", aliases: ["2sam", "2sa", "2sm"] },
  { order: 11, name: "1 Kings", aliases: ["1kings", "1kgs", "1ki", "1kg"] },
  { order: 12, name: "2 Kings", aliases: ["2kings", "2kgs", "2ki", "2kg"] },
  { order: 13, name: "1 Chronicles", aliases: ["1chronicles", "1chr", "1ch"] },
  { order: 14, name: "2 Chronicles", aliases: ["2chronicles", "2chr", "2ch"] },
  { order: 15, name: "Ezra", aliases: ["ezr"] },
  { order: 16, name: "Nehemiah", aliases: ["neh", "ne"] },
  { order: 17, name: "Esther", aliases: ["esth", "est", "es"] },
  { order: 18, name: "Job", aliases: ["jb"] },
  { order: 19, name: "Psalms", aliases: ["psalm", "ps", "psa", "pss", "psm"] },
  { order: 20, name: "Proverbs", aliases: ["prov", "pro", "prv", "pr"] },
  { order: 21, name: "Ecclesiastes", aliases: ["eccl", "ecc", "eccles", "qoh"] },
  {
    order: 22,
    name: "Song of Solomon",
    aliases: ["songofsolomon", "songofsongs", "song", "sos", "sng", "ss"],
  },
  { order: 23, name: "Isaiah", aliases: ["isa", "is"] },
  { order: 24, name: "Jeremiah", aliases: ["jer", "jr", "je"] },
  { order: 25, name: "Lamentations", aliases: ["lam", "la"] },
  { order: 26, name: "Ezekiel", aliases: ["ezek", "eze", "ezk"] },
  { order: 27, name: "Daniel", aliases: ["dan", "dn", "da"] },
  { order: 28, name: "Hosea", aliases: ["hos", "ho"] },
  { order: 29, name: "Joel", aliases: ["jl"] },
  { order: 30, name: "Amos", aliases: ["am"] },
  { order: 31, name: "Obadiah", aliases: ["obad", "ob"] },
  { order: 32, name: "Jonah", aliases: ["jon", "jnh"] },
  { order: 33, name: "Micah", aliases: ["mic", "mc"] },
  { order: 34, name: "Nahum", aliases: ["nah", "na"] },
  { order: 35, name: "Habakkuk", aliases: ["hab", "hbk"] },
  { order: 36, name: "Zephaniah", aliases: ["zeph", "zep", "zp"] },
  { order: 37, name: "Haggai", aliases: ["hag", "hg"] },
  { order: 38, name: "Zechariah", aliases: ["zech", "zec", "zc"] },
  { order: 39, name: "Malachi", aliases: ["mal", "ml"] },
  { order: 40, name: "Matthew", aliases: ["matt", "mt"] },
  { order: 41, name: "Mark", aliases: ["mk", "mrk"] },
  { order: 42, name: "Luke", aliases: ["lk", "luk"] },
  { order: 43, name: "John", aliases: ["jn", "jhn"] },
  { order: 44, name: "Acts", aliases: ["ac"] },
  { order: 45, name: "Romans", aliases: ["rom", "rm", "ro"] },
  { order: 46, name: "1 Corinthians", aliases: ["1corinthians", "1cor", "1co"] },
  { order: 47, name: "2 Corinthians", aliases: ["2corinthians", "2cor", "2co"] },
  { order: 48, name: "Galatians", aliases: ["gal", "ga"] },
  { order: 49, name: "Ephesians", aliases: ["eph", "ephes"] },
  { order: 50, name: "Philippians", aliases: ["phil", "php", "pp"] },
  { order: 51, name: "Colossians", aliases: ["col", "cl"] },
  { order: 52, name: "1 Thessalonians", aliases: ["1thessalonians", "1thess", "1thes", "1th"] },
  { order: 53, name: "2 Thessalonians", aliases: ["2thessalonians", "2thess", "2thes", "2th"] },
  { order: 54, name: "1 Timothy", aliases: ["1timothy", "1tim", "1ti", "1tm"] },
  { order: 55, name: "2 Timothy", aliases: ["2timothy", "2tim", "2ti", "2tm"] },
  { order: 56, name: "Titus", aliases: ["tit", "ti"] },
  { order: 57, name: "Philemon", aliases: ["philem", "phlm", "phm", "pm"] },
  { order: 58, name: "Hebrews", aliases: ["heb", "hbr"] },
  { order: 59, name: "James", aliases: ["jas", "jm"] },
  { order: 60, name: "1 Peter", aliases: ["1peter", "1pet", "1pe", "1pt"] },
  { order: 61, name: "2 Peter", aliases: ["2peter", "2pet", "2pe", "2pt"] },
  { order: 62, name: "1 John", aliases: ["1john", "1jn", "1jhn"] },
  { order: 63, name: "2 John", aliases: ["2john", "2jn", "2jhn"] },
  { order: 64, name: "3 John", aliases: ["3john", "3jn", "3jhn"] },
  { order: 65, name: "Jude", aliases: ["jud", "jd"] },
  { order: 66, name: "Revelation", aliases: ["rev", "rv", "re", "apocalypse"] },
];

/** Normalize for lookup: lowercase, drop periods, collapse whitespace. */
function norm(value: string): string {
  return value.toLowerCase().replaceAll(".", "").replace(/\s+/g, " ").trim();
}

// One lookup map keyed by every accepted form (full name, no-space name, and
// each alias — plus a no-space variant of each). Built once at module load.
const LOOKUP: Map<string, BookEntry> = (() => {
  const map = new Map<string, BookEntry>();
  const add = (key: string, entry: BookEntry): void => {
    const k = norm(key);
    if (!k) return;
    const existing = map.get(k);
    if (existing && existing !== entry) {
      throw new Error(`Ambiguous book alias "${k}" → ${existing.name} vs ${entry.name}`);
    }
    map.set(k, entry);
  };
  for (const entry of BOOKS) {
    add(entry.name, entry);
    add(entry.name.replace(/\s+/g, ""), entry); // "1 John" → "1john"
    for (const alias of entry.aliases) {
      add(alias, entry);
      add(alias.replace(/\s+/g, ""), entry);
    }
  }
  return map;
})();

/**
 * Resolve a free-text book name or slug to its canonical entry, or `undefined`
 * if it can't be matched. Accepts full names ("Galatians"), slugs ("gal"),
 * spaced/unspaced numbered books ("1 Corinthians" / "1corinthians" / "1cor").
 */
export function resolveBook(value: string | undefined | null): BookEntry | undefined {
  if (!value) return undefined;
  return LOOKUP.get(norm(value));
}

/**
 * Sort key for a video given its Brightcove `custom_fields`. Prefers the
 * authoritative `canonical_order` integer; falls back to resolving the `book`
 * name; returns a large sentinel for anything unrecognized so it sorts last.
 */
export function bookOrderFromFields(
  fields: Record<string, string> | undefined,
): number {
  const explicit = fields?.canonical_order;
  if (explicit) {
    const n = Number.parseInt(explicit, 10);
    if (Number.isFinite(n)) return n;
  }
  return resolveBook(fields?.book)?.order ?? Number.MAX_SAFE_INTEGER;
}
