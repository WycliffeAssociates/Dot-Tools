/**
 * Weak ETag over a response body, so consumers get real 304s (Brightcove's
 * Playback API offers none). Weak because two byte-identical warmings are
 * semantically equivalent even if whitespace-normalized differently upstream.
 */
export async function computeEtag(body: string): Promise<string> {
  const bytes = new TextEncoder().encode(body);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `W/"${hex.slice(0, 32)}"`;
}

/** True when a client's If-None-Match matches the current etag (handles the W/ prefix and lists). */
export function etagMatches(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  const norm = (t: string) => t.trim().replace(/^W\//, "");
  const target = norm(etag);
  return ifNoneMatch.split(",").some((t) => norm(t) === target);
}
