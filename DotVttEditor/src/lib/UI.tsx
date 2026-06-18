import type {
  IVidWithCustom,
  IpopulateSwPayload,
  customVideoSources,
  userPreferencesI,
  wholeBookPresets,
  chapterMarkers,
} from "@customTypes/types";
import { type Setter } from "solid-js";
// typings sort of messed in v8 of the lib. uphttps://github.com/videojs/video.js/issues/8109
import type Player from "video.js/dist/types/player";
import webVttPkg from "webvtt-parser";
const { WebVTTParser } = webVttPkg;

import {
  currentBook,
  currentVid,
  setCurrentBook,
  setCurrentChapLabel,
  setCurrentVid,
  setDownloadPreference,
  vidProgress,
  vjsPlayer,
} from "@lib/store";
import { cleanUpOldChapters } from "@components/Player/ChapterMarker";
import { formatDuration } from "./utils";
import { SW_CACHE_NAME } from "src/constants";

export const CONTAINER = "max-w-[1000px] mx-auto";
// @unocss-include
export const mobileHorizontalPadding = "px-3";
export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  wait: number,
): ((...args: T) => void | undefined) => {
  let timeoutId: number | null = null;
  return (...args: T) => {
    if (!import.meta.env.SSR) {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback(...args);
      }, wait);
    }
  };
};

export function getJsonFromDocCookie(key?: string): userPreferencesI | null {
  const keyToUse = key || "userPreferences";
  const cookieVal = document.cookie
    .split(";")
    ?.find((row) => row.replaceAll(" ", "").startsWith(keyToUse))
    ?.split("=")?.[1];
  if (!cookieVal) return null;
  let parsedObj: object | null = null;
  try {
    parsedObj = JSON.parse(cookieVal);
  } catch (error) {
    console.error(error);
  }
  return parsedObj;
}

export function setCookie(value: string, key?: string): void {
  const keyToUse = key || "userPreferences";

  const defaultCookiesOptions = {
    expires: new Date("01-18-2038").toUTCString(),
    path: "/",
    secure: true,
    sameSite: "strict",
  };
  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies cookie prefxies

  const cookieString =
    `${keyToUse}=${value};` +
    `expires=${defaultCookiesOptions.expires};` +
    defaultCookiesOptions.path +
    +(defaultCookiesOptions.secure ? `secure;` : "") +
    (defaultCookiesOptions.sameSite ? `sameSite=${defaultCookiesOptions.sameSite};` : "");

  document.cookie = cookieString;
}

interface playerCustomHotKeysParams {
  e: KeyboardEvent;
  vjsPlayer: Player;
  increment: number;
  setJumpingBackAmount: Setter<unknown>;
  setJumpingForwardAmount: Setter<unknown>;
}
export function playerCustomHotKeys({
  e,
  vjsPlayer: player,
  increment,
  setJumpingBackAmount,
  setJumpingForwardAmount,
}: playerCustomHotKeysParams) {
  const currentTime = player.currentTime();
  let uiJumpingTimeout: number | null = null;
  if (!currentTime) return;
  switch (e.key) {
    case "ArrowLeft":
      player.currentTime(currentTime - increment);
      setJumpingBackAmount(formatDuration((currentTime - increment) * 1000));
      if (uiJumpingTimeout) {
        window.clearTimeout(uiJumpingTimeout);
      }
      uiJumpingTimeout = window.setTimeout(() => {
        setJumpingBackAmount(null);
      }, 250);
      break;
    case "ArrowRight":
      player.currentTime(currentTime + increment);
      setJumpingForwardAmount(formatDuration((currentTime + increment) * 1000));
      if (uiJumpingTimeout) {
        window.clearTimeout(uiJumpingTimeout);
      }
      uiJumpingTimeout = window.setTimeout(() => {
        setJumpingForwardAmount(null);
      }, 250);
      break;
    default:
      break;
  }
}

