#!/usr/bin/env node
/** Capture for: content/updates/unsaved-changes-bar.mdx, adding-new-assets.mdx (shelf.nu#3209)
 * Shows: the Unsaved changes bar on an asset edit form and the leave dialog.
 * Read-only: types into a field, then Stay and Discard. Nothing is saved. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, callout, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";
const ASSET_ID = process.env.ASSET_ID || "cmr91tea000abndi749v99g3g";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-unsaved-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, `/assets/${ASSET_ID}/edit`);
    await page.waitForTimeout(2500);
    const name = page.locator('input[name="title"]');
    const original = await name.inputValue();
    console.log("Original name:", original);
    if (await page.getByText("Unsaved changes", { exact: true }).count()) throw new Error("Bar shown on a clean form");
    await name.click();
    await name.press("End");
    await name.type(" (draft)");
    const bar = page.locator('[aria-label="Unsaved changes"]');
    await bar.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(800);
    console.log("Bar text:", (await bar.innerText()).replace(/\n/g, " | "));
    await initAnnotations(page);
    await callout(page, "text:Discard", "Puts every field back to its saved value.", { label: "Discard", side: "bottom" });
    await caption(page, "The Unsaved changes bar appears as soon as a field differs from what is saved.");
    const barShot = await screenshot(page, join(tmpDir, "unsaved-changes-bar.png"));
    await clearAll(page);

    // Leave guard: click a sidebar link.
    await page.locator('nav a[href="/kits"], a[href="/kits"]').first().click();
    const dialog = page.getByRole("alertdialog").or(page.getByRole("dialog"));
    await dialog.first().waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(600);
    const dText = await dialog.first().innerText();
    console.log("Dialog:", dText.replace(/\n/g, " | "));
    if (!/Stay/.test(dText) || !/Leave page/.test(dText)) throw new Error("Unexpected dialog: " + dText);
    await initAnnotations(page);
    await caption(page, "Leaving the page with unsaved work asks first.");
    const dialogShot = await screenshot(page, join(tmpDir, "unsaved-changes-leave-dialog.png"));
    await clearAll(page);
    await page.getByRole("button", { name: "Stay" }).click();
    await page.waitForTimeout(600);
    if (!page.url().includes(`/assets/${ASSET_ID}/edit`)) throw new Error("Stay did not stay: " + page.url());

    // Discard restores the saved value.
    await page.getByRole("button", { name: "Discard" }).click();
    await page.waitForTimeout(1500);
    const after = await page.locator('input[name="title"]').inputValue();
    console.log("After discard:", after);
    if (after !== original) throw new Error("Discard did not restore the name: " + after);
    if (await bar.count()) throw new Error("Bar still shown after Discard");
    await ctx.close();

    const u1 = await upload(toWebP(barShot), `${BUCKET_PREFIX}/unsaved-changes-bar.webp`);
    const u2 = await upload(toWebP(dialogShot), `${BUCKET_PREFIX}/unsaved-changes-leave-dialog.webp`);
    console.log(`  OK ${u1}\n  OK ${u2}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
