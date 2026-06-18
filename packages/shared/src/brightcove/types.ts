export interface BrightcoveTextTrack {
  id?: string;
  src: string;
  srclang: string;
  kind: string;
  label: string;
  default: boolean;
  mime_type?: string;
}

export interface BrightcoveSource {
  src?: string;
  container?: string;
  codec?: string;
  size?: number;
  width?: number;
  height?: number;
  type?: string;
}

export interface BrightcoveVideo {
  id: string;
  name: string;
  reference_id?: string | null;
  custom_fields?: Record<string, string>;
  text_tracks?: BrightcoveTextTrack[];
  duration?: number;
  state?: string;
  description?: string | null;
}

export interface BrightcovePlaylist {
  id: string;
  name: string;
  reference_id?: string | null;
  type?: string;
  updated_at?: string;
}

/**
 * Playback API playlist response (`edge.api.brightcove.com/playback/v1`), as
 * consumed by the public apps (DotWeb/DotMobile) and the playlist cache worker.
 * Unlike the thin CMS `BrightcovePlaylist`, this carries the resolved `videos`
 * array. The shape is passed through verbatim, so unknown fields are tolerated.
 */
export interface BrightcovePlaybackPlaylist {
  id: string;
  name?: string;
  reference_id?: string | null;
  type?: string;
  description?: string | null;
  updated_at?: string;
  count?: number;
  videos: BrightcoveVideo[];
  [key: string]: unknown;
}

export interface BrightcoveIngestResponse {
  id?: string;
}

export interface BrightcoveOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
