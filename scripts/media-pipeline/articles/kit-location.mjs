#!/usr/bin/env node

/**
 * Capture annotated screenshots for the kit-location cascade:
 * content/knowledge-base/kits.mdx  (## Kit Location)
 * content/updates/kit-location-moves-its-assets.mdx
 *
 * Triggered by shelf.nu PR #2752 — a kit's location now moves its member assets.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  launchBrowser,
  createContext,
  loginToShelf,
  navigateTo,
} from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import {
  initAnnotations,
  highlight,
  callout,
  caption,
  clearAll,
} from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

/** First real kit href on the Kits index (skip reserved paths). */
async function getFirstKitHref(page) {
  return page.evaluate(() => {
    const reserved = new Set(["new", "import"]);
    const links = Array.from(document.querySelectorAll('a[href^="/kits/"]'));
    for (const link of links) {
      const href = link.getAttribute("href");
      const slug = href.split("/")[2] ?? "";
      if (slug.length >= 6 && !reserved.has(slug)) return `/kits/${slug}`;
    }
    return null;
  });
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-kit-location-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/kits");
    const kitHref = await getFirstKitHref(page);
    if (!kitHref) throw new Error("No kits found in workspace");
    console.log(`Using kit: ${kitHref}`);

    // ── Screenshot 1: the Update location dialog on a kit ───────────────
    console.log("📸 Capturing kit Update location dialog...");
    await navigateTo(page, `${kitHref}/assets/update-location`);
    await page.waitForTimeout(2000);
    await initAnnotations(page);
    await caption(
      page,
      "Changing a kit's location moves every asset inside it to the same place"
    );
    const shot1 = await screenshot(page, join(tmpDir, "kit-update-location.png"));
    await clearAll(page);

    // ── Screenshot 2: Kits index bulk Update location ───────────────────
    console.log("📸 Capturing Kits index bulk action...");
    await navigateTo(page, "/kits");
    await page.waitForTimeout(1500);

    // Tick the first two rows so the Actions dropdown's bulk items light up.
    // The rows use custom checkbox buttons, so target the first cell of each
    // body row rather than a native input.
    const rowBoxes = page.locator("table tbody tr td:first-child");
    const rowCount = await rowBoxes.count();
    for (let i = 0; i < Math.min(2, rowCount); i++) {
      await rowBoxes.nth(i).click({ position: { x: 12, y: 12 } }).catch(() => {});
      await page.waitForTimeout(400);
    }

    // Open the Actions dropdown so "Update location" is visible on screen.
    await page.locator("text=Actions").first().click().catch(() => {});
    await page.waitForTimeout(1200);

    await initAnnotations(page);
    await caption(
      page,
      "Select kits on the index and choose Actions → Update location to move several kits, and everything inside them, at once"
    );
    const shot2 = await screenshot(page, join(tmpDir, "kits-bulk-location.png"));
    await clearAll(page);

    await context.close();

    // ── Convert + Upload ───────────────────────────────────────────────
    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const webp2 = toWebP(shot2);

    console.log("☁️  Uploading...");
    const urls = {};
    urls.dialog = await upload(
      webp1,
      `${BUCKET_PREFIX}/kit-update-location.webp`
    );
    urls.bulk = await upload(webp2, `${BUCKET_PREFIX}/kits-bulk-location.webp`);
    Object.values(urls).forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
