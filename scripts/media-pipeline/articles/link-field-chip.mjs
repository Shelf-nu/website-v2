#!/usr/bin/env node
/**
 * Link field chip (shelf.nu #3307) for content/knowledge-base/custom-field-types-in-shelf.mdx.
 * STEP=probe  : open the new custom field form and print its controls
 * STEP=create : create a "User manual" Link field (once) in the demo workspace
 * STEP=value  : set the field on one asset (ASSET_ID) to LINK_URL
 * STEP=shot   : screenshot the asset page with the chip and upload
 */
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, clearAll } from "../lib/annotate.mjs";

const STEP = process.env.STEP || "probe";
const OUT = process.env.OUT || "/tmp";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-link-chip-"));
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(45000);
    await loginToShelf(page);

    if (STEP === "probe") {
      await navigateTo(page, "/settings/custom-fields");
      await page.screenshot({ path: join(OUT, "cf-list.png") });
      const names = await page.locator("table tbody tr").allInnerTexts();
      console.log("FIELDS:", JSON.stringify(names.map((t) => t.replace(/\s+/g, " ").slice(0, 80))));
      await navigateTo(page, "/settings/custom-fields/new");
      await page.screenshot({ path: join(OUT, "cf-new.png"), fullPage: true });
      const ctrls = await page.locator("input, select, button[role=combobox], textarea").evaluateAll((els) =>
        els.map((e) => `${e.tagName} name=${e.getAttribute("name")} id=${e.id} type=${e.getAttribute("type")}`));
      console.log(ctrls.join("\n"));
    }

    if (STEP === "create") {
      // Switches the existing ACME "Manual" text field to the Link format.
      await navigateTo(page, `/settings/custom-fields/${process.env.FIELD_ID}/edit`);
      await page.locator("#custom-field-format").click();
      await page.getByRole("option", { name: "Link" }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(OUT, "cf-create-filled.png"), fullPage: true });
      await page.getByRole("button", { name: /^(Save|Update)$/ }).first().click();
      await page.waitForTimeout(4000);
      console.log("URL after save:", page.url());
      await page.screenshot({ path: join(OUT, "cf-create-done.png") });
    }

    if (STEP === "value") {
      const id = process.env.ASSET_ID;
      await navigateTo(page, `/assets/${id}/edit`);
      const input = page.locator('input[name^="cf-"]').filter({ has: page.locator("xpath=.") });
      const label = page.getByLabel("User manual", { exact: false }).first();
      await label.fill(process.env.LINK_URL);
      await page.screenshot({ path: join(OUT, "asset-edit.png"), fullPage: true });
      await page.getByRole("button", { name: /^Save$/ }).first().click();
      await page.waitForTimeout(5000);
      console.log("URL after save:", page.url());
    }

    if (STEP === "rename") {
      const id = process.env.ASSET_ID;
      await navigateTo(page, `/assets/${id}/overview`);
      const btn = page.getByRole("button", { name: "Name this link" }).first();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.getByLabel("Link name").fill(process.env.LINK_NAME);
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(OUT, "rename-popover.png") });
      await page.getByRole("button", { name: /^Save$/ }).last().click();
      await page.waitForTimeout(3000);
    }

    if (STEP === "shot") {
      const id = process.env.ASSET_ID;
      await navigateTo(page, `/assets/${id}/overview`);
      // First view claims the link for a title fetch; reload once it has had time.
      await page.waitForTimeout(8000);
      await navigateTo(page, `/assets/${id}/overview`);
      const row = page.locator("li, tr, div").filter({ hasText: /^Manual/ }).last();
      await page.getByText("Manual", { exact: true }).first().scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 0));
      await page.getByText("Manual", { exact: true }).first().evaluate((el) => el.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(OUT, "asset-overview-raw.png") });
      const html = await page.getByText("Manual", { exact: true }).first().evaluate((el) => el.closest("li,tr,div.flex,div")?.parentElement?.outerHTML?.slice(0, 2500));
      console.log(html);
      if (process.env.UPLOAD === "1") {
        await initAnnotations(page);
        await page.evaluate(() => {
          const span = [...document.querySelectorAll("ul.item-information li > span")].find((e) => e.textContent.trim() === "Manual");
          span.closest("li").setAttribute("data-shot", "manual-row");
        });
        await highlight(page, '[data-shot="manual-row"]', { spotlight: true, padding: 6 });
        await callout(page, '[aria-label="Name this link"]', "Name this link for the whole workspace", { label: "Rename", side: "right" });
        const shot = await screenshot(page, join(tmpDir, "link-field-chip.png"));
        await clearAll(page);
        const url = await upload(toWebP(shot), "knowledgebase/link-field-chip.webp");
        console.log(`  ✅ ${url}`);
      }
    }
    await ctx.close();
  } finally {
    await browser.close();
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
