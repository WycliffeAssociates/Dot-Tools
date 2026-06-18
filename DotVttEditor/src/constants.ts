export const BibleBookCategories = {
  OT: [
    "GEN",
    "EXO",
    "LEV",
    "NUM",
    "DEU",
    "JOS",
    "JDG",
    "RUT",
    "1SA",
    "2SA",
    "1KI",
    "2KI",
    "1CH",
    "2CH",
    "EZR",
    "NEH",
    "EST",
    "JOB",
    "PSA",
    "PRO",
    "ECC",
    "SNG",
    "ISA",
    "JER",
    "LAM",
    "EZK",
    "DAN",
    "HOS",
    "JOL",
    "AMO",
    "OBA",
    "JON",
    "MIC",
    "NAM",
    "HAB",
    "ZEP",
    "HAG",
    "ZEC",
    "MAL",
  ],
  NT: [
    "MAT",
    "MRK",
    "LUK",
    "JHN",
    "ACT",
    "ROM",
    "1CO",
    "2CO",
    "GAL",
    "EPH",
    "PHP",
    "COL",
    "1TH",
    "2TH",
    "1TI",
    "2TI",
    "TIT",
    "PHM",
    "HEB",
    "JAS",
    "1PE",
    "2PE",
    "1JN",
    "2JN",
    "3JN",
    "JUD",
    "REV",
  ],
};
interface sortOrderI {
  [key: string]: number;
}
const bibleBookSortOrder = Object.values(BibleBookCategories)
  .flat()
  .reduce((acc: sortOrderI, value: string, index: number) => {
    acc[value] = index + 1;
    return acc;
  }, {});
export { bibleBookSortOrder };

export function getBibleBookSort(bookSlug: string) {
  const normalized = bookSlug.normalize().toUpperCase();
  const sortOrder = bibleBookSortOrder[normalized];
  return sortOrder;
}

export const PLAYER_LOADER_OPTIONS = {
  // refNode: playerRef,
  refNodeInsert: "replace",
  controls: true,
  embedType: "in-page",
  options: {
    responsive: true,
    fluid: true,
    fill: true,
    controls: true,
    playbackRates: [0.5, 1, 1.5, 2, 2.5],
    preload: "auto",
    fullscreen: {
      navigationUI: "show",
    },
  },
  // id: 6312743832112,
  // videoId: currentVid().id,
};
export const SW_CACHE_NAME = "dot-downloads";
