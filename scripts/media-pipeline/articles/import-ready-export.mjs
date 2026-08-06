#!/usr/bin/env node

/**
 * Capture the assets-index export popover for:
 * content/knowledge-base/export-exporting-workspace-data-from-shelf.mdx
 *
 * Shows: Format (Standard / Import-ready) + Columns (Visible / All) options
 * introduced by shelf.nu #2714, with the Import-ready hint text rewritten by
 * shelf.nu #2813 now that the same file also feeds the update importer.
 *
 * The hint assertion pins #2813's copy, so a run against a production build
 * that has not shipped it throws rather than republishing the old popover.
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-import-ready-export-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/assets");

    // The row selector is an SVG in the first cell; the click handler sits on
    // the cell, so click that rather than looking for an <input>.
    for (const i of [0, 1]) {
      const cell = page.locator("tbody tr").nth(i).locator("td").first();
      await cell.click({ force: true });
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(600);

    const exportBtn = page.locator('button:has-text("Export selection")').first();
    await exportBtn.waitFor({ state: "visible" });
    await exportBtn.click();

    // Assert the popover is really open and carries #2813's wording before
    // shooting — a silent click failure would otherwise publish a screenshot
    // of the asset list with a caption describing a dialog.
    await page
      .locator("text=/Recreate elsewhere, or re-import to update these/")
      .first()
      .waitFor({ state: "visible" });
    await page.waitForTimeout(600);

    await initAnnotations(page);
    await caption(page, "Assets → select items → Export selection → choose a format");
    const shot = await screenshot(page, join(tmpDir, "export-format-options.png"));
    await clearAll(page);
    await context.close();

    console.log("🔄 Converting...");
    const webp = toWebP(shot);

    console.log("☁️  Uploading...");
    const url = await upload(webp, `${BUCKET_PREFIX}/export-format-options.webp`);
    console.log(`  ✅ ${url}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