export function handleColorSchemeChange(e: MediaQueryListEvent, setPrefersDark: Setter<boolean>) {
  const htmlElement = document.querySelector("html") as HTMLHtmlElement;
  const currCookie: userPreferencesI = getJsonFromDocCookie() || {};
  if (e.matches) {
    htmlElement.classList.add("dark");
    setPrefersDark(true);
    // write prefersDark True to cookie
    const darkCookie: userPreferencesI | null = getJsonFromDocCookie();

    if (darkCookie) {
      darkCookie.prefersDark = true;
    }
  } else {
    htmlElement.classList.remove("dark");
    setPrefersDark(false);
    const lightCookie: userPreferencesI | null = getJsonFromDocCookie();
    if (lightCookie) {
      lightCookie.prefersDark = false;
    }
    // write prefersDark False to cookie
  }
  // write out cookie on change;
  setCookie(JSON.stringify(currCookie).trim());
}
export function setUpThemeListener(setPrefersDark: Setter<boolean>) {
  if (import.meta.env.SSR) return;
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const htmlElement = document.querySelector("html") as HTMLHtmlElement;

  if (
    darkModeMediaQuery.matches &&
    !htmlElement.classList.contains("light") &&
    !htmlElement.classList.contains("dark")
  ) {
    htmlElement.classList.add("dark");
    const currCookie: userPreferencesI = getJsonFromDocCookie() || {};
    currCookie.prefersDark = true;
    setCookie(JSON.stringify(currCookie).trim());
    setPrefersDark(true);
  }
  return darkModeMediaQuery;
}
export function updateCookiePrefByKey<K extends keyof userPreferencesI>(
  key: K,
  val: userPreferencesI[K],
) {
  const currCookie: userPreferencesI = getJsonFromDocCookie() || {};
  currCookie[key] = val;
  setCookie(JSON.stringify(currCookie).trim());
}

export function changeVid(chapNum: string | null | undefined) {
  const cb = currentBook();
  if (!chapNum || !cb) return;
  const newVid = cb.find((vid) => vid.chapter == chapNum);
  if (newVid) {
    setCurrentVid(newVid);
  }
}

export function changePlayerSrc(vid: IVidWithCustom, _vttText?: string) {
  const plyr = vjsPlayer();
  if (!plyr) return;
  changeVid(vid.chapter);
  const httpsOnly = vid.sources.filter((srcObj) => srcObj.src.startsWith("https"));

  // setVjsPlayer(
  //   produce((state) => {
  //     batch(() => {
  //       state!.poster(vid.poster);
  //       state!.src(httpsOnly);
  //       state!.load();
  //     });
  //     // return state;
  //   })
  // );
  plyr.src(httpsOnly);
  plyr.poster(vid.poster);
  plyr.load();
  // setVjsPlayer(clone);
}

export async function fetchRemoteChaptersFile(src: string) {
  try {
    const chapterVttRes = await fetch(src);
    const chapterVtt = await chapterVttRes.text();
    return chapterVtt;
  } catch (error) {
    console.error(error);
    return;
  }
}
function distributeChapterMarkers(markers: chapterMarkers) {
  const plyr = vjsPlayer();
  if (!plyr || import.meta.env.SRR) return;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore  - controlBar does exist.  Typings are wrong
  const sb = plyr.controlBar?.progressControl?.seekBar?.el();
  markers.forEach((marker) => {
    let span = document.createElement("span");
    span.dataset.role = "chapterMarker";
    span.classList.add("w-1", "h-full", "inline-block", "bg-primary", "absolute");
    span.style.left = `${marker.xPos}%`;
    // const chapMarker = <ChapterMarker leftAmt={marker.xPos} />;
    sb.appendChild(span);
  });
}

