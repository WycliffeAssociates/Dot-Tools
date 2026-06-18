import { defineConfig } from "astro/config";
import UnoCSS from "@unocss/astro";
import solidJs from "@astrojs/solid-js";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [UnoCSS(), solidJs()],
  output: "server",
  // No sessions in this app — use the null driver so we don't require a
  // Cloudflare KV "SESSION" namespace at deploy time.
  session: {
    driver: { entrypoint: "unstorage/drivers/null" },
  },
  // astro dev/preview run on the real workerd runtime (Cloudflare Vite plugin),
  // and bindings come from wrangler.jsonc automatically — no platformProxy
  // needed. The R2 buckets there are marked `remote: true`, so dev reads/writes
  // hit the real provisioned buckets (run `wrangler dev --local` for simulated
  // R2). imageService "compile" avoids requiring a Cloudflare Images binding
  // (the v13 default is "cloudflare-binding").
  adapter: cloudflare({
    imageService: "compile",
    // Remote bindings (dev/check/build session) hit the real buckets — great
    // locally, but in CI it would need `wrangler login` and touch real infra
    // just to type-check/build. GitHub Actions sets CI=true, so there we fall
    // back to simulated bindings. `wrangler deploy` is unaffected — the
    // deployed Worker always binds the real buckets by name.
    remoteBindings: !process.env.CI,
  }),
});
