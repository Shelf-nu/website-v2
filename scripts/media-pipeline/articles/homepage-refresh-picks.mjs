#!/usr/bin/env node

/**
 * Second pass for the homepage refresh: the specific frames the hero needs.
 *
 * The first pass (homepage-refresh.mjs) captures each screen as it opens.
 * That is sharp but not always photogenic: the first asset in the list is a
 * sandbag, and the demo workspace has no bookings this week, so the
 * availability view is empty. This pass goes to the good-looking places:
 * the camera gear, a camera's asset page, July 2025 (when the demo
 * workspace has overlapping bookings), and who has what: a member's custody
 * list, in-custody asset pages and the assign-custody dialog.
 *
 * Same rules as the first pass: 2x, read-only, uploads nothing, writes PNGs
 * to .captures/homepage-refresh/ (gitignored).
 *
 * Usage:
 *   node scripts/media-pipeline/run.mjs homepage-refresh-picks
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../../../.captures/homepage-refresh");
const SCALE = 2;
const VIEWPORT = { width: 1280, height: 800 };

/** The month the demo workspace's bookings overlap. */
const TARGET_MONTH = /July,?\s+2025/i;

async function settle(page, ms = 2000) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 8000 });
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

async function step(label, log, fn) {
  try {
    await fn();
  } catch (err) {
    console.warn(`⚠️  skipped ${label}: ${err.message.split("\n")[0]}`);
    log.push({ name: label, skipped: err.message.split("\n")[0] });
  }
}

/** Type into the asset index search and wait for the list to refresh. */
async function searchAssets(page, term) {
  await navigateTo(page, "/assets");
  await settle(page, 1000);
  const input = page.locator('input[placeholder*="Search"]').first();
  await input.fill(term);
  await input.press("Enter");
  await settle(page, 2500);
}

/** The active granularity button is disabled, so only click one that is not already selected. */
async function setGranularity(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (await button.isEnabled()) {
    await button.click();
    await page.waitForTimeout(1500);
  }
}

/** Step the availability header back until it shows the target month. */
async function goToTargetMonth(page) {
  const prev = page.locator('button:has-text("Today")').locator("xpath=preceding-sibling::button[1]");
  for (let i = 0; i < 30; i++) {
    const heading = await page.locator("h1, h2, h3, div").filter({ hasText: /^[A-Z][a-z]+,?\s+20\d\d$/ }).first().textContent().catch(() => "");
    if (heading && TARGET_MONTH.test(heading)) return heading.trim();
    await prev.click();
    await page.waitForTimeout(900);
  }
  throw new Error("could not reach July 2025 in 30 steps");
}

/**
 * From the asset index, open the availability view at Month and step back to
 * the target month. The toggle keeps the URL's other params, so a search made
 * first survives it. The month itself lives only in the calendar, not the URL,
 * so nothing that reloads the index may come after this.
 */
