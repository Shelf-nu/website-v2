#!/usr/bin/env node
/**
 * Capture for shelf.nu #3271: the Top Booked Kits report with a Location filter applied.
 * content/knowledge-base/getting-started-with-reports.mdx, content/updates/top-booked-kits-filters-apply-and-idle-assets-pages-add-up.mdx
 * Read-only: opens the Location dropdown, picks Studio A, screenshots the filtered report.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-top-booked-kits-"));
  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, "/reports/top-booked-kits?timeframe=all-time");
    await page.waitForTimeout(3000);
    const before = await page.locator("main").innerText().catch(() => "");
    console.log("report excerpt before filter:\n" + before.slice(0, 900));
    const loc = page.getByRole("button", { name: /^Location/ }).first();
    if (!(await loc.isVisible().catch(() => false))) {
      console.log("buttons: " + (await page.getByRole("button").allInnerTexts()).slice(0, 40).join(" | "));
      throw new Error("Location filter button not found");
    }
    await loc.click();
    await page.waitForTimeout(800);
    const pop = page.locator('[data-radix-popper-content-wrapper], [role="dialog"], [role="menu"], [role="listbox"]').last();
    console.log("popover text: " + (await pop.innerText().catch(() => "(none)")).slice(0, 600));
    const pick = pop.getByText("Studio A", { exact: true }).first();
    if (!(await pick.isVisible().catch(() => false))) throw new Error("Studio A option not visible");
    console.log("picking: " + (await pick.innerText()));
    await pick.click();
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(2500);
    const after = await page.locator("main").innerText().catch(() => "");
    console.log("report excerpt after filter:\n" + after.slice(0, 900));
    await initAnnotations(page);
    await caption(page, "Top Booked Kits with a Location filter: the table, the totals and the CSV follow it");
    const shot = await screenshot(page, join(tmpDir, "top-booked-kits-location-filter.png"));
    await clearAll(page);
    urls.report = await upload(toWebP(shot), `${BUCKET_PREFIX}/top-booked-kits-location-filter.webp`);
    await context.close();
    Object.entries(urls).forEach(([k, u]) => console.log(`  ✅ ${k}: ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
