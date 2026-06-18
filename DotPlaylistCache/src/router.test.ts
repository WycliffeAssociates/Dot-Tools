import { describe, expect, it } from "vitest";
import type { Env } from "./env.ts";
import { handleRequest } from "./router.ts";
import type { StoredPlaylist, WarmIndex } from "./warm.ts";

function fakeKv() {
  const m = new Map<string, string>();
  const kv = {
    get: async (k: string) => m.get(k) ?? null,
    put: async (k: string, v: string) => {
      m.set(k, v);
    },
  };
  return { kv: kv as unknown as KVNamespace, store: m };
}

const STORED: StoredPlaylist = {
  body: { id: "x", reference_id: "x-ref", name: "X", videos: [] },
  etag: 'W/"abc123"',
  warmedAt: "2026-06-18T00:00:00.000Z",
};

function makeEnv() {
  const { kv, store } = fakeKv();
  store.set("ref:x-ref", JSON.stringify(STORED));
  const env: Env = {
    BRIGHTCOVE_PLAYLISTS: kv,
    BRIGHTCOVE_ACCOUNT_ID: "1",
    BRIGHTCOVE_POLICY_KEY: "pk",
    BRIGHTCOVE_CLIENT_ID: "cid",
    BRIGHTCOVE_CLIENT_SECRET: "secret",
    REFRESH_TOKEN: "tok",
  };
  return { env, store };
}

const get = (path: string, headers?: Record<string, string>) =>
  new Request(`https://w.example.com${path}`, { headers });

describe("GET /playlists/:key", () => {
  it("serves a cached HIT with ETag and cache headers", async () => {
    const { env } = makeEnv();
    const res = await handleRequest(get("/playlists/ref:x-ref"), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("ETag")).toBe('W/"abc123"');
    expect(res.headers.get("X-Cache")).toBe("HIT");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect((await res.json<{ id: string }>()).id).toBe("x");
  });

  it("returns 304 when If-None-Match matches", async () => {
    const { env } = makeEnv();
    const res = await handleRequest(
      get("/playlists/ref:x-ref", { "If-None-Match": 'W/"abc123"' }),
      env,
    );
    expect(res.status).toBe(304);
  });

  it("400s on an empty key", async () => {
    const { env } = makeEnv();
    expect((await handleRequest(get("/playlists/"), env)).status).toBe(400);
  });
});

describe("/healthz and /index", () => {
  it("reports health from the index manifest", async () => {
    const { env, store } = makeEnv();
    const index: WarmIndex = {
      lastRunAt: "2026-06-18T00:00:00.000Z",
      playlistCount: 3,
      okCount: 3,
      playlists: [],
      errors: [],
    };
    store.set("__index", JSON.stringify(index));
    const res = await handleRequest(get("/healthz"), env);
    const body = await res.json<{ ok: boolean; okCount: number }>();
    expect(body.ok).toBe(true);
    expect(body.okCount).toBe(3);
  });

  it("503s /index before the first warm", async () => {
    const { env } = makeEnv();
    expect((await handleRequest(get("/index"), env)).status).toBe(503);
  });
});

describe("POST /refresh auth", () => {
  const post = (path: string, headers?: Record<string, string>) =>
    new Request(`https://w.example.com${path}`, { method: "POST", headers });

  it("401s without a bearer token", async () => {
    const { env } = makeEnv();
    expect((await handleRequest(post("/refresh/ref:x-ref"), env)).status).toBe(401);
  });

  it("401s with the wrong token", async () => {
    const { env } = makeEnv();
    const res = await handleRequest(
      post("/refresh/ref:x-ref", { Authorization: "Bearer nope" }),
      env,
    );
    expect(res.status).toBe(401);
  });
});

describe("misc routing", () => {
  it("404s unknown paths", async () => {
    const { env } = makeEnv();
    expect((await handleRequest(get("/nope"), env)).status).toBe(404);
  });

  it("answers CORS preflight", async () => {
    const { env } = makeEnv();
    const res = await handleRequest(
      new Request("https://w.example.com/playlists/ref:x-ref", { method: "OPTIONS" }),
      env,
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});