async function openAvailabilityMonth(page) {
  await page.click('[aria-label="Switch to availability view"]');
  await settle(page, 2500);
  await setGranularity(page, "Month");
  return goToTargetMonth(page);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Writing to: ${OUT}`);
  const log = [];
  let browser;
  try {
    browser = await launchBrowser();

    const authContext = await createContext(browser);
    const authPage = await authContext.newPage();
    authPage.setDefaultTimeout(60000);
    await loginToShelf(authPage);
    const storageState = await authContext.storageState();
    await authContext.close();

    const context = await createContext(browser, { viewport: VIEWPORT, deviceScaleFactor: SCALE, storageState });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);

    // 1. The asset index, showing the camera gear
    await step("pick-assets-camera", log, async () => {
      await searchAssets(page, "camera");
      await shot(page, "pick-assets-camera", log);
    });

    // 2. A camera's own page (three candidates; the best one is chosen by eye)
    for (const [slug, name] of [["sony-alpha-1", "Sony Alpha 1"], ["canon-c200b", "Canon C200B"], ["red-komodo", "RED Digital Cinema KOMODO"]]) {
      await step(`pick-asset-${slug}`, log, async () => {
        await searchAssets(page, name);
        await page.locator("a", { hasText: name }).first().click();
        await page.waitForURL(/\/assets\/[a-z0-9]+/i, { timeout: 20000 });
        await settle(page, 2500);
        await shot(page, `pick-asset-${slug}`, log);
      });
    }

    // 3. Availability in July 2025: month, then three consecutive weeks
    await step("pick-availability", log, async () => {
      await navigateTo(page, "/assets");
      await settle(page, 1000);
      const where = await openAvailabilityMonth(page);
      console.log(`   availability is at: ${where}`);
      await settle(page, 1500);
      await shot(page, "pick-availability-month", log);

      await setGranularity(page, "Week");
      await settle(page, 1500);
      const next = page.locator('button:has-text("Today")').locator("xpath=following-sibling::button[1]");
      for (let week = 1; week <= 3; week++) {
        await shot(page, `pick-availability-week-${week}`, log);
        await next.click();
        await settle(page, 1200);
      }
    });

    // 4. The same month with only the camera gear in the rows. It sets up its own view
    //    instead of reusing step 3's page, which ends in Week view a month later (or
    //    anywhere at all, if step 3 failed). Filter first, then open the month.
    await step("pick-availability-camera", log, async () => {
      await searchAssets(page, "camera");
      const where = await openAvailabilityMonth(page);
      console.log(`   availability (camera) is at: ${where}`);
      await settle(page, 1500);
      await shot(page, "pick-availability-camera", log);
    });

    // 5. A booking with a full kit list
    await step("pick-booking", log, async () => {
      await navigateTo(page, "/bookings");
      await settle(page, 1000);
      await page.locator("a", { hasText: "New Building Aerial Photography" }).first().click();
      await page.waitForURL(/\/bookings\/[a-z0-9]+/i, { timeout: 20000 });
      await settle(page, 2500);
      await shot(page, "pick-booking", log);
    });

    // 6. "Who has it": a demo member's custody list, in-custody asset pages, and the assign-custody dialog.
    //    John Doe (john@shelf.nu) is the demo user. Do not capture the team LIST: it shows real people's emails.
    await step("pick-custody-member", log, async () => {
      await navigateTo(page, "/settings/team/users");
      await settle(page, 1500);
      await page.locator('a[href*="/settings/team/users/"]', { hasText: "John Doe" }).first().click();
      await page.waitForURL(/\/settings\/team\/users\/[^/?]+/i, { timeout: 20000 });
      const member = new URL(page.url()).pathname.match(/^\/settings\/team\/users\/[^/]+/)[0];
      await navigateTo(page, `${member}/assets`);
      await settle(page, 2500);
      await shot(page, "pick-custody-member", log);
    });

    for (const [slug, name] of [["tascam", "Tascam DR-40X"], ["dell", "Dell UltraSharp U2720Q"]]) {
      await step(`pick-in-custody-${slug}`, log, async () => {
        await searchAssets(page, name);
        await page.locator("a", { hasText: name }).first().click();
        await page.waitForURL(/\/assets\/[a-z0-9]+/i, { timeout: 20000 });
        await settle(page, 2500);
        await shot(page, `pick-in-custody-${slug}`, log);
      });
    }

    await step("pick-assign-custody", log, async () => {
      await searchAssets(page, "Sony Alpha 1");
      await page.locator("a", { hasText: "Sony Alpha 1" }).first().click();
      await page.waitForURL(/\/assets\/[a-z0-9]+/i, { timeout: 20000 });
      const asset = new URL(page.url()).pathname.match(/^\/assets\/[^/]+/)[0];
      // Opens the dialog only. Nothing is submitted.
      await navigateTo(page, `${asset}/overview/assign-custody`);
      await settle(page, 2000);
      await shot(page, "pick-assign-custody", log);
    });

    await context.close();
  } finally {
    if (browser) await browser.close();
  }

  await writeFile(join(OUT, "manifest-picks.json"), JSON.stringify({ capturedAt: new Date().toISOString(), scale: SCALE, shots: log }, null, 2));
  const ok = log.filter((l) => l.file).length;
  console.log(`\n✅ ${ok} frames captured, ${log.length - ok} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
