import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { IDownloadPreferences, IVidWithCustom } from "@customTypes/types";
import type Player from "video.js/dist/types/player";

const [downloadPreference, setDownloadPreference] = createSignal<IDownloadPreferences>({
  saveToServiceWorker: false,
  downloadOffline: true,
  justThisVideo: true,
  swPayload: null /* arr of vid {name, refid, src, size} objects that sw can digest */,
});
// SSR will populate this when it renders.
const [currentVid, setCurrentVid] = createStore<IVidWithCustom>({} as IVidWithCustom);
const [currentPlaylist, setCurrentPlaylist] =
  createSignal<Record<string | number | symbol, IVidWithCustom[]>>();
const [vidProgress, setVidProgress] = createSignal(0);
const [currentBook, setCurrentBook] = createSignal<IVidWithCustom[]>();
const [currentChapLabel, setCurrentChapLabel] = createSignal("");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const [vjsPlayer, setVjsPlayer] = createSignal<Player>();
const [showDownloadMenu, setShowDownloadMenu] = createSignal(false);
const [playerSpeed, setPlayerSpeed] = createSignal<string>();

export {
  vidProgress,
  setVidProgress,
  downloadPreference,
  setDownloadPreference,
  currentVid,
  setCurrentVid,
  currentBook,
  setCurrentBook,
  currentChapLabel,
  setCurrentChapLabel,
  vjsPlayer,
  setVjsPlayer,
  showDownloadMenu,
  setShowDownloadMenu,
  playerSpeed,
  setPlayerSpeed,
  currentPlaylist,
  setCurrentPlaylist,
};
