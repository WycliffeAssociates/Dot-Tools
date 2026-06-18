/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** @example {"videos":[{"description":"Bugs-Bee","poster_sources":[{"src":"https://cf-images.eu-west-1.prod.boltdns.net/v1/static/1752604059001/a9554ba2-899e-408e-91f6-8bf1a4decfcb/c1e55b4e-4758-4ad3-98ea-ba8feaf0a6f8/1280x720/match/image.jpg"}],"tags":["bugs","sample"],"cue_points":[],"custom_fields":{},"account_id":"1752604059001","sources":[{"ext_x_version":"4","type":"application/x-mpegURL","src":"https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1752604059001/a9554ba2-899e-408e-91f6-8bf1a4decfcb/10s/master.m3u8?fastly_token=NWJiMjZjZGJfYWYyMjFhYmJmNmI3MmM3NWNiYzJmODZiMWVlN2Y1NTA0ZDc5MWIyNTcyYTYyNDk3OWRmNGM2NmRkMzI4Y2I4Ng%3D%3D"}],"name":"Bugs-Bee","reference_id":"1754261699001","long_description":null,"duration":30000,"economics":"AD_SUPPORTED","published_at":"2012-07-25T20:34:13.393Z","text_tracks":[],"updated_at":"2018-09-03T18:35:27.609Z","thumbnail":"https://cf-images.eu-west-1.prod.boltdns.net/v1/static/1752604059001/a9554ba2-899e-408e-91f6-8bf1a4decfcb/8e656dae-6331-4cad-9922-6ab39ac44650/160x90/match/image.jpg","poster":"https://cf-images.eu-west-1.prod.boltdns.net/v1/static/1752604059001/a9554ba2-899e-408e-91f6-8bf1a4decfcb/c1e55b4e-4758-4ad3-98ea-ba8feaf0a6f8/1280x720/match/image.jpg","offline_enabled":false,"link":null,"id":"1754261699001","ad_keys":null,"thumbnail_sources":[{"src":"https://cf-images.eu-west-1.prod.boltdns.net/v1/static/1752604059001/a9554ba2-899e-408e-91f6-8bf1a4decfcb/8e656dae-6331-4cad-9922-6ab39ac44650/160x90/match/image.jpg"}],"created_at":"2012-07-25T20:34:13.393Z"}],"updated_at":"2016-01-30T20:43:59.351Z","type":"ACTIVATED_NEWEST_TO_OLDEST","reference_id":"bugs1754200352001","name":"Bugs","id":"1754200352001","description":null,"created_at":"2012-07-25T20:43:06.070Z","account_id":"1752604059001"} */
export interface PlaylistResponse {
  /** Video Cloud account id  */
  account_id?: string;
  /** date/time created  */
  created_at?: string;
  /** playlist description  */
  description?: string;
  /** the playlist id  */
  id?: string;
  /** the playlist name  */
  name?: string;
  /** the playlist reference id  */
  reference_id?: string;
  /** the playlist type: EXPLICIT or smart playlist type  */
  type?: string;
  /** date/time last modified  */
  updated_at?: string;
  /** array of video ids (EXPLICIT playlists only)  */
  video_ids?: string[];
  /** search string to retrieve the videos (smart playlists only)  */
  search?: string;
  /** array of video maps  */
  videos?: Video[];
}

