import type { BrightcoveClient, BrightcovePlaybackPlaylist } from "@dottools/shared/brightcove";
import { describe, expect, it } from "vitest";
import { kvKeyFor, readIndex, readStored, warmAll, warmOne, type WarmDeps } from "./warm.ts";

/** In-memory KV double covering the get/put surface warm.ts uses. */
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

/** Brightcove client double: scripted playlists + a per-lookup playback responder. */
function fakeClient(opts: {
  playlists: { id: string; name: string; reference_id?: string | null }[];
  playback: (lookup: string) => BrightcovePlaybackPlaylist;
}) {
  return {
    getAllPlaylists: async () => opts.playlists,
    getPlaybackPlaylist: async (refOrId: string) => opts.playback(refOrId),
  } as unknown as BrightcoveClient;
}

const NOW = () => new Date("2026-06-18T00:00:00.000Z");

describe("kvKeyFor", () => {
  it("keeps ref: lookups and prefixes bare ids with id:", () => {
    expect(kvKeyFor("ref:benin-new-testament")).toBe("ref:benin-new-testament");
    expect(kvKeyFor("12345")).toBe("id:12345");
  });
});

describe("warmOne", () => {
  it("stores the playlist under both id: and ref: keys", async () => {
    const { kv, store } = fakeKv();
    const client = fakeClient({
      playlists: [],
      playback: () => ({ id: "p1", reference_id: "a-ref", name: "A", videos: [] }),
    });
    const deps: WarmDeps = { client, kv, now: NOW };

    const stored = await warmOne(deps, "ref:a-ref");
    expect(stored.warmedAt).toBe("2026-06-18T00:00:00.000Z");
    expect(stored.etag).toMatch(/^W\//);
    expect(store.has("ref:a-ref")).toBe(true);
    expect(store.has("id:p1")).toBe(true);
    expect((await readStored(kv, "ref:a-ref"))?.body.id).toBe("p1");
  });
});

describe("warmAll", () => {
  it("warms every playlist, records errors, and writes the index", async () => {
    const { kv, store } = fakeKv();
    const client = fakeClient({
      playlists: [
        { id: "1", name: "A", reference_id: "a-ref" },
        { id: "2", name: "B", reference_id: null }, // no ref → warmed by id only
        { id: "3", name: "C", reference_id: "c-ref" }, // this one fails
      ],
      playback: (lookup) => {
        if (lookup === "ref:c-ref") throw new Error("boom");
        const id = lookup === "2" ? "2" : lookup.replace("ref:", "");
        const reference_id = lookup.startsWith("ref:") ? lookup.slice(4) : null;
        return { id, reference_id, name: id, videos: [] };
      },
    });

    const index = await warmAll({ client, kv, now: NOW });

    expect(index.playlistCount).toBe(3);
    expect(index.okCount).toBe(2);
    expect(index.errors).toEqual([{ playlist: "ref:c-ref", message: "boom" }]);

    // Stored under expected keys; the no-ref one only under id:.
    expect(store.has("ref:a-ref")).toBe(true);
    expect(store.has("id:2")).toBe(true);
    expect(store.has("ref:c-ref")).toBe(false);

    const failed = index.playlists.find((e) => e.id === "3")!;
    expect(failed.ok).toBe(false);
    expect(failed.error).toBe("boom");

    expect((await readIndex(kv))?.okCount).toBe(2);
  });
});
