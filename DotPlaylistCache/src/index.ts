import type { Env } from "./env.ts";
import { buildClient } from "./env.ts";
import { handleRequest } from "./router.ts";
import { readIndex, warmAll } from "./warm.ts";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // First-request cold start: if the cache was never warmed, kick a full warm
    // in the background so subsequent requests are HITs. The current request is
    // still served immediately (per-key MISS path fetches live if needed).
    ctx.waitUntil(
      (async () => {
        if ((await readIndex(env.BRIGHTCOVE_PLAYLISTS)) === null) {
          await warmAll({ client: buildClient(env), kv: env.BRIGHTCOVE_PLAYLISTS }).catch((err) => {
            console.error("cold-start warmAll failed", err);
          });
        }
      })(),
    );
    return handleRequest(request, env);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      (async () => {
        try {
          const index = await warmAll({ client: buildClient(env), kv: env.BRIGHTCOVE_PLAYLISTS });
          console.log(
            `warmed ${index.okCount}/${index.playlistCount} playlists` +
              (index.errors.length ? `, ${index.errors.length} errors` : ""),
          );
        } catch (err) {
          console.error("scheduled warmAll failed", err);
        }
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
