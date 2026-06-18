/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Video, VideoSources } from "./Api";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: Record<string, any>;
  }
}
export interface IVidWithCustom extends Video {
  book: string | undefined;
  originalIdx?: number | null;
  slugName?: string | null;
  chapter?: string | null;
  localizedBookName: string | undefined;
  custom_fields: Video["custom_fields"] & {
    book?: string;
    chapter?: string;
    country?: string;
    language?: string;
    localized_book_name?: string;
  };
  sources: customVideoSources[];
  chapterMarkers: chapterMarkers;
}
export interface customVideoSources extends VideoSources {
  src: string;
  name?: string;
  refId?: string;
}

export type chapterMarkers = {
  chapterStart: number;
  chapterEnd: number;
  label: string;
  xPos: string;
  startVerse: string | null;
  endVerse: string | null;
}[];
export type AnyFunction<Args extends never[], Return> = (...args: Args) => Return;
export type AnyAsyncFunction<Args extends never[], Return> = (...args: Args) => Promise<Return>;

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}
export interface userPreferencesI {
  preferUsingSavedVideoIfAvailable?: boolean;
  prefersDark?: boolean;
  playbackSpeed?: string;
}
export interface IDownloadPreferences {
  saveToServiceWorker: boolean;
  downloadOffline: boolean;
  justThisVideo: boolean;
  swPayload: object | null | undefined;
}
export type wholeBookPresets = "BIG" | "SMALL";
export type IpopulateSwPayload =
  | {
      type: "VID";
      val: string;
    }
  | {
      type: "BOOK";
      val: wholeBookPresets;
    };

export type i18nDictWithLangCode = Record<string, i18nDict>;

export type i18nDict = Record<string, string>;

export interface cloudflareEnv {
  ACCOUNT_ID: string;
  PLAYER_ID: string;
  POLICY_KEY: string;
}
export interface envPropsForPlayer {
  accountId: string;
  playerId: string;
}
