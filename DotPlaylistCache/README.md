# dot-playlist-cache

A Cloudflare Worker that keeps a **warm cache of Brightcove playlists** in KV so
the low-traffic sign-language Bible apps don't pay the Playback API's
cold-start (Akamai) latency. A 5-minute cron enumerates every playlist via the
CMS API and fetches each via the Playback API into KV; consumers read the cached
copy (sub-ms, replicated to every PoP) instead of hitting Brightcove on the
user's critical path.

See `../plans/playlist-cache-worker.md` for the full design and roadmap.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/playlists/ref:<reference_id>` | — | Cached playlist JSON (Playback API shape). Also `/playlists/<numericId>`. Sends `ETag`; honors `If-None-Match` → `304`. On KV miss, fetches live and populates. |
| `POST` | `/refresh/ref:<reference_id>` | Bearer | Force re-warm one playlist now (e.g. the editor calls this right after a Dynamic Ingest). |
| `POST` | `/refresh` | Bearer | Force a full re-warm of all playlists. |
| `GET` | `/healthz` | — | `{ ok, lastRunAt, playlistCount, okCount, errorCount }`. |
| `GET` | `/index` | — | Full warm-index manifest (debug). |

The `Bearer` token is `REFRESH_TOKEN` — a self-minted shared secret (not a
Cloudflare/Brightcove concept) we store as a Worker secret and also hand to the
editor. Reads are public; only side-effecting refresh is gated.

## Config & secrets

- **Non-secret:** `BRIGHTCOVE_ACCOUNT_ID` — a `var` in `wrangler.jsonc`.
- **Secrets** (pushed from 1Password at deploy, never on disk):
  `BRIGHTCOVE_POLICY_KEY` (search-enabled), `BRIGHTCOVE_CLIENT_ID`,
  `BRIGHTCOVE_CLIENT_SECRET` (CMS OAuth for enumeration), `REFRESH_TOKEN`.

Secrets follow the same `op run` + committed `.env.op` pattern as DotOcrApp.
Point the `op://` references in `.env.op` at the same vault/item DotOcrApp uses.

## First-time setup

```sh
# 1. Create the KV namespace and paste its id into wrangler.jsonc.
pnpm --filter dot-playlist-cache exec wrangler kv namespace create BRIGHTCOVE_PLAYLISTS

# 2. Set BRIGHTCOVE_ACCOUNT_ID in wrangler.jsonc `vars`.

# 3. Deploy + push secrets (needs `op signin`).
pnpm --filter dot-playlist-cache run deploy
```

The `deploy` script is self-contained: it runs
`op run --env-file=.env.op -- sh -c 'wrangler deploy && node ./scripts/push-secrets.mjs'`,
so secrets come from 1Password — no external `op run` wrapper or `.env` on disk.
`wrangler deploy` comes first so the Worker exists before secrets are attached
(you can't set a secret on a Worker that doesn't exist yet); secrets persist
server-side, so re-pushing each deploy just keeps Cloudflare in sync with 1Password.

## CI

`.github/workflows/deploy-playlist-cache.yml` runs the same command on every push
to `master`. It needs these **GitHub repo secrets**:

- `OP_SERVICE_ACCOUNT_TOKEN` — 1Password service account, so `op run` resolves
  `.env.op` headlessly.
- `CLOUDFLARE_API_TOKEN` — Workers-edit token for `wrangler`.
- `CLOUDFLARE_ACCOUNT_ID` — (optional) if the API token spans multiple accounts.

The KV namespace id and `BRIGHTCOVE_ACCOUNT_ID` var must already be filled into
`wrangler.jsonc` (see first-time setup) for the deploy to succeed.

## Develop & test

```sh
pnpm --filter dot-playlist-cache dev        # op run -- wrangler dev
pnpm --filter dot-playlist-cache typecheck  # tsgo --noEmit
pnpm exec vitest run DotPlaylistCache       # unit tests (etag / warm / router)
```

`dev` runs `op run --env-file=.env.op -- wrangler dev`. The `secrets.required`
list in `wrangler.jsonc` tells Wrangler to auto-load those named secrets from
`process.env` (what `op run` injects) during local dev — so no
`CLOUDFLARE_INCLUDE_PROCESS_ENV` flag and no whole-env dump, and nothing on disk.
Needs `op signin`.
