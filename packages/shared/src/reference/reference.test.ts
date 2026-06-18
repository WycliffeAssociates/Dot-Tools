import { describe, expect, it } from "vitest";
import { normalizeReference } from "./index.ts";

describe("normalizeReference — colon form", () => {
  it("parses 'John 3:14-16'", () => {
    expect(normalizeReference("John 3:14-16")).toBe("John 3:14-16");
  });

  it("parses 'John 3:14' (single verse expands to start=end)", () => {
    expect(normalizeReference("John 3:14")).toBe("John 3:14-14");
  });

  it("tolerates missing spaces — 'John3:14-16'", () => {
    expect(normalizeReference("John3:14-16")).toBe("John 3:14-16");
  });

  it("accepts en-dash and em-dash as range separators", () => {
    expect(normalizeReference("John 3:14–16")).toBe("John 3:14-16");
    expect(normalizeReference("John 3:14—16")).toBe("John 3:14-16");
  });

  it("accepts a dot in place of colon", () => {
    expect(normalizeReference("John 3.14-16")).toBe("John 3:14-16");
  });
});

describe("normalizeReference — space form", () => {
  it("parses 'Genesis 1 1-5'", () => {
    expect(normalizeReference("Genesis 1 1-5")).toBe("Genesis 1:1-5");
  });
});

describe("normalizeReference — chapter-only fallback", () => {
  it("uses defaults for verses when only a chapter is detected", () => {
    expect(normalizeReference("Psalm 23")).toBe("Psalm 23:1-12");
  });

  it("respects custom verse defaults", () => {
    expect(normalizeReference("Psalm 23", { verseStart: 1, verseEnd: 6 })).toBe("Psalm 23:1-6");
  });
});

describe("normalizeReference — defaults", () => {
  it("falls back to chapter 1 if nothing parses", () => {
    expect(normalizeReference("", { bookName: "Genesis" })).toBe("Genesis 1:1-12");
  });

  it("prefers a supplied bookName over extracted text", () => {
    expect(normalizeReference("XYZ 3:14", { bookName: "John" })).toBe("John 3:14-14");
  });

  it("returns UNKNOWN book when none can be determined", () => {
    expect(normalizeReference("3:14")).toBe("UNKNOWN 3:14-14");
  });

  it("prefers the metadata chapter over the OCR'd chapter, keeping OCR verses", () => {
    // Card shows '18:5-8' but custom_fields say chapter 10 → trust metadata.
    expect(normalizeReference("Revelation 18:5-8", { bookName: "വെളിപാട്", chapterNum: 10 })).toBe(
      "വെളിപാട് 10:5-8",
    );
  });

  it("falls back to the OCR chapter when no chapter default is given", () => {
    expect(normalizeReference("Revelation 18:5-8", { bookName: "വെളിപാട്" })).toBe(
      "വെളിപാട് 18:5-8",
    );
  });
});

describe("normalizeReference — OCR-style messy input", () => {
  it("handles trailing whitespace and digits stuck to the book name", () => {
    expect(normalizeReference("  Mark2:1-12  ")).toBe("Mark 2:1-12");
  });

  it("handles unicode letters in book names (accents)", () => {
    expect(normalizeReference("Jean 3:16")).toBe("Jean 3:16-16");
  });
});
