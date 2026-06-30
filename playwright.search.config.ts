import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the search-quality regression harness.
 *
 * Separate from playwright.config.ts (perf) because this suite has nothing to
 * do with rendering performance — it loads the built Pagefind index and asserts
 * that real queries surface the right canonical page. Ranking is identical
 * across browser engines (pure JS + WASM), so we only run Chromium.
 *
 * Tests live in search-quality/ and expect a production build served at
 * SEARCH_BASE_URL (default http://localhost:4174). Local iteration:
 *
 *   npm run build
 *   npm run search:quality
 *
 * The webServer auto-serves out/ (reused if you already have one running).
 */

const PORT = Number(process.env.SEARCH_PORT ?? 4174);
const BASE_URL = process.env.SEARCH_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./search-quality",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: process.env.SEARCH_SKIP_SERVER
    ? undefined
    : {
        command: `npx --yes serve out -l ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