export async function getChaptersArrFromVtt(vid: IVidWithCustom, vttText?: string) {
  cleanUpOldChapters();
  let chapterVtt: string | undefined;
  let plyr = vjsPlayer();
  if (!plyr) return;
  if (vttText) {
    if (!plyr) return;
    chapterVtt = vttText;
  } else {
    const chapterObj = vid.text_tracks?.find((tt) => tt.kind === "chapters");
    if (!chapterObj || !chapterObj.src || !chapterObj.sources) {
      setCurrentVid("chapterMarkers", []);
      return;
    }
    const srcToFetch = chapterObj.sources.find((srcO) => srcO.src?.startsWith("https"));
    if (!srcToFetch || !srcToFetch.src) return;
    if (vid.chapterMarkers) return vid.chapterMarkers;
    if (!plyr) return;
    chapterVtt = await fetchRemoteChaptersFile(srcToFetch.src);
    if (!chapterVtt) {
      setCurrentVid("chapterMarkers", []);
      return;
    }
  }
  const labelRegex = /(?:\d? ?\w+ ?\d*:)(\d+)-(\d+)/;
  /*
  These should all match: optional digit, optional space, arbitrary num letters, optional space, 1+ number, colon (required), capture all digits after the colon, and be followed by a - and arbitrary digit numbes. 
  2 Pierre 2:1-3
John 2:1-3
2Pierre2:1-3
Luc2:17-28
  */

  const parser = new WebVTTParser();
  const tree = parser.parse(chapterVtt);
  const vttChapsArr = tree.cues.map((cue) => {
    const labelMatches = cue.text.match(labelRegex);
    const totalDur = (vid.duration ?? 0) / 1000;
    const xPos = String((cue.startTime / totalDur) * 100);

    return {
      chapterStart: cue.startTime,
      chapterEnd: cue.endTime,
      label: cue.text,
      startVerse: labelMatches ? labelMatches[1] : null,
      endVerse: labelMatches ? labelMatches[2] : null,
      xPos: xPos,
    };
  });
  setCurrentVid("chapterMarkers", vttChapsArr);
  return vttChapsArr;
}
export async function handleChapters(vid: IVidWithCustom, vttText?: string) {
  const chapters = await getChaptersArrFromVtt(vid, vttText);
  if (!chapters) return;
  distributeChapterMarkers(chapters);
}
export async function handleVerseProvidedInRouting(vid: IVidWithCustom, routingVerse: string) {
  const numRouting = Number(routingVerse);
  if (!numRouting) return;
  const chapters = await getChaptersArrFromVtt(vid);
  if (!chapters || !chapters.length) return;
  const applicableChapter = chapters.find((chapter) => {
    return Number(chapter.startVerse) <= numRouting && Number(chapter.endVerse) >= numRouting;
  });
  return applicableChapter ? applicableChapter : null;
}

export function getChapterText(timeInSeconds: number) {
  const cVid = currentVid;
  if (!cVid || !cVid.chapterMarkers) return;
  const currentChap = cVid.chapterMarkers.find((marker) => {
    return timeInSeconds >= marker.chapterStart && timeInSeconds < marker.chapterEnd;
  });
  if (!currentChap) return;
  return currentChap.label;
}

export function trackAdjacentChap() {
  // A hack to make this function a tracker of progress. do not delete.  Ideally the progress would be updated as a store signal, but the BC player has its own events that are pushed as a store.
  // Read for its reactive tracking side-effect; the value itself is unused.
  vidProgress();
  const next = getAdjacentChap("NEXT");
  const prev = getAdjacentChap("PREV");
  return { next, prev };
}

export function getAdjacentChap(dir: "NEXT" | "PREV") {
  const player = vjsPlayer();
  const currVid = currentVid;
  if (!player || !currVid) return;
  const currentTime = player.currentTime();
  if (currentTime !== 0 && !currentTime) return;

  if (dir == "NEXT") {
    const nextStart = currVid.chapterMarkers?.find((marker) => marker.chapterStart > currentTime);
    return nextStart || undefined;
  } else if (dir == "PREV") {
    const candidates = currVid.chapterMarkers?.filter((marker) => {
      return marker.chapterStart + 3 < currentTime;
    });
    if (!candidates || !candidates.length) return undefined;
    const prevStart = candidates.reduce((acc, current) => {
      return acc.chapterEnd > current.chapterEnd ? acc : current;
    });
    return prevStart || undefined;
  }
}
export function jumpToNextChap(dir: "NEXT" | "PREV") {
  if (dir == "NEXT") {
    const nextStart = getAdjacentChap("NEXT");
    if (nextStart) {
      vjsPlayer()?.currentTime(nextStart.chapterStart);
    }
  } else if (dir == "PREV") {
    const prevStart = getAdjacentChap("PREV");
    if (prevStart) {
      vjsPlayer()?.currentTime(prevStart.chapterStart);
    }
  }
}
export function setNewBook(vids: IVidWithCustom[], vttText?: string) {
  setCurrentBook(vids);
  const firstBook = vids[0];
  setCurrentVid(firstBook);
  changePlayerSrc(firstBook, vttText);
}
export const getAllMp4sForBook = (preset: wholeBookPresets) => {
  const currBook = currentBook();
  if (!currBook) return;

  // {name:"higher quality", [srcs]}
  const mp4SrcObjects = currBook.reduce((acc: customVideoSources[], curr) => {
    const mp4s = curr.sources?.filter(
      (src) => src.container === "MP4" && src.src.includes("https"),
    );
    let srcToUse = mp4s[0];
    if (preset === "BIG") {
      srcToUse = mp4s.reduce((maxObject, currentObject) => {
        if (!maxObject.size) return currentObject;
        if (!currentObject.size) return maxObject;
        if (!maxObject) {
          maxObject = currentObject;
          return maxObject;
        }
        if (currentObject.size > maxObject.size) {
          return currentObject;
        } else {
          return maxObject;
        }
      });
    } else if (preset === "SMALL") {
      srcToUse = mp4s.reduce((minObject, currentObject) => {
        if (!minObject.size) return currentObject;
        if (!currentObject.size) return minObject;
        if (!minObject) {
          minObject = currentObject;
          return minObject;
        }
        if (currentObject.size < minObject.size) {
          return currentObject;
        } else {
          return minObject;
        }
      });
    }
    if (!srcToUse) return acc;
    srcToUse.name = `${curr.book}-${curr.chapter}`;
    srcToUse.refId = String(curr.reference_id);
    acc.push(srcToUse);
    return acc;
  }, []);

  if (!mp4SrcObjects || !mp4SrcObjects.length) return;
  return mp4SrcObjects;
};

