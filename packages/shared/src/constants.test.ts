import { describe, expect, it } from "vitest";
import { DEFAULT_SRCLANG, VTT_CONTENT_TYPE, VTT_TRACK_CONSTANTS } from "./constants.ts";

describe("VTT_TRACK_CONSTANTS", () => {
  it("matches the verbatim Dynamic Ingest body shape from the alt app", () => {
    expect(VTT_TRACK_CONSTANTS).toStrictEqual({
      kind: "chapters",
      label: "Verse Markers",
      default: true,
      status: "published",
      embed_closed_caption: false,
    });
  });

  it("is frozen so future edits can't silently drift the contract", () => {
    expect(Object.isFrozen(VTT_TRACK_CONSTANTS)).toBe(true);
  });
});

describe("primitives", () => {
  it("defaults srclang to en", () => {
    expect(DEFAULT_SRCLANG).toBe("en");
  });

  it("uses text/vtt as the VTT content type", () => {
    expect(VTT_CONTENT_TYPE).toBe("text/vtt");
  });
});
