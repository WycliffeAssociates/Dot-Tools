import { describe, expect, it } from "vitest";
import { type FrameOcr, selectCues } from "./winners.ts";

function frame(ts: number, text: string, confidence: number): FrameOcr {
  return {
    timestampSeconds: ts,
    framePath: `/tmp/frame-${ts}.jpg`,
    words: [{ text, confidence }],
  };
}

describe("selectCues — earliest clean reference", () => {
  it("anchors a cue to the earliest clean frame, not the noisy fade-in", () => {
    const frames: FrameOcr[] = [
      frame(10, "J0hn 3:l4", 0.4), // garbled OCR during fade-in, low conf
      frame(11, "John 3:14-16", 0.9), // first clean parse
      frame(12, "John 3:14-16", 0.95), // even cleaner, but later
    ];
    const cues = selectCues(frames, { videoDurationSeconds: 30 });
    expect(cues).toHaveLength(1);
    expect(cues[0]?.reference).toBe("John 3:14-16");
    expect(cues[0]?.startSeconds).toBe(11);
    expect(cues[0]?.winnerTimestampSeconds).toBe(11);
    expect(cues[0]?.winnerFramePath).toBe("/tmp/frame-11.jpg");
    expect(cues[0]?.endSeconds).toBe(30); // closes at end of video
  });

  it("produces consecutive cues that close at the next reference's start", () => {
    const frames: FrameOcr[] = [
      frame(5, "John 3:14-16", 0.9),
      frame(6, "John 3:14-16", 0.9),
      frame(20, "John 3:17-18", 0.9),
    ];
    const cues = selectCues(frames, { videoDurationSeconds: 40 });
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({ reference: "John 3:14-16", startSeconds: 5, endSeconds: 20 });
    expect(cues[1]).toMatchObject({ reference: "John 3:17-18", startSeconds: 20, endSeconds: 40 });
    expect(cues[0]?.cueIndex).toBe(0);
    expect(cues[1]?.cueIndex).toBe(1);
  });

  it("drops frames below the confidence threshold", () => {
    const frames: FrameOcr[] = [frame(5, "John 3:14-16", 0.3)];
    expect(selectCues(frames, { videoDurationSeconds: 10, minConfidence: 0.6 })).toHaveLength(0);
  });

  it("ignores frames without an explicit chapter:verse (bare chapter is not enough)", () => {
    const frames: FrameOcr[] = [frame(5, "John 3", 0.95)];
    expect(selectCues(frames, { videoDurationSeconds: 10 })).toHaveLength(0);
  });

  it("requires a real book name (rejects UNKNOWN)", () => {
    const frames: FrameOcr[] = [frame(5, "3:14-16", 0.95)];
    expect(selectCues(frames, { videoDurationSeconds: 10 })).toHaveLength(0);
  });

  it("uses book/chapter defaults from custom_fields hints", () => {
    const frames: FrameOcr[] = [frame(5, "3:14-16", 0.95)];
    const cues = selectCues(frames, {
      videoDurationSeconds: 10,
      defaults: { bookName: "John" },
    });
    expect(cues).toHaveLength(1);
    expect(cues[0]?.reference).toBe("John 3:14-16");
  });

  it("re-collapses a reference that recurs after another (new run = new cue)", () => {
    const frames: FrameOcr[] = [
      frame(5, "John 3:14", 0.9),
      frame(10, "John 3:15", 0.9),
      frame(15, "John 3:14", 0.9), // recurs — distinct run, distinct cue
    ];
    const cues = selectCues(frames, { videoDurationSeconds: 20 });
    expect(cues.map((c) => c.reference)).toEqual(["John 3:14-14", "John 3:15-15", "John 3:14-14"]);
  });
});
