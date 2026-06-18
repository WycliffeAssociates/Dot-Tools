import { serve } from "@hono/node-server";
import { loadConfig } from "./config.ts";
import { buildServer } from "./server.ts";

const config = loadConfig();
const app = buildServer(config);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  // eslint-disable-next-line no-console
  console.log(`DotOcrApp listening on http://localhost:${info.port}`);
  // eslint-disable-next-line no-console
  console.log(
    `OCR execution providers (first available wins): ${config.ocr.executionProviders.join(", ")}`,
  );
});
