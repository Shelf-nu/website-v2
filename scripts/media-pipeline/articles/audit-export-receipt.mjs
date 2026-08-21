#!/usr/bin/env node
/**
 * Capture what an audit can actually export, for content/features/audits.mdx.
 *
 * The site claimed a CSV export of audit results in five places. There is none.
 * The results export is Actions -> Download Receipt (a PDF); the only CSV an
 * audit produces is the note log on the Activity tab.
 *
 * Source of truth:
 *   apps/webapp/app/components/audit/actions-dropdown.tsx ("Download Receipt")
 *   apps/webapp/app/components/audit/notes/index.tsx ("Export activity CSV")
 *   apps/webapp/app/routes/_layout+/audits.$auditId.activity[.csv].ts
 *
 * Read-only: navigates and opens the Actions popover. Submits nothing.
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
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "features";
const COMPLETED_AUDIT = "cmpqvmujp002dqbi0wcj66g9l"; // "Find these" — 42/9/33/1

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-auditexport-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  const urls = {};
  try {
    browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1 — the Actions menu, whose only export item is the PDF receipt.
    await navigateTo(page, `/audits/${COMPLETED_AUDIT}/overview`);
    await page.waitForTimeout(2500);
    await page.locator('button:has-text("Actions")').first().click();
    // Assert the item is on screen so selector drift throws instead of
    // publishing an image that contradicts its caption.
    await page
      .locator('text="Download Receipt"')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(800);
    await initAnnotations(page);
    await highlight(page, "text:Download Receipt", { spotlight: true, padding: 8 });
    await caption(
      page,
      "Actions > Download Receipt is the audit results export. It builds a PDF, not a CSV."
    );
    const shot1 = await screenshot(page, join(tmpDir, "audit-download-receipt.png"));
    await clearAll(page);
    await page.keyboard.press("Escape");

    // Shot 2 — the Activity tab, where the one audit CSV lives.
    await navigateTo(page, `/audits/${COMPLETED_AUDIT}/activity`);
    await page.waitForTimeout(2500);
    const csvBtn = page.locator('a:has-text("Export activity CSV")').first();
    await csvBtn.waitFor({ state: "visible", timeout: 30000 });
    await initAnnotations(page);
    await highlight(page, "text:Export activity CSV", { spotlight: true, padding: 8 });
    await caption(
      page,
      "The Activity tab exports the note log as CSV. It is the evidence trail, not the asset results."
    );
    const shot2 = await screenshot(page, join(tmpDir, "audit-activity-csv.png"));
    await clearAll(page);
    await context.close();

    urls.receipt = await upload(
      toWebP(shot1),
      `${BUCKET_PREFIX}/audit-download-receipt.webp`
    );
    urls.csv = await upload(
      toWebP(shot2),
      `${BUCKET_PREFIX}/audit-activity-csv.webp`
    );
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
