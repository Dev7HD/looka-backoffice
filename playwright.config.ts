import { defineConfig, devices } from "@playwright/test";

/** E2E config — drives the app in mock mode against the Vite dev server. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Drive the app with mock adapters regardless of any local .env.
    env: {
      VITE_AUTH_MODE: "mock",
      VITE_USE_MOCK_API: "true",
      VITE_USE_MOCK_WS: "true",
    },
  },
});
