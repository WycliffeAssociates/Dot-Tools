import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrightcoveApiError } from "./errors.ts";
import { BrightcoveClient } from "./client.ts";

interface FetchCall {
  url: string;
  init: RequestInit;
}

type ResponseSpec = {
  match?: (call: FetchCall) => boolean;
  status?: number;
  body?: unknown;
  bodyText?: string;
};

function makeClient(opts: { responses: ResponseSpec[]; nowMs?: number; policyKey?: string }) {
  const calls: FetchCall[] = [];
  let now = opts.nowMs ?? 1_700_000_000_000;
  const tickClock = (delta: number) => {
    now += delta;
  };
  // Each response is consumed once. A response with a `match` predicate matches
  // by URL/init; a response without one matches anything. The first unused
  // matching response wins.
  const remaining = [...opts.responses];
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input.toString();
    const call: FetchCall = { url, init };
    calls.push(call);
    const idx = remaining.findIndex((r) => (r.match ? r.match(call) : true));
    if (idx < 0) {
      throw new Error(`No more mocked responses for ${url}`);
    }
    const spec = remaining.splice(idx, 1)[0]!;
    const status = spec.status ?? 200;
    const text = spec.bodyText ?? (spec.body !== undefined ? JSON.stringify(spec.body) : "");
    return new Response(text, { status });
  });
  const client = new BrightcoveClient({
    accountId: "12345",
    clientId: "client-id",
    clientSecret: "client-secret",
    policyKey: opts.policyKey,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    now: () => now,
  });
  return { client, calls, fetchImpl, tickClock };
}

describe("BrightcoveClient.getAccessToken", () => {
  it("POSTs OAuth v4 with HTTP Basic + client_credentials body", async () => {
    const { client, calls } = makeClient({
      responses: [{ body: { access_token: "tok-1", token_type: "Bearer", expires_in: 300 } }],
    });
    const token = await client.getAccessToken();
    expect(token).toBe("tok-1");

    expect(calls).toHaveLength(1);
    const call = calls[0]!;
    expect(call.url).toBe("https://oauth.brightcove.com/v4/access_token");
    expect(call.init.method).toBe("POST");
    const headers = call.init.headers as Record<string, string>;
    const expectedBasic = `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`;
    expect(headers.Authorization).toBe(expectedBasic);
    expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(String(call.init.body)).toBe("grant_type=client_credentials");
  });

  it("caches the token and reuses it while unexpired", async () => {
    const { client, fetchImpl } = makeClient({
      responses: [{ body: { access_token: "tok-1", token_type: "Bearer", expires_in: 300 } }],
    });
    expect(await client.getAccessToken()).toBe("tok-1");
    expect(await client.getAccessToken()).toBe("tok-1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("refreshes the token after expiry", async () => {
    const { client, fetchImpl, tickClock } = makeClient({
      responses: [
        { body: { access_token: "tok-1", token_type: "Bearer", expires_in: 60 } },
        { body: { access_token: "tok-2", token_type: "Bearer", expires_in: 60 } },
      ],
    });
    expect(await client.getAccessToken()).toBe("tok-1");
    tickClock(120_000); // jump past expiry
    expect(await client.getAccessToken()).toBe("tok-2");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("throws BrightcoveApiError on non-2xx token responses", async () => {
    const { client } = makeClient({
      responses: [{ status: 401, bodyText: '{"error":"invalid_client"}' }],
    });
    await expect(client.getAccessToken()).rejects.toBeInstanceOf(BrightcoveApiError);
  });
});

describe("BrightcoveClient.ingestTextTrack (LOAD-BEARING)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the verbatim Dynamic Ingest body shape from the alt app", async () => {
    const { client, calls } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth.brightcove.com"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        { match: (c) => c.url.includes("ingest.api.brightcove.com"), body: { id: "ingest-job-1" } },
      ],
    });

    const resp = await client.ingestTextTrack(
      "vid-42",
      "https://r2.example.com/ingest-stage/vid-42-1700000000000.vtt",
    );
    expect(resp).toStrictEqual({ id: "ingest-job-1" });

    const ingestCall = calls.find((c) => c.url.includes("ingest.api.brightcove.com"))!;
    expect(ingestCall.url).toBe(
      "https://ingest.api.brightcove.com/v1/accounts/12345/videos/vid-42/ingest-requests",
    );
    expect(ingestCall.init.method).toBe("POST");

    const headers = ingestCall.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
    expect(headers["Content-Type"]).toBe("application/json");

    // This is the contract that must not drift.
    expect(JSON.parse(String(ingestCall.init.body))).toStrictEqual({
      text_tracks: [
        {
          url: "https://r2.example.com/ingest-stage/vid-42-1700000000000.vtt",
          srclang: "en",
          kind: "chapters",
          label: "Verse Markers",
          default: true,
          status: "published",
          embed_closed_caption: false,
        },
      ],
    });
  });

  it("overrides srclang per video when supplied", async () => {
    const { client, calls } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        { match: (c) => c.url.includes("ingest"), body: { id: "x" } },
      ],
    });
    await client.ingestTextTrack("vid-42", "https://r2.example.com/x.vtt", "fr");
    const ingest = calls.find((c) => c.url.includes("ingest"))!;
    const parsed = JSON.parse(String(ingest.init.body));
    expect(parsed.text_tracks[0].srclang).toBe("fr");
  });

  it("includes the track id when replacing in place (no id when adding)", async () => {
    const { client, calls } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        { match: (c) => c.url.includes("ingest"), body: { id: "x" } },
      ],
    });
    await client.ingestTextTrack("vid-42", "https://r2.example.com/x.vtt", "en", "track-99");
    const body = JSON.parse(String(calls.find((c) => c.url.includes("ingest"))!.init.body));
    expect(body.text_tracks[0].id).toBe("track-99");
  });
});

