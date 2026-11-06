#!/usr/bin/env node
/** Capture for: getting-started-with-reports.mdx (Read the Asset Activity Summary)
 * Shows: Asset Activity Summary with the Details column, names and Archived/Reinstated rows */
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

async function main() {
  const tmpDir = process.env.OUT_DIR || (await mkdtemp(join(tmpdir(), "shelf-activity-summary-")));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser, { viewport: { width: 1600, height: 1000 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, "/reports/asset-activity?timeframe=last_7d");
    await page.waitForSelector('text=Details', { timeout: 60000 });
    await page.waitForTimeout(1500);
    const table = page.locator("table").first();
    await table.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -260));
    await page.waitForTimeout(500);
    const shot = await screenshot(page, join(tmpDir, "activity-summary-details.png"));
    console.log("shot:", shot);
    if (process.env.UPLOAD === "1") {
      const webp = toWebP(shot);
      console.log("  ✅", await upload(webp, "knowledgebase/activity-summary-details.webp"));
    }
  } finally {
    if (browser) await browser.close();
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
