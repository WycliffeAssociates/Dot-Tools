export interface Cue {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export function secondsToVttTime(value: number): string {
  const millis = Math.round(value * 1000);
  const hours = Math.floor(millis / 3_600_000);
  const minutes = Math.floor((millis % 3_600_000) / 60_000);
  const seconds = Math.floor((millis % 60_000) / 1000);
  const ms = millis % 1000;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(ms)}`;
}

export function vttTimeToSeconds(value: string): number {
  let hms: string;
  let ms: number;
  if (value.includes(".")) {
    const [hmsPart, msPart] = value.split(".") as [string, string];
    hms = hmsPart;
    ms = Number.parseInt(msPart, 10);
  } else {
    hms = value;
    ms = 0;
  }
  const parts = hms.split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts.map((p) => Number.parseInt(p, 10)) as [number, number, number];
    return h * 3600 + m * 60 + s + ms / 1000;
  }
  if (parts.length === 2) {
    const [m, s] = parts.map((p) => Number.parseInt(p, 10)) as [number, number];
    return m * 60 + s + ms / 1000;
  }
  throw new Error(`Invalid VTT time format: ${value}`);
}

export function serializeVtt(cues: Iterable<Cue>): string {
  const lines = ["WEBVTT", ""];
  for (const cue of cues) {
    lines.push(`${secondsToVttTime(cue.startSeconds)} --> ${secondsToVttTime(cue.endSeconds)}`);
    lines.push(cue.text.trim());
    lines.push("");
  }
  return lines.join("\n").replace(/\n+$/, "") + "\n";
}

export function parseVtt(text: string): Cue[] {
  const lines = text.split(/\r?\n/);
  const cues: Cue[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? "").trim();
    if (!line.includes("-->")) {
      i += 1;
      continue;
    }
    const [startRaw, endRaw] = line.split("-->", 2).map((part) => part.trim()) as [string, string];
    i += 1;
    const payload: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "") {
      payload.push(lines[i] ?? "");
      i += 1;
    }
    cues.push({
      startSeconds: vttTimeToSeconds(startRaw),
      endSeconds: vttTimeToSeconds(endRaw),
      text: payload.join("\n").trim(),
    });
    i += 1;
  }
  return cues;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}
