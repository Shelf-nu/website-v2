#!/usr/bin/env node
/** Capture for: where-an-asset-was-last-scanned.mdx (shelf.nu#3222)
 * Shows: the Last scan card (re-shot, its Source row wording changed in #3222)
 * and the Scan history sheet that "View all scans" opens.
 * Read-only: opens a sheet and closes it; nothing is submitted or changed. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";
const ASSET_ID = process.env.ASSET_ID || "cmr91tea000abndi749v99g3g";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-scan-history-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, `/assets/${ASSET_ID}/overview`);

    const tagged = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((el) => el.textContent.trim() === "Scanned By");
      const card = p && p.closest(".rounded-md.border");
      if (!card) return null;
      card.id = "last-scan-card";
      return card.innerText;
    });
    if (!tagged) throw new Error("Last scan card not found on the page");
    if (!/Source/.test(tagged) || !/Date\/Time/.test(tagged)) throw new Error("Card rows missing: " + tagged);
    console.log("Card text:\n" + tagged);
    const viewAll = page.getByRole("button", { name: "View all scans" });
    if (!(await viewAll.count())) throw new Error("No 'View all scans' button on the card");
    await page.locator("#last-scan-card").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 160));
    await page.waitForTimeout(600);

    // Re-shoot the card: close-up and in place (same file names as the #416 capture).
    const close = await screenshot(page, join(tmpDir, "last-scan-card-close.png"), { selector: "#last-scan-card" });
    await initAnnotations(page);
    await highlight(page, "#last-scan-card", { spotlight: true, padding: 8 });
    await callout(page, "text:View all scans", "Opens the asset's full scan history, newest first.", { label: "View all scans", side: "top" });
    await caption(page, "The Last scan card on an asset page, with View all scans for the full history.");
    const shot = await screenshot(page, join(tmpDir, "last-scan-card.png"));
    await clearAll(page);

    // Open the sheet and read it before shooting.
    await viewAll.click();
    const title = page.getByText("Scan history", { exact: true });
    await title.first().waitFor({ state: "visible", timeout: 20000 });
    await page.waitForTimeout(1500);
    const sheetText = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2, h3, [role=heading]")].find((el) => el.textContent.trim() === "Scan history");
      const sheet = h && (h.closest("[role=dialog]") || h.parentElement);
      return sheet ? sheet.innerText : null;
    });
    if (!sheetText) throw new Error("Scan history sheet did not open");
    console.log("Sheet text:\n" + sheetText);
    if (!/Scanned by/.test(sheetText)) throw new Error("Sheet has no rows: " + sheetText);
    const sheetShot = await screenshot(page, join(tmpDir, "scan-history-sheet.png"));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);
    await ctx.close();

    const u1 = await upload(toWebP(shot), `${BUCKET_PREFIX}/last-scan-card.webp`);
    const u2 = await upload(toWebP(close), `${BUCKET_PREFIX}/last-scan-card-close.webp`);
    const u3 = await upload(toWebP(sheetShot), `${BUCKET_PREFIX}/scan-history-sheet.webp`);
    console.log(`  OK ${u1}\n  OK ${u2}\n  OK ${u3}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
