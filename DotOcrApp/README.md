# DotOcrApp — OCR producer

Pulls sign-language Bible videos from Brightcove, OCRs burned-in verse-bridge /
title cards, and writes proposed VTT chapter tracks + winner thumbnails to R2
where the **DotVttEditor** picks them up. A one-off, on-demand dev tool — run it
when production asks for VTTs on a new playlist.

## What it does

1. List Brightcove playlists → pick one → see its videos with indicators
   (has Brightcove chapters / has R2 seed / has thumbs).
2. Run OCR on the whole playlist or selected videos. Fire-and-forget; the only
   thing you need to watch is the **Failures** panel.
3. Per video: download the smallest MP4 → extract frames (1 fps grid +
   black-cut boundaries) → OCR each frame → pick the **earliest clean** Bible
   reference for each cue → write to R2:
   - `dot-assets/{playlist}/{videoId}.vtt` — the VTT (the single source of
     truth; rerunning OCR **overwrites** it, as does saving in the editor)
   - `dot-tmp/{videoId}/{cueIndex}.jpg` — the winning frame per cue
   - `dot-tmp/{videoId}/winners.json` — provenance (timestamp, confidence,
     parsed reference, raw OCR text) so the editor can show _which_ frame won
     each cue and why.
4. Optionally **Publish** a seed straight to Brightcove (Dynamic Ingest) without
   opening the editor.

The editor reads that same VTT, and turns it into a live Brightcove chapter
track when the product owner edits + saves (Brightcove pulls the file's public
URL directly — there is no separate seed/draft/ingest copy).

## Run it

Credentials come from 1Password at launch via `op run`, which resolves the
`op://` references in `.env.op` and injects the values into the process
environment. Nothing secret is ever written to disk. You need the [1Password
CLI](https://developer.1password.com/docs/cli/get-started/) signed in (`op
signin`); `.env.op` is committed (it holds references, not secrets).

```bash
# 1a. CPU (laptop / any box)
op run --env-file=.env.op -- docker compose up

# 1b. NVIDIA box (CUDA)
op run --env-file=.env.op -- docker compose --profile gpu up

# 2. Open the picker
open http://localhost:8000
```

No build step — the container runs the TypeScript entrypoint via `tsx`.

### Local (without Docker, for development)

Requires Node 22 (the repo pins it via `mise.toml`; Node 24.4.x has a pnpm-OOM
regression — nodejs/node#59057) and `ffmpeg`/`ffprobe` on PATH.

```bash
# The `dev` script wraps itself in `op run --env-file=.env.op`, so just:
pnpm --filter @dottools/ocr-app dev
```

(No external `op run` wrapper needed — the script injects 1Password secrets
straight into the Node process; nothing secret on disk. Needs `op signin`.)

On an M1 Mac, run natively (not in Docker) to get Metal via CoreML.

## OCR engine

- **Primary:** PaddleOCR models through onnxruntime (`@gutenye/ocr-node`).
- **Fallback:** Tesseract.js (pure WASM) for scripts the PaddleOCR default model
  doesn't cover — currently Malayalam (`ml`).
- **Accelerator:** `OCR_EXECUTION_PROVIDERS` (default `cuda,coreml,cpu`). ONNX
  Runtime picks the first available at session-init: CUDA on the NVIDIA box,
  CoreML (→ Metal/ANE) on M1, CPU otherwise.

## Config

See `.env.op` (the committed 1Password reference file). Per-playlist default
languages live in
`src/pipeline/meta.ts` (`PLAYLIST_LANGS`) and can be edited without touching the
editor.

## Notes

- Job state is in-memory (display + resumability scratch only). If the container
  restarts mid-run, just re-run; videos that already have an R2 seed are obvious
  from the indicators and cheap to skip.
- "Earliest clean reference": a cue is anchored to the earliest frame where the
  reference parses cleanly (explicit chapter:verse) above the confidence
  threshold — not the noisy title-card fade-in. See `src/pipeline/winners.ts`.
