import { describe, expect, it } from "vitest";
import * as r2Keys from "./r2-keys.ts";

describe("r2Keys", () => {
  it("builds the single canonical VTT key", () => {
    expect(r2Keys.vttKey("benin-new-testament", "1234567890")).toBe(
      "benin-new-testament/1234567890.vtt",
    );
  });

  it("builds thumbnail and winners keys", () => {
    expect(r2Keys.thumbKey("1234567890", 4)).toBe("1234567890/4.jpg");
    expect(r2Keys.winnersJsonKey("1234567890")).toBe("1234567890/winners.json");
  });

  it("builds the completed.json key per playlist", () => {
    expect(r2Keys.completedJsonKey("benin-new-testament")).toBe(
      "benin-new-testament/completed.json",
    );
  });
});
