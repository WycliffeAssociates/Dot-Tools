import { describe, expect, it } from "vitest";
import { BOOKS, bookOrderFromFields, resolveBook } from "./index.ts";

describe("resolveBook", () => {
  it("resolves full English names case-insensitively", () => {
    expect(resolveBook("Galatians")?.order).toBe(48);
    expect(resolveBook("galatians")?.order).toBe(48);
    expect(resolveBook("REVELATION")?.name).toBe("Revelation");
  });

  it("resolves slugs / abbreviations (PO sometimes uses the slug)", () => {
    expect(resolveBook("gal")?.name).toBe("Galatians");
    expect(resolveBook("rev")?.name).toBe("Revelation");
    expect(resolveBook("ps")?.name).toBe("Psalms");
  });

  it("resolves numbered books spaced or unspaced", () => {
    expect(resolveBook("1 Corinthians")?.order).toBe(46);
    expect(resolveBook("1corinthians")?.order).toBe(46);
    expect(resolveBook("1cor")?.order).toBe(46);
    expect(resolveBook("1 John")?.order).toBe(62);
  });

  it("tolerates surrounding whitespace and trailing periods", () => {
    expect(resolveBook("  Phil. ")?.name).toBe("Philippians");
  });

  it("returns undefined for unrecognized input", () => {
    expect(resolveBook("Maccabees")).toBeUndefined();
    expect(resolveBook("")).toBeUndefined();
    expect(resolveBook(undefined)).toBeUndefined();
  });

  it("covers all 66 books with no ambiguous aliases (built at load)", () => {
    expect(BOOKS).toHaveLength(66);
  });
});

describe("bookOrderFromFields", () => {
  it("prefers the authoritative canonical_order field", () => {
    expect(bookOrderFromFields({ canonical_order: "67", book: "Revelation" })).toBe(67);
  });

  it("falls back to the resolved book name when canonical_order is absent", () => {
    expect(bookOrderFromFields({ book: "gal" })).toBe(48);
  });

  it("sorts unknown books last", () => {
    expect(bookOrderFromFields({ book: "Tobit" })).toBe(Number.MAX_SAFE_INTEGER);
    expect(bookOrderFromFields(undefined)).toBe(Number.MAX_SAFE_INTEGER);
  });
});
