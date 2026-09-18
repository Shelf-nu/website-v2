#!/usr/bin/env node

/**
 * Capture for: the homepage refresh (hero views, feature moments).
 *
 * Why this exists: every product screenshot the site had was captured at 1x
 * (1440x900 or smaller). A hero that is ~1200 CSS px wide needs ~2400 real
 * pixels on a retina screen, so those files looked soft. This captures the
 * same demo workspace at 2x.
 *
 * Unlike the article captures it uploads NOTHING. It writes PNGs to
 * .captures/homepage-refresh/ (gitignored); the chosen frames are cropped,
 * converted and committed under public/images/home/ by hand.
 *
 * Usage:
 *   node scripts/media-pipeline/run.mjs homepage-refresh
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../../../.captures/homepage-refresh");

// Two logical widths at 2x. The narrower one makes the UI read larger once it
// is scaled into the hero; the wider one shows more columns. Pick per view.
const SIZES = [
  { tag: "1280", viewport: { width: 1280, height: 800 } },
  { tag: "1440", viewport: { width: 1440, height: 900 } },
];
const SCALE = 2;

/** Let data, avatars and thumbnails finish before the frame is taken. */
async function settle(page, ms = 2500) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {
    // Long-polling keeps the network busy on some pages; the fixed wait covers it.
  }
  await page.waitForTimeout(ms);
}

async function shot(page, name, log) {
  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  log.push({ name, url: page.url(), file });
  console.log(`📸 ${name}  ←  ${page.url()}`);
}

/** Run one capture step; a miss is logged and the run carries on. */
async function step(label, log, fn) {
  try {
    await fn();
  } catch (err) {
    console.warn(`⚠️  skipped ${label}: ${err.message.split("\n")[0]}`);
    log.push({ name: label, skipped: err.message.split("\n")[0] });
  }
}

async function captureAt(browser, storageState, size, log) {
  const context = await createContext(browser, {
    viewport: size.viewport,
    deviceScaleFactor: SCALE,
    storageState,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const t = size.tag;

  await step(`assets-${t}`, log, async () => {
    await navigateTo(page, "/assets");
    await settle(page);
    await shot(page, `assets-${t}`, log);
  });

  await step(`availability-${t}`, log, async () => {
    await navigateTo(page, "/assets");
    await settle(page, 1500);
    await page.click('[aria-label="Switch to availability view"]');
    await settle(page, 3000);
    await shot(page, `availability-${t}`, log);
  });

  await step(`asset-page-${t}`, log, async () => {
    await navigateTo(page, "/assets");
    await settle(page, 1500);
    // First asset row that links to an asset page
    const href = await page.$$eval('a[href^="/assets/"]', (as) => {
      const hit = as.map((a) => a.getAttribute("href")).find((h) => /^\/assets\/[a-z0-9]{10,}/i.test(h) && !/\/(new|import)/.test(h));
      return hit || null;
    });
    if (!href) throw new Error("no asset link found on /assets");
    await navigateTo(page, href.split("?")[0]);
    await settle(page);
    await shot(page, `asset-page-${t}`, log);
  });

  for (const [name, path] of [
    ["home", "/home"],
    ["bookings", "/bookings"],
    ["calendar", "/calendar"],
    ["kits", "/kits"],
    ["audits", "/audits"],
    ["reports", "/reports"],
    ["locations", "/locations"],
  ]) {
    await step(`${name}-${t}`, log, async () => {
      await navigateTo(page, path);
      await settle(page);
      await shot(page, `${name}-${t}`, log);
    });
  }

  await step(`booking-page-${t}`, log, async () => {
    await navigateTo(page, "/bookings");
    await settle(page, 1500);
    const href = await page.$$eval('a[href^="/bookings/"]', (as) => {
      const hit = as.map((a) => a.getAttribute("href")).find((h) => /^\/bookings\/[a-z0-9]{10,}/i.test(h) && !/\/new/.test(h));
      return hit || null;
    });
    if (!href) throw new Error("no booking link found on /bookings");
    await navigateTo(page, href.split("?")[0]);
    await settle(page);
    await shot(page, `booking-page-${t}`, log);
  });

  await context.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Writing to: ${OUT}`);
  const log = [];
  let browser;
  try {
    browser = await launchBrowser();

    // Sign in once, off to the side, and reuse the session for every size.
    const authContext = await createContext(browser);
    const authPage = await authContext.newPage();
    authPage.setDefaultTimeout(60000);
    await loginToShelf(authPage);
    const storageState = await authContext.storageState();
    await authContext.close();

    for (const size of SIZES) {
      console.log(`\n— ${size.viewport.width}x${size.viewport.height} @${SCALE}x —`);
      await captureAt(browser, storageState, size, log);
    }
  } finally {
    if (browser) await browser.close();
  }

  await writeFile(join(OUT, "manifest.json"), JSON.stringify({ capturedAt: new Date().toISOString(), scale: SCALE, shots: log }, null, 2));
  const ok = log.filter((l) => l.file).length;
  console.log(`\n✅ ${ok} frames captured, ${log.length - ok} skipped. See ${join(OUT, "manifest.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
