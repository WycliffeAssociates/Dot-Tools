import { BrightcoveApiError } from "@dottools/shared/brightcove";
import type { Env } from "./env.ts";
import { buildClient } from "./env.ts";
import { etagMatches } from "./etag.ts";
import { readIndex, readStored, warmAll, warmOne, type WarmDeps } from "./warm.ts";

const CORS = { "Access-Control-Allow-Origin": "*" } as const;

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...CORS,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, If-None-Match, Content-Type",
      },
    });
  }

  const deps: WarmDeps = { client: buildClient(env), kv: env.BRIGHTCOVE_PLAYLISTS };

  if (method === "GET" && pathname === "/healthz") {
    const index = await readIndex(env.BRIGHTCOVE_PLAYLISTS);
    return json({
      ok: index !== null && index.errors.length === 0,
      lastRunAt: index?.lastRunAt ?? null,
      playlistCount: index?.playlistCount ?? 0,
      okCount: index?.okCount ?? 0,
      errorCount: index?.errors.length ?? 0,
    });
  }

  if (method === "GET" && pathname === "/index") {
    const index = await readIndex(env.BRIGHTCOVE_PLAYLISTS);
    return index ? json(index) : json({ error: "not warmed yet" }, 503);
  }

  if (method === "GET" && pathname.startsWith("/playlists/")) {
    return servePlaylist(request, deps, decodeKey(pathname, "/playlists/"));
  }

  if (method === "POST" && pathname === "/refresh") {
    const denied = requireAuth(request, env);
    if (denied) return denied;
    const index = await warmAll(deps);
    return json({ refreshed: "all", playlistCount: index.playlistCount, okCount: index.okCount });
  }

  if (method === "POST" && pathname.startsWith("/refresh/")) {
    const denied = requireAuth(request, env);
    if (denied) return denied;
    const key = decodeKey(pathname, "/refresh/");
    try {
      const stored = await warmOne(deps, key);
      return json({ refreshed: key, etag: stored.etag, warmedAt: stored.warmedAt });
    } catch (err) {
      return upstreamError(err);
    }
  }

  return json({ error: "not found" }, 404);
}

async function servePlaylist(request: Request, deps: WarmDeps, key: string): Promise<Response> {
  if (!key) return json({ error: "missing playlist key" }, 400);

  let stored = await readStored(deps.kv, key);
  let cache: "HIT" | "MISS" = "HIT";

  if (stored === null) {
    // Cold/unknown key — fetch live from Brightcove, populate KV, then serve.
    cache = "MISS";
    try {
      stored = await warmOne(deps, key);
    } catch (err) {
      return upstreamError(err);
    }
  }

  if (etagMatches(request.headers.get("If-None-Match"), stored.etag)) {
    return new Response(null, {
      status: 304,
      headers: { ...CORS, ETag: stored.etag, "X-Cache": cache },
    });
  }

  return new Response(JSON.stringify(stored.body), {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "application/json",
      ETag: stored.etag,
      "Cache-Control": "public, max-age=60",
      "X-Cache": cache,
      "X-Warmed-At": stored.warmedAt,
    },
  });
}

/** Returns a 401 Response if the bearer token is missing/wrong, else null. */
function requireAuth(request: Request, env: Env): Response | null {
  const auth = request.headers.get("Authorization") ?? "";
  const expected = `Bearer ${env.REFRESH_TOKEN}`;
  if (!env.REFRESH_TOKEN || auth !== expected) return json({ error: "unauthorized" }, 401);
  return null;
}

/** Extracts and decodes the key segment after a route prefix (e.g. `ref:benin-...`). */
function decodeKey(pathname: string, prefix: string): string {
  return decodeURIComponent(pathname.slice(prefix.length));
}

function upstreamError(err: unknown): Response {
  // 404 from Brightcove → 404; anything else → 502 so consumers fall back to direct.
  if (err instanceof BrightcoveApiError && err.status === 404) {
    return json({ error: "playlist not found" }, 404);
  }
  const message = err instanceof Error ? err.message : String(err);
  return json({ error: "upstream fetch failed", message }, 502);
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
