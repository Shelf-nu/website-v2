#!/usr/bin/env node
/** Capture for: where-an-asset-was-last-scanned.mdx (shelf.nu#3124)
 * Shows: the Last scan card on an asset's overview page in the demo workspace.
 * Read-only: nothing is clicked, submitted or changed. */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-last-scan-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, `/assets/${ASSET_ID}/overview`);

    // Find the card by its "Scanned By" row and tag it so the annotations can target it.
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
    await page.locator("#last-scan-card").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Close-up of the card alone (used by the update entry).
    const close = await screenshot(page, join(tmpDir, "last-scan-card-close.png"), { selector: "#last-scan-card" });

    // The card in place on the asset page, spotlighted.
    await initAnnotations(page);
    await highlight(page, "#last-scan-card", { spotlight: true, padding: 8 });
    await callout(page, "text:Source", "Says how the asset was last scanned: QR code, barcode or SAM ID, or a manual GPS update.", { label: "Source", side: "left" });
    await caption(page, "The Last scan card on an asset page: when, where, from which device, by whom, and with which code.");
    const shot = await screenshot(page, join(tmpDir, "last-scan-card.png"));
    await clearAll(page);
    await ctx.close();

    const u1 = await upload(toWebP(shot), `${BUCKET_PREFIX}/last-scan-card.webp`);
    const u2 = await upload(toWebP(close), `${BUCKET_PREFIX}/last-scan-card-close.webp`);
    console.log(`  OK ${u1}\n  OK ${u2}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
