#!/usr/bin/env node
/** Capture for: require-explicit-check-in-and-check-out.mdx
 * Shows: Settings → Bookings, the "Explicit check-in requirement" and
 * "Explicit check-out requirement" cards with their per-role switches.
 * Read-only: navigates and screenshots, never flips a switch. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

/** Scrolls a settings card heading into view with a little headroom. */
async function scrollToCard(page, heading) {
  const el = page.locator(`h3:has-text("${heading}"), h2:has-text("${heading}")`).first();
  if ((await el.count()) === 0) {
    throw new Error(`Card heading not found on /settings/bookings: ${heading}`);
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollBy(0, -100));
  await page.waitForTimeout(600);
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-explicit-requirement-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/settings/bookings");

    // Shot 1: the check-out card, the new one.
    console.log("Capturing the explicit check-out requirement card...");
    await scrollToCard(page, "Explicit check-out requirement");
    await initAnnotations(page);
    await highlight(page, "text:Require explicit check-out for Admins", { spotlight: true, padding: 10 });
    await callout(
      page,
      "text:Require explicit check-out for Admins",
      "Turn this on and Admins lose the one-click Check out. They scan or select the assets instead.",
      { label: "Per role", side: "right" }
    );
    await caption(page, "Settings → Bookings — Explicit check-out requirement. Only the workspace owner can change it.");
    const checkout = await screenshot(page, join(tmpDir, "explicit-checkout-requirement.png"));
    await clearAll(page);

    // Shot 2: both cards together, so the pair reads as a pair.
    console.log("Capturing the check-in and check-out cards together...");
    await scrollToCard(page, "Explicit check-in requirement");
    await initAnnotations(page);
    await caption(page, "The two requirements are twins: one governs handing gear out, the other governs taking it back.");
    const pair = await screenshot(page, join(tmpDir, "explicit-requirement-cards.png"));
    await clearAll(page);
    await ctx.close();

    const urls = {};
    urls.checkout = await upload(toWebP(checkout), `${BUCKET_PREFIX}/explicit-checkout-requirement.webp`);
    urls.pair = await upload(toWebP(pair), `${BUCKET_PREFIX}/explicit-requirement-cards.webp`);
    Object.values(urls).forEach((u) => console.log(`  OK ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
