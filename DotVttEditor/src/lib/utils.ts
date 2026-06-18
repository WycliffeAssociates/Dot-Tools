import type { IVidWithCustom, userPreferencesI } from "@customTypes/types";
import type { AstroGlobal } from "astro";
import { getBibleBookSort } from "src/constants";
import { baseLocale, supportedLanguages } from "@i18n/index";

export function formatDuration(milliseconds: number) {
  // Convert milliseconds to seconds
  const seconds = Math.floor(milliseconds / 1000);

  // Calculate hours, minutes, and remaining seconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Format the time string and trim leading zeros
  let timeString = "";

  if (hours > 0) {
    timeString = `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  if (hours == 0 || minutes > 0) {
    timeString = `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    timeString = `0:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return timeString;
}

export function convertToValidFilename(string: string) {
  return string.replace(/[/|\\:*?"<>]/g, " ").replace(" ", "_");
}
export function normalizeBookName(bookname: string | undefined) {
  if (!bookname) return "";
  const parts = bookname.split(/(\d+)/).filter((r) => !!r); // Split on any digits
  if (parts.length > 1) {
    const secondPart = upperFirstLowerRest(parts[1]);
    return `${parts[0]} ${secondPart}`;
  } else return upperFirstLowerRest(bookname);
}
export function upperFirstLowerRest(bookName: string) {
  return `${bookName.trim().slice(0, 1).toUpperCase()}${bookName.trim().slice(1).toLowerCase()}`;
}

export function convertTimeToSeconds(timeStr: string): number {
  const [mins, secs] = timeStr.split(":").map(Number);
  const milliseconds = Number(timeStr.split(".")[1]);
  return mins * 60 + secs + milliseconds / 1000;
}
export function bytesToMb(bytes: number | undefined) {
  if (!bytes) return "";
  const val = Math.round(bytes / 1000 / 1000);
  return String(val);
}

export function groupObjectsByKey<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends { [key: string]: any },
  K extends keyof T,
>(objects: T[], key: K): Record<T[K], T[]> {
  const groups = {} as Record<T[K], T[]>;

  // Iterate over each object in the array
  objects.forEach((object) => {
    // Get the value of the specified key
    const value = object[key];

    // If there is no group for the value, create one
    if (!groups[value]) {
      groups[value] = [];
    }

    // Add the object to the corresponding group
    groups[value].push(object);
  });
  return groups;
}

export function getUserPreferences(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AstroObj: AstroGlobal,
): userPreferencesI | undefined {
  if (AstroObj.cookies.has("userPreferences")) {
    const cookie = AstroObj.cookies.get("userPreferences")?.json();
    return cookie as userPreferencesI;
  }
}
export function getPreferredLangFromHeader(request: Request) {
  if (!request) return baseLocale;
  const langs = request.headers.get("Accept-Language");
  if (!langs) return baseLocale;
  const langsArr = langs.split(",").map((lang) => {
    const arr = lang.split(";");
    return arr[0];
  });
  let preferredLocale = baseLocale; //default
  for (let i = 0; i < langsArr.length; i++) {
    //   let val = item() as i18nDictSubKeysType
    const langKey = langsArr[i];
    const matchedLocale = supportedLanguages.find((locale) => locale.code === langKey);
    if (matchedLocale) {
      preferredLocale = langKey;
      break;
    } else continue;
  }
  return preferredLocale;
}
export function mutateSortVidsArray(vids: IVidWithCustom[]) {
  type accType = {
    matching: IVidWithCustom[];
    notMatching: IVidWithCustom[];
  };
  const filteredByMatchingReferenceId = vids.reduce(
    (accumulator: accType, current) => {
      if (current.custom_fields?.book && current.custom_fields?.chapter) {
        accumulator.matching.push(current);
      } else {
        accumulator.notMatching.push(current);
      }
      return accumulator;
    },
    {
      matching: [],
      notMatching: [],
    },
  );
  const sortedVids = filteredByMatchingReferenceId.matching.toSorted((a, b) => {
    const aCustomBook = a.custom_fields?.book;
    const bCustomBook = b.custom_fields?.book;
    if (!aCustomBook || !bCustomBook) return 0;
    const aBookSort = getBibleBookSort(aCustomBook);
    const bBookSort = getBibleBookSort(bCustomBook);
    const aChap = Number(a.custom_fields?.chapter);
    const bChap = Number(b.custom_fields?.chapter);
    let retVal;
    if (aBookSort == bBookSort) {
      retVal = aChap < bChap ? -1 : aChap == bChap ? 0 : 1;
    } else {
      retVal = aBookSort < bBookSort ? -1 : aBookSort == bBookSort ? 0 : 1;
    }
    return retVal;
  });

  sortedVids.forEach((vid, idx) => {
    vid.originalIdx = idx;
    vid.slugName = convertToValidFilename(String(vid.name));
    vid.book = vid.custom_fields?.book?.toUpperCase();
    vid.chapter = vid.custom_fields?.chapter;
    vid.localizedBookName =
      vid.custom_fields?.localized_book_name || vid.custom_fields?.book?.toUpperCase();
    // vid.localizedBookName = vid.custom_fields?.lo
  });
  return { sortedVids, filteredByMatchingReferenceId };
}

export function secondsToVttString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);

  return (
    [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":") + `.${millis.toString().padStart(3, "0")}`
  );
}
