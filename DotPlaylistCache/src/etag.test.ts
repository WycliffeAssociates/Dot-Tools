import { describe, expect, it } from "vitest";
import { computeEtag, etagMatches } from "./etag.ts";

describe("computeEtag", () => {
  it("is deterministic and weak-tagged", async () => {
    const a = await computeEtag('{"a":1}');
    const b = await computeEtag('{"a":1}');
    expect(a).toBe(b);
    expect(a).toMatch(/^W\/"[0-9a-f]{32}"$/);
  });

  it("differs for different bodies", async () => {
    expect(await computeEtag("x")).not.toBe(await computeEtag("y"));
  });
});

describe("etagMatches", () => {
  it("matches identical and weak-prefixed tags", async () => {
    const etag = await computeEtag("body");
    expect(etagMatches(etag, etag)).toBe(true);
    expect(etagMatches(etag.replace(/^W\//, ""), etag)).toBe(true);
  });

  it("matches within a comma list and rejects misses/null", async () => {
    const etag = await computeEtag("body");
    expect(etagMatches(`"other", ${etag}`, etag)).toBe(true);
    expect(etagMatches('"nope"', etag)).toBe(false);
    expect(etagMatches(null, etag)).toBe(false);
  });
});
