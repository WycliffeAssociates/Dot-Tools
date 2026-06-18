import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "playlist-cache",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
