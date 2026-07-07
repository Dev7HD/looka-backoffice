/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts",
    css: false,
    restoreMocks: true,
    // Force mock adapters in tests regardless of any local .env.
    env: {
      VITE_AUTH_MODE: "mock",
      VITE_USE_MOCK_API: "true",
      VITE_USE_MOCK_WS: "true",
      // Keep FCM disabled so tests don't depend on a developer's .env.local.
      VITE_FCM_API_KEY: "",
      VITE_FCM_PROJECT_ID: "",
      VITE_FCM_VAPID_KEY: "",
    },
    // Vitest owns src unit/component tests; Playwright owns e2e/.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
