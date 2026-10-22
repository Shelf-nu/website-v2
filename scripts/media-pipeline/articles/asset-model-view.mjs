// Read-only: opens the asset index's model view (?view=models), asserts the
// header copy, shoots the list, then opens one model's drill-down sheet and
// shoots it. Nothing is submitted. Refuses to switch index mode.
import { join } from "node:path";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const OUT = process.env.OUT_DIR || "/tmp";
async function main() {
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/assets?view=models");
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText();
    if (/Advanced \(beta\)/.test(body) && !/match your filters/.test(body)) {
      throw new Error("workspace is in simple mode; not switching it");
    }
    for (const s of ["match your filters", "Default category", "Total value"]) {
      if (!body.includes(s)) throw new Error(`model view missing: ${s}`);
    }
    const toggle = page.getByRole("button", { name: "Switch to asset model view" });
    console.log("toggle present:", await toggle.count());
    console.log(body.split("\n").filter((l) => /asset model|match your filters| in$|not bookable|No model/.test(l)).slice(0, 30).join("\n"));
    const list = await screenshot(page, join(OUT, "asset-model-view.png"));

    const trigger = page.locator("td button").filter({ hasText: /^\d+ assets?$/ }).first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const sheet = page.locator("[role=dialog]").first();
    await sheet.waitFor({ state: "visible" });
    await sheet.getByText("View all in list").waitFor({ state: "visible" });
    // "View all in list" also shows while the sheet loads, so wait for a row.
    await sheet.locator("tbody tr").first().waitFor({ state: "visible" });
    console.log("sheet:", (await sheet.innerText()).split("\n").slice(0, 6).join(" | "));
    const sheetPng = await screenshot(page, join(OUT, "asset-model-view-sheet.png"));
    await page.keyboard.press("Escape");

    if (process.env.UPLOAD === "1") {
      console.log("  ✅", await upload(toWebP(list), "knowledgebase/asset-model-view.webp"));
      console.log("  ✅", await upload(toWebP(sheetPng), "knowledgebase/asset-model-view-sheet.webp"));
    }
  } finally {
    if (browser) await browser.close();
  }
}
main().catch((e) => { console.error("❌", e); process.exit(1); });
