#!/usr/bin/env node
/** Capture for: archive-and-reinstate-assets.mdx (shelf.nu#2862)
 * Shows: the asset index with the list title opened as the Active / Archived / All
 * view menu. Read-only: the menu is opened and nothing is chosen or submitted. */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-archive-view-menu-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, "/assets");
    // Leave QA test rows ("ZZ ...") out of the picture; the UI itself is untouched.
    await page.evaluate(() => {
      document.querySelectorAll("tr").forEach((tr) => {
        if (/^\s*ZZ /.test(tr.innerText.split("\n").find((l) => l.trim()) || "")) tr.remove();
      });
    });
    await page.getByRole("button", { name: /Showing assets\. Change view/i }).click();
    await page.getByRole("group", { name: "Asset view" }).waitFor();
    await page.waitForTimeout(800);

    await initAnnotations(page);
    await highlight(page, '[aria-label="Asset view"]', { spotlight: false, padding: 6 });
    await callout(page, '[aria-label="Asset view"]', "Active is the default. Archived shows only archived assets; All shows both.", { label: "View", side: "right" });
    await caption(page, "Click the list title to switch between Active, Archived and All assets.");
    const shot = await screenshot(page, join(tmpDir, "archive-view-menu.png"));
    await clearAll(page);
    await ctx.close();

    const url = await upload(toWebP(shot), `${BUCKET_PREFIX}/archive-view-menu.webp`);
    console.log(`  OK ${url}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
