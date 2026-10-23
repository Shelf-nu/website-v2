#!/usr/bin/env node

/**
 * Capture the "Check how your columns map" review on /assets/import for:
 * content/knowledge-base/importing-assets-to-shelf-csv-guide.mdx
 * content/knowledge-base/switching-from-another-asset-tool.mdx
 * content/updates/import-a-spreadsheet-from-any-tool.mdx
 *
 * Uploads a small Sortly-style export and presses Continue, which only
 * analyzes the file (shelf.nu #3215, intent=analyze). The script stops on the
 * review: it never presses Preview import or Import, so nothing is created.
 * The waits double as the deployment probe: if production does not show the
 * review, the script throws instead of publishing a screenshot.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
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
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

// Headings as another tool exports them, not Shelf's template.
const CSV = [
  "Entry Name,Notes,Sortly ID,Unit,Min Level,Price,Quantity,Tags,Primary Folder",
  'HDMI cable 2m,Keep in bin 3,SID-000101,pcs,5,4.50,10,"cables, av",Warehouse',
  "AA batteries,Pack of 4,SID-000102,packs,10,3.20,20,consumables,Warehouse",
  "Gaffer tape,Black 50mm,SID-000103,rolls,4,8.90,12,consumables,Studio",
].join("\n");

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-import-column-mapping-"));
  console.log(`Working in: ${tmpDir}`);
  const csvPath = join(tmpDir, "inventory-export.csv");
  await writeFile(csvPath, CSV + "\n");

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/assets/import");
    await page
      .locator("text=/Already have a spreadsheet from another tool/")
      .first()
      .waitFor({ state: "visible" });

    await page.locator('input[type="file"]').first().setInputFiles(csvPath);
    await page.getByRole("button", { name: "Continue" }).first().click();

    // The review itself: confidence dots and the tracking question that a
    // quantity column without a type column asks.
    await page
      .locator("text=/Sure match|Guess, please check/")
      .first()
      .waitFor({ state: "visible" });
    await page
      .locator("text=/How should these rows be tracked/")
      .first()
      .waitFor({ state: "visible" });

    // Start the frame at the review's heading, and log the review's text so
    // the articles can quote it word for word.
    const heading = page.locator('text="Check how your columns map"').first();
    await heading.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -24));
    await page.waitForTimeout(800);
    const reviewText = await heading.evaluate(
      (el) => el.parentElement?.innerText ?? ""
    );
    console.log("----- review text -----\n" + reviewText + "\n-----");

    await initAnnotations(page);
    await caption(
      page,
      "Assets → Import → Continue: Shelf proposes a Shelf field for every column of your file"
    );
    const shot = await screenshot(page, join(tmpDir, "import-column-mapping.png"));
    await clearAll(page);
    await context.close();

    console.log("🔄 Converting...");
    const webp = toWebP(shot);
    console.log("☁️  Uploading...");
    const url = await upload(webp, `${BUCKET_PREFIX}/import-column-mapping.webp`);
    console.log(`  ✅ ${url}`);
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
