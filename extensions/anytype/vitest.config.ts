import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    alias: {
      "@raycast/api": path.resolve(__dirname, "./test-utils/raycast-api-mock.ts"),
    },
    environment: "jsdom",
  },
});
