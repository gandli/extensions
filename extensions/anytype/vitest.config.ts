import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    alias: {
      "@raycast/api": path.resolve(__dirname, "./test/mocks/raycast-api.ts"),
    },
  },
});
