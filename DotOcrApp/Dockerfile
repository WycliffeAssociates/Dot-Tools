# CPU image. Build context MUST be the repo root (so packages/shared is in
# scope). See docker-compose.yml, which sets `context: ..`.
#
#   docker compose up            # from DotOcrApp/
#
FROM node:22-slim

# ffmpeg/ffprobe for frame extraction; ca-certificates for HTTPS fetches.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

WORKDIR /repo

# Workspace manifests first for dependency-layer caching.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY DotVttEditor/package.json DotVttEditor/package.json
COPY DotOcrApp/package.json DotOcrApp/package.json

# Install only the OCR app + its workspace deps (pulls @dottools/shared).
# trustLockfile:true (in pnpm-workspace.yaml) skips re-verification here.
RUN pnpm install --filter @dottools/ocr-app... --frozen-lockfile

# Sources.
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY DotOcrApp DotOcrApp

WORKDIR /repo/DotOcrApp
ENV NODE_ENV=production
EXPOSE 8000

# tsx runs the TS entrypoint directly — no separate build step.
CMD ["pnpm", "start"]
