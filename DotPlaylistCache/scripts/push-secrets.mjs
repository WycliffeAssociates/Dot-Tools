// Pushes the worker's secrets to Cloudflare via `wrangler secret bulk`, reading
// the values from the environment. The `deploy` script already runs this under
// `op run --env-file=.env.op`, so the op:// references are resolved into
// process.env before we read them (just run `pnpm --filter dot-playlist-cache
// run deploy`). Standalone, run it the same way under op run.
//
// BRIGHTCOVE_ACCOUNT_ID is intentionally NOT here — it's a non-secret `var` in
// wrangler.jsonc, not a secret.
//
// Ordering note: the `deploy` script runs `wrangler deploy` BEFORE this. That's
// deliberate — `wrangler secret bulk` can only target a Worker that already
// exists, so secrets-first fails on the very first deploy. Secrets persist
// server-side across deploys, so re-pushing here just keeps Cloudflare in sync
// with 1Password (idempotent).
import { spawnSync } from "node:child_process";

const SECRET_KEYS = [
  "BRIGHTCOVE_POLICY_KEY",
  "BRIGHTCOVE_CLIENT_ID",
  "BRIGHTCOVE_CLIENT_SECRET",
  "REFRESH_TOKEN",
];

const missing = SECRET_KEYS.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `Missing secret env vars: ${missing.join(", ")}\n` +
      "Run under `op run --env-file=DotPlaylistCache/.env.op -- ...`.",
  );
  process.exit(1);
}

const payload = JSON.stringify(Object.fromEntries(SECRET_KEYS.map((k) => [k, process.env[k]])));

const result = spawnSync("wrangler", ["secret", "bulk"], {
  input: payload,
  stdio: ["pipe", "inherit", "inherit"],
});

if (result.status !== 0) {
  console.error("wrangler secret bulk failed");
  process.exit(result.status ?? 1);
}
console.log(`Pushed ${SECRET_KEYS.length} secrets.`);
