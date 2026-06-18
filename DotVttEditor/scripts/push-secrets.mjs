// Pushes the editor Worker's secrets to Cloudflare via `wrangler secret bulk`,
// reading the values from the environment. Run under `op run` so the op://
// references in .env.op are already resolved into process.env:
//
//   op run --env-file=DotVttEditor/.env.op -- pnpm --filter dot-vids run deploy
//
// These are all surfaced to the Worker via `cloudflare:workers` `env`. The two
// *_URL entries and PLAYER_ID aren't strictly secret — if you'd rather keep
// them in the open, move them to a `vars` block in wrangler.jsonc and drop them
// from this list. Bindings (DOT_ASSETS, DOT_TMP, BRIGHTCOVE_PLAYLISTS) are NOT
// here — they live in wrangler.jsonc.
//
// Ordering note: the `deploy` script runs `astro build && wrangler deploy`
// BEFORE this. That's deliberate — `wrangler secret bulk` can only target a
// Worker that already exists, so secrets-first fails on the very first deploy.
// Secrets persist server-side across deploys, so re-pushing here just keeps
// Cloudflare in sync with 1Password (idempotent).
import { spawnSync } from "node:child_process";

const SECRET_KEYS = [
  "ACCOUNT_ID",
  "BC_CLIENT_ID",
  "BC_CLIENT_SECRET",
  "POLICY_KEY",
  "PLAYER_ID",
  "DOT_ASSETS_PUBLIC_URL",
  "TMP_IMGS_BUCKET_URL",
];

const missing = SECRET_KEYS.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `Missing secret env vars: ${missing.join(", ")}\n` +
      "Run under `op run --env-file=DotVttEditor/.env.op -- ...`.",
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
