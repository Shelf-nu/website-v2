#!/usr/bin/env node

/**
 * Capture the /assets/import-update instructions panel for:
 * content/knowledge-base/bulk-updating-assets-via-csv.mdx
 *
 * Shows: "What you can update" (asset model + qty-tracked columns), the
 * empty-cell exceptions, and "How assets are matched" as rewritten by
 * shelf.nu #2776 and again by #2813 (Import-ready is now the recommended
 * export format, and Description became updatable).
 *
 * The assertions below pin #2813's copy specifically, so this run doubles
 * as the deployment probe: if production has not shipped #2813 yet, the
 * script throws instead of publishing a screenshot of the old instructions.
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
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-import-update-columns-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/assets/import-update");

    // Assert the rewritten copy is actually on the page before shooting —
    // a selector drift must throw, not publish a mismatched screenshot.
    const heading = page.locator('text="What you can update"').first();
    await heading.waitFor({ state: "visible" });
    await page
      .locator('text="Asset model"')
      .first()
      .waitFor({ state: "visible" });

    // #2813 markers. Step 1 now recommends the Import-ready format, and
    // Description moved from "Not supported yet" into the updatable list.
    await page
      .locator("text=/In the export dialog/")
      .first()
      .waitFor({ state: "visible" });
    await page
      .locator("text=/Name, Description, Category/")
      .first()
      .waitFor({ state: "visible" });

    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    await initAnnotations(page);
    await caption(
      page,
      "Assets → Import → Update existing: the column rules are printed on the page"
    );
    const shot = await screenshot(
      page,
      join(tmpDir, "import-update-columns.png")
    );
    await clearAll(page);
    await context.close();

    console.log("🔄 Converting...");
    const webp = toWebP(shot);

    console.log("☁️  Uploading...");
    const url = await upload(
      webp,
      `${BUCKET_PREFIX}/import-update-columns.webp`
    );
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