/** @example {"poster":"https://httpsak-a.akamaihd.net/1752604059001/1752604059001_4883205209001_4883184247001-vs.jpg?pubId=1752604059001&videoId=4883184247001","thumbnail":"https://httpsak-a.akamaihd.net/1752604059001/1752604059001_4883205207001_4883184247001-th.jpg?pubId=1752604059001&videoId=4883184247001","poster_sources":[{"src":"https://httpsak-a.akamaihd.net/1752604059001/1752604059001_4883205209001_4883184247001-vs.jpg?pubId=1752604059001&videoId=4883184247001"}],"thumbnail_sources":[{"src":"https://httpsak-a.akamaihd.net/1752604059001/1752604059001_4883205207001_4883184247001-th.jpg?pubId=1752604059001&videoId=4883184247001"}],"description":null,"tags":["public","sample","water"],"cue_points":[],"custom_fields":{"customfield1":"foo","customfield2":"bar"},"account_id":"1752604059001","sources":[{"ext_x_version":"4","src":"https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/10s/master.m3u8?fastly_token=NWZiNDMxZWFfZGZkYjE0MTc1MmQyYTQ5YmMzMTY3MzM0OGZlMzVjNjYwOTNjYzY1MDUxNDA4YjJhYjU1MjU2YjFiMWZkZWI0MQ%3D%3D","type":"application/x-mpegURL"},{"ext_x_version":"4","src":"https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/10s/master.m3u8?fastly_token=NWZiNDMxZWFfZGZkYjE0MTc1MmQyYTQ5YmMzMTY3MzM0OGZlMzVjNjYwOTNjYzY1MDUxNDA4YjJhYjU1MjU2YjFiMWZkZWI0MQ%3D%3D","type":"application/x-mpegURL"},{"codecs":"avc1,mp4a","ext_x_version":"7","src":"https://manifest.prod.boltdns.net/manifest/v2/hls/v7/clear/avc1_mp4a/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/10s/master.m3u8?fastly_token=NWZiNDMxZWFfYTcwYTY3ZmZjN2I1NTFlYWFhNmI2M2ZlNGE2MDE2ZjNjYmJkZDE0YzBiZjc0MzNmMWYxZmQ0OTQ4MWVmMmVmNQ%3D%3D","type":"application/x-mpegURL"},{"codecs":"avc1,mp4a","ext_x_version":"7","src":"https://manifest.prod.boltdns.net/manifest/v2/hls/v7/clear/avc1_mp4a/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/10s/master.m3u8?fastly_token=NWZiNDMxZWFfYTcwYTY3ZmZjN2I1NTFlYWFhNmI2M2ZlNGE2MDE2ZjNjYmJkZDE0YzBiZjc0MzNmMWYxZmQ0OTQ4MWVmMmVmNQ%3D%3D","type":"application/x-mpegURL"},{"profiles":"urn:mpeg:dash:profile:isoff-live:2011","src":"https://manifest.prod.boltdns.net/manifest/v1/dash/live-baseurl/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/2s/manifest.mpd?fastly_token=NWZiNDMxZWFfZWZmYTk5MjkxZmU1MzI2OTk4ZWRjNmZlNzU2ZDRiZmYxMTU5YmFkZTE4ZDJhN2E1YTVjYTY1NTBlNjdiMDdiNg%3D%3D","type":"application/dash+xml"},{"profiles":"urn:mpeg:dash:profile:isoff-live:2011","src":"https://manifest.prod.boltdns.net/manifest/v1/dash/live-baseurl/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/2s/manifest.mpd?fastly_token=NWZiNDMxZWFfZWZmYTk5MjkxZmU1MzI2OTk4ZWRjNmZlNzU2ZDRiZmYxMTU5YmFkZTE4ZDJhN2E1YTVjYTY1NTBlNjdiMDdiNg%3D%3D","type":"application/dash+xml"},{"codecs":"avc1,mp4a","profiles":"urn:mpeg:dash:profile:isoff-live:2011","src":"https://manifest.prod.boltdns.net/manifest/v2/dash/live-baseurl/clear/avc1_mp4a/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/2s/manifest.mpd?fastly_token=NWZiNDMxZWFfOTRmMjg4MDdjNDYxNzhiNDBkMWU3ZWU4M2ZiMjc5MzFmODBiMDYwMGUyYjk2YWU1NDFhZmNiYzgzNWY2MTIwMw%3D%3D","type":"application/dash+xml"},{"codecs":"avc1,mp4a","profiles":"urn:mpeg:dash:profile:isoff-live:2011","src":"https://manifest.prod.boltdns.net/manifest/v2/dash/live-baseurl/clear/avc1_mp4a/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/2s/manifest.mpd?fastly_token=NWZiNDMxZWFfOTRmMjg4MDdjNDYxNzhiNDBkMWU3ZWU4M2ZiMjc5MzFmODBiMDYwMGUyYjk2YWU1NDFhZmNiYzgzNWY2MTIwMw%3D%3D","type":"application/dash+xml"},{"avg_bitrate":2213000,"codec":"H264","container":"MP4","duration":49690,"height":1080,"size":13753809,"src":"https://bcboltbde696aa-a.akamaihd.net/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/high.mp4?akamai_token=exp=1605644778~acl=/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/high.mp4*~hmac=962808a9a0bb0d1bba5d67a0dc24a9cf078f589545c50f777a2e637ad25e9e08","width":1920},{"avg_bitrate":2213000,"codec":"H264","container":"MP4","duration":49690,"height":1080,"size":13753809,"src":"https://bcboltbde696aa-a.akamaihd.net/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/high.mp4?akamai_token=exp=1605644778~acl=/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/high.mp4*~hmac=962808a9a0bb0d1bba5d67a0dc24a9cf078f589545c50f777a2e637ad25e9e08","width":1920},{"avg_bitrate":613000,"codec":"H264","container":"MP4","duration":49690,"height":1080,"size":3826436,"src":"https://bcboltbde696aa-a.akamaihd.net/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/mid.mp4?akamai_token=exp=1605644778~acl=/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/mid.mp4*~hmac=71eb21be1beb5712512991f18a1f94d62e00fafbe46697024b0022099c737aad","width":1920},{"avg_bitrate":613000,"codec":"H264","container":"MP4","duration":49690,"height":1080,"size":3826436,"src":"https://bcboltbde696aa-a.akamaihd.net/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/mid.mp4?akamai_token=exp=1605644778~acl=/media/v1/pmp4/static/clear/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/mid.mp4*~hmac=71eb21be1beb5712512991f18a1f94d62e00fafbe46697024b0022099c737aad","width":1920}],"name":"Canada Geese and Goslings","reference_id":null,"long_description":null,"duration":49633,"economics":"AD_SUPPORTED","text_tracks":[{"id":null,"account_id":"1752604059001","src":"https://manifest.prod.boltdns.net/thumbnail/v1/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/2160be82-a59b-4382-a0a7-244b6de2e0fc/thumbnail.webvtt?fastly_token=NWZiNDMxZWFfNDA2Yzg0NDAyNjg4N2MzMmUyNjBiNmY2NWY5YzExN2RhNzdmNDAyNzZjYzA1ODk0MjI5OTRmMzcxNjcxMjhhOQ%3D%3D","srclang":null,"label":"thumbnails","kind":"metadata","mime_type":"text/webvtt","asset_id":null,"sources":null,"default":false,"width":192,"height":108,"bandwidth":360},{"id":null,"account_id":"1752604059001","src":"https://manifest.prod.boltdns.net/thumbnail/v1/1752604059001/59b8dae1-5de8-4f8c-8f67-52a4eac73b70/2160be82-a59b-4382-a0a7-244b6de2e0fc/thumbnail.webvtt?fastly_token=NWZiNDMxZWFfNDA2Yzg0NDAyNjg4N2MzMmUyNjBiNmY2NWY5YzExN2RhNzdmNDAyNzZjYzA1ODk0MjI5OTRmMzcxNjcxMjhhOQ%3D%3D","srclang":null,"label":"thumbnails","kind":"metadata","mime_type":"text/webvtt","asset_id":null,"sources":null,"default":false,"width":192,"height":108,"bandwidth":360}],"published_at":"2016-05-07T18:33:28.665Z","created_at":"2016-05-07T18:33:28.665Z","updated_at":"2020-04-25T19:50:54.934Z","offline_enabled":false,"link":null,"id":"4883184247001","ad_keys":null,"variants":[{"language":"de-DE","name":"Basel: Der Rhein","description":"Panoramablick auf den Rhein im Zentrum von Basel, Schweiz.","long_description":"Panoramablick auf den Rhein im Zentrum von Basel, Schweiz.","custom_fields":{}},{"language":"ja-JA","name":"バーゼル：ライン川","description":"スイス、バーゼルの中心部にあるライン川のパノラマビュー。","long_description":"スイス、バーゼルの中心部にあるライン川のパノラマビュー。","custom_fields":{"language":"Japanese"}}]} */
export interface Video {
  /** video id  */
  id?: string;
  /** video title  */
  name?: string;
  /** when the video was created  */
  created_at?: string;
  /** map of fieldname-value pairs  */
  custom_fields?: object;
  /** array of cue point maps  */
  cue_points?: VideoCuePoints;
  /** video short description  */
  description?: string;
  /** video duration in milliseconds  */
  duration?: number;
  /**
   * whether video is AD_SUPPORTED
   * @default "AD_SUPPORTED"
   * @example "AD_SUPPORTED"
   */
  economics?: "AD_SUPPORTED" | "FREE";
  /**
   * Array of [labels](/cms/managing-videos/working-with-labels.html) for the video
   * @default []
   * @example ["/nature/wildlife/avian/coastal_birds","/nature/wildlife/avian/coastal_birds/sandpipers","/nature/wildlife/avian/forest_birds"]
   */
  labels?: any[];
  /** Associates specified EPA playback rights with video. */
  playback_rights_id?: string;
  /** array of poster source maps (note that in many cases there will be one source with a src value identical to the poster value, but this array is included in case there are multiple protocols available, such as http and https) */
  poster_sources?: VideoPosterSources[];
  /** URL for the default poster source image  */
  poster?: string;
  /** The mapping projection for 360° videos, e.g. "equirectangular" */
  projection?: string;
  /** array of thumbnail source maps (note that in many cases there will be one source with a src value identical to the thumbnail value, but this array is included in case there are multiple protocols available, such as http and https) */
  thumbnail_sources?: VideoThumbnailSources[];
  /** URL for the default thumbnail source image  */
  thumbnail?: string;
  /** map of scheduling properties  */
  link?: VideoLink;
  /** video long description  */
  long_description?: string;
  /** whether video is enabled for offline viewing  */
  offline_enabled?: boolean;
  /** video reference-id (must be unique within the account)  */
  reference_id?: string;
  /** array of tags  */
  tags?: string[];
  /** array of video sources (renditions)  */
  sources?: VideoSources[];
  /** array of text track maps  */
  text_tracks?: VideoTextTracks[];
  /** array of transcription objects - can only be added on update, not creation */
  transcripts?: any[];
  /** when the video was last modified  */
  updated_at?: string;
  /** array of variant objects containing multi-lingual metadata */
  variants?: VideoVariant[];
  /** map of key/value pairs for ad requests  */
  ad_keys?: object;
}