export const wholeBooksOptionsForSelect = () => {
  const currBook = currentBook();
  if (!currBook) return;
  const largestSizes = currBook.map((obj) =>
    Math.max(...obj.sources.map((src) => (src.size ? src.size : 0))),
  );
  const smallestSizes = currBook.map((obj) =>
    Math.min(
      ...obj.sources.filter((src) => !!src.size).map((src) => (src.size ? src.size : Infinity)),
    ),
  );
  const totalSizeOfLargest = largestSizes.reduce((sum, size) => sum + size, 0);
  const totalSizeOfSmallest = smallestSizes.reduce((sum, size) => sum + size, 0);

  const result: {
    size: string;
    totalSize: number;
    wholeBooksOptionsForSelectId: wholeBookPresets;
  }[] = [
    {
      size: "biggest",
      totalSize: totalSizeOfLargest,
      wholeBooksOptionsForSelectId: "BIG",
    },
    {
      size: "smallest",
      totalSize: totalSizeOfSmallest,
      wholeBooksOptionsForSelectId: "SMALL",
    },
  ];
  return result;
};

export const currentMp4Sources = () => {
  const currVid = currentVid;
  if (!currVid) return;
  const mp4Srces = currVid.sources?.filter(
    (source) => source.container === "MP4" && source.src?.includes("https"),
  );

  const dedupedSizeChecker: number[] = [];
  const dedupedMp4s = mp4Srces.filter((src) => {
    if (!src.size) return false;
    if (dedupedSizeChecker.includes(src.size)) {
      return false;
    } else {
      dedupedSizeChecker.push(src.size);
      return true;
    }
  });

  dedupedMp4s.forEach((mp4) => {
    setCurrentVid("sources", (srcArr) => srcArr.src === mp4.src, {
      name: `${currVid.book}-${currVid.chapter}`,
      refId: String(currVid.reference_id),
    });
  });
  return dedupedMp4s;
};

export function populateSwPayload({ type, val }: IpopulateSwPayload) {
  if (type === "VID") {
    const currMp4s = currentMp4Sources();
    if (!currMp4s || !currMp4s.length) return;
    const matching = currMp4s.find((source) => String(source.size) === val);
    setDownloadPreference((prev) => {
      return {
        ...prev,
        swPayload: [matching],
      };
    });
  } else if (type === "BOOK") {
    const videoSources = getAllMp4sForBook(val);
    if (!videoSources || !videoSources.length) return;
    setDownloadPreference((prev) => {
      return {
        ...prev,
        swPayload: videoSources,
      };
    });
  }
}

export function handleProgressBarHover(event: Event) {
  const player = vjsPlayer();
  if (!player) return;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore  - controlBar does exist.  Typings are wrong
  const seekBar = player.controlBar?.progressControl?.seekBar;
  const currentToolTip = document.querySelector(
    ".vjs-progress-control .vjs-mouse-display",
  ) as Element;

  const distance = seekBar.calculateDistance(event);
  const totalDur = player.duration();
  const time = distance * (totalDur ?? 0);
  const chapLabel = getChapterText(time);
  if (chapLabel && currentToolTip) {
    setCurrentChapLabel(chapLabel);
  } else {
    setCurrentChapLabel("");
  }
}

export function handlePlayRateChange(event: Event) {
  const player = vjsPlayer();
  const target = event.target as HTMLInputElement;
  if (!player) return;
  player.playbackRate(Number(target.value));
  const currCookie = getJsonFromDocCookie() || {};
  currCookie.playbackSpeed = String(target.value);
  setCookie(JSON.stringify(currCookie));
}
export async function getSavedResponseFromCache(vid: IVidWithCustom | undefined) {
  const falsy = {
    response: null,
    isSaved: false,
  };
  if (import.meta.env.SSR) return falsy;
  if (!vid || !vid.reference_id) return falsy;
  const cache = await caches.open(SW_CACHE_NAME);
  const match = await cache.match(`/${vid.reference_id}`);
  if (!match || (match && match.status != 200)) {
    return falsy;
  } else
    return {
      response: match,
      isSaved: true,
    };
}

