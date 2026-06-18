import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "ocr-app",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