export interface VideoCuePoints {
  /** cue point name  */
  name?: string;
  /** cue point type  */
  type?: string;
  /** time of the cue point in seconds; example: 10.527  */
  time?: number;
  /** optional metadata string (128 single-byte characters maximum)  */
  metadata?: string;
  /**
   * whether video is force-stopped at the cue point
   * @default false
   * @example true
   */
  "force-stop"?: boolean;
}

export interface VideoPosterSources {
  /** URL for a poster source image (note that in many cases there will be one source with a src value identical to the poster value, but this array is included in case there are multiple protocols available, such as http and https) */
  src?: string;
}

export interface VideoThumbnailSources {
  /** URL for a thumbnail source image (note that in many cases there will be one source with a src value identical to the thumbnail value, but this array is included in case there are multiple protocols available, such as http and https) */
  src?: string;
}

export interface VideoLink {
  /** text for the link  */
  text?: string;
  /** URL for the link  */
  url?: string;
}

export interface VideoSources {
  /** average bitrate  */
  avg_bitrate?: number;
  /** frame width in pixels  */
  width?: number;
  /** frame height in pixels  */
  height?: number;
  /** size in bytes  */
  size?: number;
  /** duration in milliseconds  */
  duration?: number;
  /** the asset id for the source  */
  asset_id?: string;
  /** the stream name for the source  */
  stream_name?: string;
  /** the video codec  */
  codec?: string;
  /** the video container  */
  container?: string;
  /** the address for rtmp streams  */
  app_name?: string;
  /** the type (for HLS streams)  */
  type?: string;
}

