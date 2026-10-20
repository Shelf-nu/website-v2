#!/usr/bin/env node
/** Capture for: advanced-asset-index-complete-guide.mdx, run-your-first-audit.mdx (shelf.nu#3219)
 * Shows: the Last audit date column with its hover card, the asset page's Last audit card,
 * and the audits list filtered to one asset. Read-only: hovers, clicks links, changes nothing. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-last-audit-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, "/assets?per_page=50");

    const header = page.locator("th", { hasText: "Last audit date" });
    if (!(await header.count())) {
      const mode = await page.evaluate(() => document.body.innerText.match(/Advanced|Simple/g));
      throw new Error("No 'Last audit date' header on /assets (mode hints: " + mode + ")");
    }
    await header.first().scrollIntoViewIfNeeded();
    const colIndex = await header.first().evaluate((th) => [...th.parentElement.children].indexOf(th));
    console.log("Column index:", colIndex);

    // Find the first row whose Last audit date cell holds a date.
    const rows = page.locator("tbody tr");
    const n = await rows.count();
    let datedRow = -1, datedText = "";
    for (let i = 0; i < n; i++) {
      const cell = rows.nth(i).locator("td").nth(colIndex);
      const t = (await cell.innerText()).trim();
      if (t && t !== "Never audited" && t !== "Unlock audits") { datedRow = i; datedText = t; break; }
    }
    console.log("Dated row:", datedRow, datedText);
    const sample = [];
    for (let i = 0; i < Math.min(n, 6); i++) sample.push((await rows.nth(i).locator("td").nth(colIndex).innerText()).trim());
    console.log("First cells:", sample);

    const targetRow = rows.nth(datedRow >= 0 ? datedRow : 0);
    const trigger = targetRow.locator("td").nth(colIndex).locator("button");
    await trigger.scrollIntoViewIfNeeded();
    const box = await trigger.boundingBox();
    // Walk the pointer in so the Radix hover card opens.
    await page.mouse.move(box.x - 120, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(250);
    await page.mouse.move(box.x + 4, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(250);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(1800);
    const card = await page.evaluate(() => {
      const w = document.querySelector("[data-radix-popper-content-wrapper]");
      return w ? w.innerText : null;
    });
    console.log("Hover card:\n" + card);
    if (!card) throw new Error("Hover card did not open");
    const assetHref = await targetRow.locator("a[href*='/assets/']").first().getAttribute("href");
    const assetId = assetHref.match(/\/assets\/([^/?]+)/)[1];
    console.log("Asset:", assetId);
    await initAnnotations(page);
    await caption(page, "Last audit date on the advanced asset index. Hover a date for the asset's recent and upcoming audits.");
    const colShot = await screenshot(page, join(tmpDir, "last-audit-date-column.png"));
    await clearAll(page);
    await page.mouse.move(10, 10);

    // The asset page's Last audit card.
    await navigateTo(page, `/assets/${assetId}/overview`);
    const cardText = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((el) => el.textContent.trim() === "Last audit");
      let c = p;
      for (let i = 0; c && i < 6; i++) { c = c.parentElement; if (c && /rounded/.test(c.className) && /border/.test(c.className)) break; }
      if (c && !(/rounded/.test(c.className) && /border/.test(c.className))) c = null;
      if (!c) return null;
      c.id = "last-audit-card";
      return c.innerText;
    });
    console.log("Asset card:\n" + cardText);
    if (!cardText) throw new Error("Last audit card not on the asset page");
    await page.locator("#last-audit-card").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const cardClose = await screenshot(page, join(tmpDir, "last-audit-card-close.png"), { selector: "#last-audit-card" });
    await initAnnotations(page);
    await highlight(page, "#last-audit-card", { spotlight: true, padding: 8 });
    await caption(page, "The Last audit card on an asset page: the last audit and its result, earlier and upcoming audits, and View all audits.");
    const cardShot = await screenshot(page, join(tmpDir, "last-audit-card.png"));
    await clearAll(page);

    // Audits list scoped to the asset.
    await navigateTo(page, `/audits?assetId=${assetId}`);
    const chip = await page.evaluate(() => {
      const el = [...document.querySelectorAll("span")].find((s) => s.textContent.trim() === "Asset:");
      return el ? el.parentElement.innerText : null;
    });
    console.log("Audits chip:", chip);
    if (!chip) throw new Error("No Asset: chip on the audits list");
    await initAnnotations(page);
    await caption(page, "View all audits opens the audits list filtered to the asset, archived audits included.");
    const auditsShot = await screenshot(page, join(tmpDir, "audits-filtered-by-asset.png"));
    await clearAll(page);
    await ctx.close();

    const u1 = await upload(toWebP(colShot), `${BUCKET_PREFIX}/last-audit-date-column.webp`);
    const u2 = await upload(toWebP(cardShot), `${BUCKET_PREFIX}/last-audit-card.webp`);
    const u3 = await upload(toWebP(cardClose), `${BUCKET_PREFIX}/last-audit-card-close.webp`);
    const u4 = await upload(toWebP(auditsShot), `${BUCKET_PREFIX}/audits-filtered-by-asset.webp`);
    console.log(`  OK ${u1}\n  OK ${u2}\n  OK ${u3}\n  OK ${u4}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
