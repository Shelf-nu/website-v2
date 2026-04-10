import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Shelf website perf tests.
 *
 * WebKit is a first-class project because the Shelf marketing site jank
 * we're hunting is Safari-specific. Chromium runs for parity.
 *
 * Tests live in perf/ and expect a production build served at PERF_BASE_URL
 * (default http://localhost:4173). For local iteration:
 *
 *   npm run build
 *   npx serve out -l 4173 &
 *   npm run test:perf
 *
 * In CI, the perf workflow does build + serve, so no manual steps needed.
 */

const PORT = Number(process.env.PERF_PORT ?? 4173);
const BASE_URL = process.env.PERF_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./perf",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // Perf tests must not compete for CPU — run serially.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ["list"],
    ["json", { outputFile: "perf/results/latest.json" }],
    ["html", { outputFolder: "perf/results/html", open: "never" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],

  // Only auto-start the server if a) we're in CI, or b) nothing is already
  // listening on PORT. Local devs who already ran `npx serve out -l 4173`
  // get fast iteration via reuseExistingServer.
  webServer: process.env.PERF_SKIP_SERVER
    ? undefined
    : {
        command: `npx --yes serve out -l ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