/** array of text track maps  */
export interface VideoTextTracks {
  /** URL for the .vtt file  */
  src?: string;
  /** array of sources for .vtt files (note that in many cases there will be one source with a src value identical to the text_tracks.src value, but this array is included in case there are multiple protocols available, such as http and https) */
  sources?: VideoTextTracksSources[];
  /** kind of text track  */
  kind?: string;
  /** 2-letter language code, such as "en" or "ko"  */
  srclang?: string;
  /** mime_type for the track  */
  mime_type?: string;
  /** label for the track  */
  label?: string;
  /** whether this is the default track  */
  default?: boolean;
  /** If this field is present, it means that references for this text track are available in the associated video's manifest */
  in_band_metadata_track_dispatch_type?: string;
}

export interface VideoTextTracksSources {
  /** URL for the .vtt file (note that in many cases there will be one source with a src value identical to the text_tracks.src value, but this array is included in case there are multiple protocols available, such as http and https) */
  src?: string;
}

/** transcription */
export interface VideoTranscription {
  /** System id for the text track */
  id?: string;
  /** label for the track */
  label?: string;
  /** mime-type for the track - should be `text/plain` */
  mime_type?: string;
  /** URL for the transcription file */
  src?: string;
  /** 2-letter language code, such as "en" or "ko" */
  lang?: string;
}