describe("BrightcoveClient.upsertChaptersTrack", () => {
  beforeEach(() => vi.clearAllMocks());

  it("replaces an existing chapters track by id (no duplicate)", async () => {
    const { client, calls } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        {
          match: (c) => c.url.includes("cms.api.brightcove.com"),
          body: {
            id: "vid-42",
            text_tracks: [
              { id: "tt-chapters", src: "x", srclang: "en", kind: "chapters", label: "Verse Markers", default: true },
              { id: "tt-captions", src: "y", srclang: "en", kind: "captions", label: "CC", default: false },
            ],
          },
        },
        { match: (c) => c.url.includes("ingest"), body: { id: "job-1" } },
      ],
    });

    await client.upsertChaptersTrack("vid-42", "https://r2.example.com/x.vtt");
    const body = JSON.parse(String(calls.find((c) => c.url.includes("ingest"))!.init.body));
    expect(body.text_tracks[0].id).toBe("tt-chapters");
  });

  it("adds a track (omits id) when none of kind chapters exists yet", async () => {
    const { client, calls } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        {
          match: (c) => c.url.includes("cms.api.brightcove.com"),
          body: { id: "vid-42", text_tracks: [] },
        },
        { match: (c) => c.url.includes("ingest"), body: { id: "job-1" } },
      ],
    });

    await client.upsertChaptersTrack("vid-42", "https://r2.example.com/x.vtt");
    const body = JSON.parse(String(calls.find((c) => c.url.includes("ingest"))!.init.body));
    expect(body.text_tracks[0].id).toBeUndefined();
  });
});

