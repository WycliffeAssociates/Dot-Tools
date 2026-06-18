import { describe, expect, it } from "vitest";
import { type Cue, parseVtt, secondsToVttTime, serializeVtt, vttTimeToSeconds } from "./index.ts";

describe("secondsToVttTime", () => {
  it("formats whole seconds", () => {
    expect(secondsToVttTime(0)).toBe("00:00:00.000");
    expect(secondsToVttTime(1)).toBe("00:00:01.000");
    expect(secondsToVttTime(61)).toBe("00:01:01.000");
    expect(secondsToVttTime(3661)).toBe("01:01:01.000");
  });

  it("formats milliseconds", () => {
    expect(secondsToVttTime(0.5)).toBe("00:00:00.500");
    expect(secondsToVttTime(1.234)).toBe("00:00:01.234");
  });
});

describe("vttTimeToSeconds", () => {
  it("parses HH:MM:SS.mmm", () => {
    expect(vttTimeToSeconds("00:00:00.000")).toBe(0);
    expect(vttTimeToSeconds("01:02:03.456")).toBeCloseTo(3723.456, 3);
  });

  it("parses MM:SS.mmm", () => {
    expect(vttTimeToSeconds("01:30.250")).toBeCloseTo(90.25, 3);
  });

  it("throws on garbage", () => {
    expect(() => vttTimeToSeconds("nonsense")).toThrow();
  });
});

describe("serializeVtt + parseVtt round-trip", () => {
  it("emits a WEBVTT header and round-trips cues", () => {
    const cues: Cue[] = [
      { startSeconds: 0, endSeconds: 5.5, text: "John 3:14-16" },
      { startSeconds: 5.5, endSeconds: 12, text: "John 3:17" },
    ];
    const vtt = serializeVtt(cues);
    expect(vtt.startsWith("WEBVTT\n")).toBe(true);
    expect(vtt).toContain("00:00:00.000 --> 00:00:05.500");
    expect(vtt).toContain("John 3:14-16");

    const parsed = parseVtt(vtt);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.text).toBe("John 3:14-16");
    expect(parsed[0]?.startSeconds).toBe(0);
    expect(parsed[0]?.endSeconds).toBeCloseTo(5.5, 3);
  });

  it("ignores leading lines that aren't cue timings", () => {
    const vtt = "WEBVTT\n\nNOTE this is a note\n\n00:00:00.000 --> 00:00:01.000\nhello\n";
    const parsed = parseVtt(vtt);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.text).toBe("hello");
  });

  it("tolerates CRLF line endings", () => {
    const vtt = "WEBVTT\r\n\r\n00:00:00.000 --> 00:00:01.000\r\nhello\r\n";
    const parsed = parseVtt(vtt);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.text).toBe("hello");
  });
});