/** Object containing language-specific metadata for a video */
export interface VideoVariant {
  /**
   * The language for this variant in the language-country code format (examples: en-US, es-ES)
   * @example "es-ES"
   */
  language?: string;
  /** The title of the video in this language */
  name?: string;
  /** The video short description in this language */
  description?: string;
  /** The video long description in this language */
  long_description?: string;
  /** map of `fieldname: value` pairs, where values are for this language; values have a maximum length of 1024 single-byte characters. Note: be sure to use the **internal** name for the field, not the display name */
  custom_fields?: object;
}

export type GetVideosResponse = Video[];

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://edge.api.brightcove.com/playback/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string" ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
        body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Playback API Reference
 * @version 2.0.0
 * @baseUrl https://edge.api.brightcove.com/playback/v1
 *
 * Reference for the Brightcove Playback API, used for client-side access video and playlist information.
 *
 * The raw API JSON response is not suitable for the player. Use the `player.catalog.transformVideoResponse()` function to convert each video object in the response into a format compatible with the player. This includes duration times and https image compatibility. For details, see the [Player Catalog](https://player.support.brightcove.com/references/player-catalog.html) document.
 *
 * For additional in-depth guides to features of the API, see the **[Overview](/playback/getting-started/overview-playback-api.html)**.
 *
 * **NOTE: this is version 2 of the Playback API - almost all Brightcove accounts are on this version, but a very few are still on version 1. All version 1 functionality works with version 2. Version 2 offers some new functionality as noted below. The *base url* is the same for both versions - requests are directed to the correct version based on the account settings.
 *
 * **Base URL**: https://edge.api.brightcove.com/playback/v1
 */
export class playbackApi<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  accounts = {
    /**
     * @description Gets a page of video objects that are related to the specified video. Using the name and short description of the specified video, the Playback API searches for videos with any partial matches in the following fields: `name`, `short` `description`, `long_description`, `tags`. Notes:  When performing a search (using the `q` parameter), you must use a search-enabled Policy Key. For information on getting policy keys, see the [Policy API Overview](/policy/getting-started/overview-policy-api.html). You can also use this [sample app](/policy/getting-started/quick-start-policy-api.html) to create a search-enabled key In general, search-enabled Policy Keys should only be stored on a server and not in a browser player or mobile app, since they can be used to list all playable videos. For some accounts this may not be applicable if you do not care if all of your playable videos can be discovered. The response results for this endpoint are subject to change as we improve the algorithm for finding related videos. If you do not want your results to change, or if you want precise control, then you should use the [Get Videos endpoint](#operation/Get_Videos) with a search parameter. Any geo-restricted videos that are denied for the particular requestor are omitted from the results. As long as some videos are allowed the request is considered successful. An errors field is added to the result with a summary explaining why videos were omitted.
     *
     * @tags Videos
     * @name GetRelatedVideosByIdOrReferenceId
     * @summary Get Related Videos by ID or Reference ID
     * @request GET:/accounts/{account_id}/videos/{video_id}/related
     * @response `200` `GetVideosResponse` 200
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` INVALID_POLICY_KEY:undefined
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getRelatedVideosByIdOrReferenceId: (
      accountId: string,
      videoId: string,
      query?: {
        /**
         * The number of videos to return
         * @min 1
         * @max 1000
         * @default 20
         */
        limit?: number;
        /**
         * The number of videos to skip - used to page multiple sets of videos. Note that the maximum number of videos that can be returned by the Playback API is 1000. To return more than 1000 videos, you must use the CMS API.
         * @min 0
         * @default 0
         */
        offset?: number;
        /** include [server-side ad insertion](/playback/getting-started/overview-playback-api.html#Video_request_with_SSAI) */
        ad_config_id?: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetVideosResponse, void>({
        path: `/accounts/${accountId}/videos/${videoId}/related`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Gets a video object based on a video ID or reference ID. To get a video using the `reference_id`, use: https://edge.api.brightcove.com/playback/v1/accounts/{account_id}/videos/ref:{reference_id}` Note that you can specify multiple video ids in a comma-delimited list, but only **one** `reference_id`.
     *
     * @tags Videos
     * @name GetVideoByIdOrReferenceId
     * @summary Get Video by ID or Reference ID
     * @request GET:/accounts/{account_id}/videos/{video_id}
     * @response `200` `Video` 200
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` INVALID_POLICY_KEY:undefined
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getVideoByIdOrReferenceId: (
      accountId: string,
      videoId: string,
      query?: {
        /** include [server-side ad insertion](/playback/getting-started/overview-playback-api.html#Video_request_with_SSAI) */
        ad_config_id?: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Video, void>({
        path: `/accounts/${accountId}/videos/${videoId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Gets a page of video objects. The Playback API allows you to programmatically search for videos in your Video Cloud library. For more information on the search syntax, see [CMS/Playback API: Videos Search](/cms/searching/cmsplayback-api-videos-search.html). Notes: - When performing a search, you need to use a search-enabled Policy Key. For information on getting policy keys, see the Policy API Overview or the Policy Keys documents.  In general, search-enabled Policy Keys should only be stored on a server and not in a browser player or mobile app, since they can be used to list all playable videos. For some accounts this may not be applicable if you do not care if all of your playable videos can be discovered. - The maximum number of videos (highest count value) returned is 1000, even if there are more matching videos in the account. The count value is an estimate and should not be relied on as the exact number to be returned. If all results are desired then keep paging until it no longer returns a full page, or use the CMS api. - Only currently playable videos are included in the results list. It is recommended to do a similar query with the CMS api to see why some videos are excluded.  Any geo-restricted videos that are denied for the particular requestor are omitted from the results. As long as some videos are allowed the request is considered successful. An errors field is added to the result with a summary explaining why videos were omitted.
     *
     * @tags Videos
     * @name GetVideos
     * @summary Get Videos
     * @request GET:/accounts/{account_id}/videos
     * @response `200` `GetVideosResponse` 200
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` INVALID_POLICY_KEY:undefined
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getVideos: (
      accountId: string,
      // @ts-ignore
      _videoId: string,
      query?: {
        /** search string - see [search guide](/cms/searching/cmsplayback-api-videos-search.html) for details */
        q?: string;
        /**
         * The number of videos to return
         * @min 1
         * @max 1000
         * @default 20
         */
        limit?: number;
        /**
         * The number of videos to skip - used to page multiple sets of videos. Note that the maximum number of videos that can be returned by the Playback API is 1000. To return more than 1000 videos, you must use the CMS API.
         * @min 0
         * @default 0
         */
        offset?: number;
        /**
         * Field to sort results by; if absent and there is a search string, results are sorted by relevance — note that `plays_total` and `plays_trailing_week` are not included in the response - note: to sort in descending order, preface the sort field name with a minus (`-`) sign
         * @default "-updated_at"
         */
        sort?:
          | "name"
          | "reference_id"
          | "created_at"
          | "published_at"
          | "updated_at"
          | "schedule_starts_at"
          | "schedule_ends_at"
          | "state"
          | "plays_total"
          | "plays_trailing_week";
        /** include [server-side ad insertion](/playback/getting-started/overview-playback-api.html#Video_request_with_SSAI) */
        ad_config_id?: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetVideosResponse, void>({
        path: `/accounts/${accountId}/videos`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Gets an HLS manifest with static URLs for the renditions and other assets. Note that the URLs carry a token, and are good for the TTL of the token. **Version 2 of the API only**
     *
     * @tags Static URLs
     * @name GetStaticUrLsHls
     * @summary Get an HLS Manifest with static URLs
     * @request GET:/accounts/{account_id}/videos/{video_id}/master.m3u8
     * @response `200` `void` 200 - returns the M3U8 manifest
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` Unauthorized - 'INVALID_POLICY_KEY:{bad policy key or undefined}' or `INVALID_JWT`(meaning that the JWT has expired)
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getStaticUrLsHls: (
      accountId: string,
      videoId: string,
      query: {
        /** The value is a JWT (JSON Web Token) - see [Static URL Delivery](/playback/guides/static-url-delivery.html) and [Creating a JSON Web Token](https://general.support.brightcove.com/developer/create-jwt.html) */
        bcov_auth: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/${accountId}/videos/${videoId}/master.m3u8`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Gets a DASH manifest with static URLs for the renditions and other assets. Note that the URLs carry a token, and are good for the TTL of the token. **Version 2 of the API only**
     *
     * @tags Static URLs
     * @name GetStaticUrLsDash
     * @summary Get a DASH Manifest with static URLs
     * @request GET:/accounts/{account_id}/videos/{video_id}/manifest.mpd
     * @response `200` `void` 200 - returns the MPD manifest
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` Unauthorized - 'INVALID_POLICY_KEY:{bad policy key or undefined}' or `INVALID_JWT`(meaning that the JWT has expired)
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` 'SERVER_ERROR:internal server error' (one cause of the error is requesting a VMAP with a JWT that does not include the `ssai` claim see [Static URL Delivery](/playback/guides/static-url-delivery.html))
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getStaticUrLsDash: (
      accountId: string,
      videoId: string,
      query: {
        /** The value is a JWT (JSON Web Token) - see [Static URL Delivery](/playback/guides/static-url-delivery.html) and [Creating a JSON Web Token](https://general.support.brightcove.com/developer/create-jwt.html) */
        bcov_auth: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/${accountId}/videos/${videoId}/manifest.mpd`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Gets an HLS VMAP with static URLs for the renditions and other assets. Note that the URLs carry a token, and are good for the TTL of the token. Also, VMAPS can only be retrieved if the JWT includes an `ssai` claim - see [Creating a JSON Web Token](/playback/guides/static-url-delivery.html). **Version 2 of the API only**
     *
     * @tags Static URLs
     * @name GetStaticUrLsHlsVmap
     * @summary Get an HLS VMAP with static URLs
     * @request GET:/accounts/{account_id}/videos/{video_id}/hls.vmap
     * @response `200` `void` 200 - returns the HLS VMAP
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` Unauthorized - 'INVALID_POLICY_KEY:{bad policy key or undefined}' or `INVALID_JWT`(meaning that the JWT has expired)
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` 'SERVER_ERROR:internal server error' (one cause of the error is requesting a VMAP with a JWT that does not include the `ssai` claim see [Static URL Delivery](/playback/guides/static-url-delivery.html))
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getStaticUrLsHlsVmap: (
      accountId: string,
      videoId: string,
      query: {
        /** The value is a JWT (JSON Web Token) - see [Static URL Delivery](/playback/guides/static-url-delivery.html) and [Creating a JSON Web Token](https://general.support.brightcove.com/developer/create-jwt.html) */
        bcov_auth: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/${accountId}/videos/${videoId}/hls.vmap`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Gets an DASH VMAP with static URLs for the renditions and other assets. Note that the URLs carry a token, and are good for the TTL of the token. Also, VMAPS can only be retrieved if the JWT includes an `ssai` claim - see [Creating a JSON Web Token](/playback/guides/static-url-delivery.html). **Version 2 of the API only**
     *
     * @tags Static URLs
     * @name GetStaticUrLsDashVmap
     * @summary Get an DASH VMAP with static URLs
     * @request GET:/accounts/{account_id}/videos/{video_id}/dash.vmap
     * @response `200` `void` 200 - returns the DASH VMAP
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` Unauthorized - 'INVALID_POLICY_KEY:{bad policy key or undefined}' or `INVALID_JWT`(meaning that the JWT has expired)
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getStaticUrLsDashVmap: (
      accountId: string,
      videoId: string,
      query: {
        /** The value is a JWT (JSON Web Token) - see [Static URL Delivery](/playback/guides/static-url-delivery.html) and [Creating a JSON Web Token](https://general.support.brightcove.com/developer/create-jwt.html) */
        bcov_auth: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/${accountId}/videos/${videoId}/dash.vmap`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Gets the MP4 rendition of the video that has the highest bitrate **Version 2 of the API only**
     *
     * @tags Static URLs
     * @name GetStaticUrLsHighestMp4
     * @summary Get the highest bitrate MP4 rendition
     * @request GET:/accounts/{account_id}/videos/{video_id}/high.mp4
     * @response `200` `void` 200 - returns the MP4 file
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` Unauthorized - 'INVALID_POLICY_KEY:{bad policy key or undefined}' or `INVALID_JWT`(meaning that the JWT has expired)
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getStaticUrLsHighestMp4: (
      accountId: string,
      videoId: string,
      query: {
        /** The value is a JWT (JSON Web Token) - see [Static URL Delivery](/playback/guides/static-url-delivery.html) and [Creating a JSON Web Token](https://general.support.brightcove.com/developer/create-jwt.html) */
        bcov_auth: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/${accountId}/videos/${videoId}/high.mp4`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Gets the MP4 rendition of the video that has the lowest bitrate **Version 2 of the API only**
     *
     * @tags Static URLs
     * @name GetStaticUrLsLowestMp4
     * @summary Get the lowest bitrate MP4 rendition
     * @request GET:/accounts/{account_id}/videos/{video_id}/low.mp4
     * @response `200` `void` 200 - returns the MP4 file
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` Unauthorized - 'INVALID_POLICY_KEY:{bad policy key or undefined}' or `INVALID_JWT`(meaning that the JWT has expired)
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getStaticUrLsLowestMp4: (
      accountId: string,
      videoId: string,
      query: {
        /** The value is a JWT (JSON Web Token) - see [Static URL Delivery](/playback/guides/static-url-delivery.html) and [Creating a JSON Web Token](https://general.support.brightcove.com/developer/create-jwt.html) */
        bcov_auth: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/${accountId}/videos/${videoId}/low.mp4`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Gets a playlist object for an account, based on playlist ID or reference ID. **Note that playlists may contain up to 1000 videos. By default, only the first 20 are returned. You can use the `limit` and `offset` parameters to control how many (up to 1000) and which videos are returned for a request**
     *
     * @tags Playlists
     * @name GetPlaylistsByIdOrReferenceId
     * @summary Get Playlist by ID or Reference ID
     * @request GET:/accounts/{account_id}/playlists/{playlist_id}
     * @response `200` `PlaylistResponse` 200
     * @response `400` `void` BAD_REQUEST: DUPLICATE_PARAMETERS - The same parameter name was provided more than once in the request INVALID_SEARCH - The search parameters are not valid ILLEGAL_QUERY - The search string syntax was invalid - example ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request <br>  API  - The policy key is not search-enabled when attempting to perform a search - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address <br>  DOMAIN - The video is restricted from playing on the current domain - POLICY_ERROR - Error when evaluating the policy key - VIDEO_NOT_PLAYABLE - For a single video request, the video exists, but is not allowed to be played now.
     * @response `401` `void` INVALID_POLICY_KEY:undefined
     * @response `403` `void` ACCESS_DENIED: - ACCOUNT_ID  - The account id in the policy key does not match the account in the api request - DOMAIN - The video is restricted from playing on the current domain - CLIENT_GEO - The video is restricted from playing in the current geo region; the message will contain additional information about the specific issue. For more details, see the Playback API Error Reference - CLIENT_IP - The video is restricted at the current IP address - POLICY_ERROR - Error when evaluating the policy key
     * @response `405` `void` METHOD_NOT_ALLOWED:Only GET, HEAD and OPTIONS are allowed for this api.
     * @response `500` `void` SERVER_ERROR:internal server error
     * @response `502` `void` SERVER_ERROR:Got a bad response from a backend server
     * @response `504` `void` SERVER_TIMEOUT:Either a backend server or one of the servers they rely on timed out.
     */
    getPlaylistsByIdOrReferenceId: (
      accountId: string,
      playlistId: string,
      query?: {
        /**
         * The number of videos to return
         * @min 1
         * @max 1000
         * @default 20
         */
        limit?: number;
        /**
         * The number of videos to skip - used to page multiple sets of videos. Note that the maximum number of videos that can be returned by the Playback API is 1000. To return more than 1000 videos, you must use the CMS API.
         * @min 0
         * @default 0
         */
        offset?: number;
        /** include [server-side ad insertion](/playback/getting-started/overview-playback-api.html#Video_request_with_SSAI) */
        ad_config_id?: string;
        /** include and set equal to the [delivery rules id](/delivery-rules/guides/index.html) in order to have the delivery rules applied */
        config_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PlaylistResponse, void>({
        path: `/accounts/${accountId}/playlists/${playlistId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