describe("BrightcoveClient CMS reads", () => {
  it("getVideo hits CMS API with bearer auth", async () => {
    const { client, calls } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        {
          match: (c) => c.url.includes("cms.api.brightcove.com"),
          body: { id: "v1", name: "Genesis 1" },
        },
      ],
    });
    const v = await client.getVideo("v1");
    expect(v).toStrictEqual({ id: "v1", name: "Genesis 1" });
    const cms = calls.find((c) => c.url.includes("cms.api.brightcove.com"))!;
    expect(cms.url).toBe("https://cms.api.brightcove.com/v1/accounts/12345/videos/v1");
    expect((cms.init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("getSmallestMp4Source picks the smallest MP4 by size", async () => {
    const { client } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        {
          match: (c) => c.url.includes("/sources"),
          body: [
            { src: "https://x/big.mp4", container: "MP4", size: 9_000_000 },
            { src: "https://x/medium.mp4", container: "MP4", size: 5_000_000 },
            { src: "https://x/small.mp4", container: "MP4", size: 2_000_000 },
            { src: "https://x/manifest.m3u8", container: "M2TS", size: 1_000_000 },
            { src: "https://x/no-size.mp4", container: "MP4" }, // no size → filtered out
          ],
        },
      ],
    });
    const src = await client.getSmallestMp4Source("v1");
    expect(src?.src).toBe("https://x/small.mp4");
  });

  it("returns null when no MP4 sources are available", async () => {
    const { client } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        { match: (c) => c.url.includes("/sources"), body: [] },
      ],
    });
    expect(await client.getSmallestMp4Source("v1")).toBeNull();
  });

  it("getTextTracks pulls text_tracks off the video record", async () => {
    const { client } = makeClient({
      responses: [
        {
          match: (c) => c.url.includes("oauth"),
          body: { access_token: "tok", token_type: "Bearer", expires_in: 300 },
        },
        {
          match: (c) => c.url.includes("/videos/v1") && !c.url.includes("/sources"),
          body: {
            id: "v1",
            name: "Genesis 1",
            text_tracks: [
              {
                id: "t1",
                src: "https://x/t.vtt",
                srclang: "en",
                kind: "chapters",
                label: "Verse Markers",
                default: true,
              },
            ],
          },
        },
      ],
    });
    const tracks = await client.getTextTracks("v1");
    expect(tracks).toHaveLength(1);
    expect(tracks[0]?.kind).toBe("chapters");
  });

  it("getPlaybackPlaylist hits the Playback API with policy-key auth and ref: lookup", async () => {
    const { client, calls } = makeClient({
      policyKey: "pk-search-enabled",
      responses: [
        {
          match: (c) => c.url.includes("edge.api.brightcove.com"),
          body: {
            id: "pl-1",
            name: "Benin New Testament",
            reference_id: "benin-new-testament",
            videos: [{ id: "v1", name: "Matthew 1" }],
          },
        },
      ],
    });

    const pl = await client.getPlaybackPlaylist("ref:benin-new-testament");
    expect(pl.reference_id).toBe("benin-new-testament");
    expect(pl.videos).toHaveLength(1);

    expect(calls).toHaveLength(1); // no OAuth token fetch on the Playback path
    const call = calls[0]!;
    // Path param interpolated raw (literal `ref:`), limit defaults to the 1000 cap.
    expect(call.url).toBe(
      "https://edge.api.brightcove.com/playback/v1/accounts/12345/playlists/ref:benin-new-testament?limit=1000",
    );
    const headers = call.init.headers as Record<string, string>;
    expect(headers.Accept).toBe("application/json;pk=pk-search-enabled");
    expect(headers.Authorization).toBeUndefined();
  });

  it("getPlaybackPlaylist caps limit at 1000 and accepts a custom lower limit", async () => {
    const { client, calls } = makeClient({
      policyKey: "pk",
      responses: [
        { match: (c) => c.url.includes("edge.api"), body: { id: "p", videos: [] } },
        { match: (c) => c.url.includes("edge.api"), body: { id: "p", videos: [] } },
      ],
    });
    await client.getPlaybackPlaylist("123", { limit: 5000 });
    await client.getPlaybackPlaylist("123", { limit: 50 });
    expect(calls[0]!.url).toContain("limit=1000");
    expect(calls[1]!.url).toContain("limit=50");
  });

  it("getPlaybackPlaylist throws if no policyKey is configured", async () => {
    const { client } = makeClient({ responses: [] }); // no policyKey
    await expect(client.getPlaybackPlaylist("ref:x")).rejects.toThrow(/policyKey/);
  });

  it("getPlaybackPlaylist throws BrightcoveApiError on non-2xx", async () => {
    const { client } = makeClient({
      policyKey: "bad",
      responses: [{ match: (c) => c.url.includes("edge.api"), status: 401 }],
    });
    await expect(client.getPlaybackPlaylist("ref:x")).rejects.toBeInstanceOf(BrightcoveApiError);
  });

  it("fetchTextTrackBody does an unauthenticated GET of the public URL", async () => {
    const { client, calls } = makeClient({
      responses: [{ bodyText: "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nhi\n" }],
    });
    const vtt = await client.fetchTextTrackBody("https://public.example.com/t.vtt");
    expect(vtt).toContain("WEBVTT");
    expect(calls).toHaveLength(1); // no token fetch
    const call = calls[0]!;
    expect(call.url).toBe("https://public.example.com/t.vtt");
    expect(
      (call.init.headers as Record<string, string> | undefined)?.Authorization,
    ).toBeUndefined();
  });
});
