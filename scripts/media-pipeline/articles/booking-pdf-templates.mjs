#!/usr/bin/env node

/**
 * Capture the booking PDF templates card (shelf.nu #3354) for:
 * content/knowledge-base/how-to-generate-a-pdf-overview-of-your-reserved-assets-bookings.mdx
 *
 * 1. Settings → Bookings, the "PDF templates" card (Checklist = Default template, Check-out receipt).
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-booking-pdf-templates-"));
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    console.log("📸 Settings → Bookings → PDF templates...");
    await navigateTo(page, "/settings/bookings");
    const heading = page.getByRole("heading", { name: "PDF templates" }).first();
    if ((await heading.count()) === 0) throw new Error("'PDF templates' card not found");
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollBy(0, -60));
    await page.waitForTimeout(600);
    if ((await page.locator("text=Check-out receipt").count()) === 0) {
      throw new Error("Check-out receipt row not found");
    }
    await initAnnotations(page);
    await highlight(page, "text:Default template", { spotlight: true, padding: 10 });
    await caption(page, "Settings → Bookings → PDF templates");
    const settingsShot = await screenshot(page, join(tmpDir, "booking-pdf-templates-settings.png"));
    await clearAll(page);

    await context.close();

    const urls = [];
    urls.push(await upload(toWebP(settingsShot), `${BUCKET_PREFIX}/booking-pdf-templates-settings.webp`));
    urls.forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    await browser.close();
  }
}

await main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