export function manageShowingChapterArrows(
  refRect: DOMRect | undefined,
  setterFxn: Setter<boolean>,
) {
  if (!refRect) return;
  const chapterBtnTrack = document.querySelector(
    '[data-js="chapterButtonTrack"]',
  ) as HTMLUListElement;
  if (!chapterBtnTrack) return;
  if (chapterBtnTrack.scrollWidth > refRect.width) {
    setterFxn(true);
  } else {
    setterFxn(false);
  }
}

interface IhandleVideoJsTaps {
  el: Element;
  leftDoubleFxn: (number: number) => void;
  rightDoubleFxn: (number: number) => void;
  singleTapFxn: () => void;
  doubleTapUiClue: (dir: "LEFT" | "RIGHT" | null, tapCount: number) => void;
}
export function handleVideoJsTaps({
  el,
  leftDoubleFxn,
  rightDoubleFxn,
  singleTapFxn,
  doubleTapUiClue,
}: IhandleVideoJsTaps) {
  let tapCount = 0;
  let tapTimer: number | undefined;
  let lastTapTimestamp = 0;
  let tapX: number;
  let tapSide: "LEFT" | "RIGHT" | null;

  // Threshold in milliseconds to differentiate between taps and double taps
  const thresholdMilliseconds = 250;
  const singleThresholdMilliseconds = 50;

  function handleTap(event: TouchEvent) {
    const target = event.target as HTMLElement;
    const wasOnVideo = target && target.nodeName === "VIDEO";
    if (event.touches.length === 1 && wasOnVideo) {
      el.classList.add("vjs-user-active");
      lastTapTimestamp = event.timeStamp;
      const tapEvent = event.touches[0];
      const boundingRect = target.getBoundingClientRect();
      tapX = tapEvent.clientX - boundingRect.left;
      const leftThreshold = boundingRect.width * 0.3;
      const rightThreshold = boundingRect.width * 0.7;
      tapCount += 1;
      if (tapX <= leftThreshold) {
        tapSide = "LEFT";
      } else if (tapX >= rightThreshold) {
        tapSide = "RIGHT";
      }
    }
  }
  function handleTouchEnd(event: TouchEvent) {
    const currentTimestamp = event.timeStamp;
    // super fast touches likely doubles.
    if (tapCount === 1 && currentTimestamp - lastTapTimestamp < singleThresholdMilliseconds) {
      // single tap too brief -- clear"
      clearTapData();
    } else if (tapCount === 1) {
      // exec single tap
      tapTimer = window.setTimeout(() => {
        // exec single tap then clear
        singleTapFxn();
        clearTapData();
      }, thresholdMilliseconds);
    } else if (tapCount > 1) {
      window.clearTimeout(tapTimer);
      doubleTapUiClue(tapSide, tapCount);
      tapTimer = window.setTimeout(() => {
        if (tapSide === "LEFT") {
          leftDoubleFxn(tapCount);
        } else if (tapSide === "RIGHT") {
          rightDoubleFxn(tapCount);
        }
        // if Tapcount 0: clear all
        // if 1: exec single tap
        // if 2: exec double tap
        clearTapData();
      }, thresholdMilliseconds);
    }
    // otherwise
  }

  // Function to clear tap count and timestamps
  function clearTapData() {
    window.clearTimeout(tapTimer);
    tapCount = 0;
    lastTapTimestamp = 0;
    tapSide = null;
  }

  // target.nodeName="VIDEO"
  //       const tapX = event.tagetTouches[0].clientX - boundingClient.left;
  //
  // if so, e.target.getBoundingClientRect
  // bottom, height, left, right, top, width, x, y
  // Determine if the tap occurred within 30% of the left or right edge of the bounding client
  // const leftThreshold = boundingClientWidth * 0.3;
  // const rightThreshold = boundingClientWidth * 0.7;
  el.addEventListener("touchstart", (e) => handleTap(e as TouchEvent));
  el.addEventListener("touchend", (e) => handleTouchEnd(e as TouchEvent));
  // el.addEventListener("touchcancel", clearTapData);
}
