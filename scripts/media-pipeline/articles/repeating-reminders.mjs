#!/usr/bin/env node
/**
 * Captures for shelf.nu #2685 (repeating reminders):
 * content/knowledge-base/asset-reminders.mdx, content/updates/repeating-reminders.mdx
 *
 * 1. /reminders: the workspace Reminders page (a repeating series shows its cadence under the date).
 * 2. An asset's Actions → Set Reminder dialog with the Repeat field, options open.
 * Nothing is created: the dialog is dismissed with Escape.
 */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-repeating-reminders-"));
  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: the Reminders page.
    await navigateTo(page, "/reminders");
    await page.waitForTimeout(2500);
    const bodyText = await page.locator("main").innerText().catch(() => "");
    console.log("reminders page excerpt:\n" + bodyText.slice(0, 1200));
    const hasCadence = /^(Daily|Weekly|Every 2 weeks|Monthly|Every 3 months|Every 6 months|Yearly|Repeats .*)$/m.test(bodyText);
    console.log("cadence visible on list: " + hasCadence);
    if (hasCadence) {
      await initAnnotations(page);
      await caption(page, "Reminders: a repeating series shows its next date with the cadence underneath");
      const shot1 = await screenshot(page, join(tmpDir, "reminders-list-repeating.png"));
      await clearAll(page);
      urls.list = await upload(toWebP(shot1), `${BUCKET_PREFIX}/reminders-list-repeating.webp`);
    } else {
      console.log("No repeating series on the Reminders page: shot 1 skipped");
    }

    // Shot 2: Set Reminder dialog on an asset.
    await navigateTo(page, "/assets");
    await page.waitForTimeout(2500);
    const href = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll('a[href^="/assets/"]')).find((el) =>
        /^\/assets\/[a-z0-9]{20,}(\/overview)?$/i.test(el.getAttribute("href") || "")
      );
      return a ? a.getAttribute("href") : null;
    });
    if (!href) throw new Error("No asset link found on /assets");
    await navigateTo(page, href);
    await page.waitForTimeout(2000);
    console.log("asset page: " + page.url());
    const actions = page.locator('button:has-text("Actions")').first();
    if (!(await actions.isVisible().catch(() => false))) {
      console.log("buttons: " + (await page.locator("button").allInnerTexts()).filter(Boolean).slice(0, 40).join(" | "));
      throw new Error("Actions button not visible on the asset page");
    }
    await actions.click();
    await page.waitForTimeout(600);
    await page.waitForTimeout(800);
    const menuPop = page.locator('[data-radix-popper-content-wrapper], [role="menu"], [role="dialog"]').last();
    console.log("menu text: " + (await menuPop.innerText().catch(() => "(none)")).slice(0, 400).replace(/\n/g, " | "));
    const item = page.getByText(/Set reminder/i).first();
    if (!(await item.isVisible().catch(() => false))) {
      throw new Error("Set Reminder menu item not visible");
    }
    await item.click();
    await page.waitForTimeout(1000);
    const dialog = page.getByRole("dialog").first();
    await dialog.waitFor({ state: "visible" });
    console.log("dialog text:\n" + (await dialog.innerText()));
    const repeatLabel = dialog.locator("label", { hasText: /^Repeat/ }).first();
    const hasRepeat = await repeatLabel.isVisible().catch(() => false);
    console.log("Repeat field visible: " + hasRepeat);
    // Open the Repeat select so the cadences show.
    let opened = false;
    if (hasRepeat) {
      const trigger = dialog.locator('button[role="combobox"]').filter({ hasText: /Never|Daily|Weekly|Monthly|Yearly/ }).first();
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click();
        await page.waitForTimeout(700);
        opened = true;
      } else {
        console.log("Repeat trigger not found as combobox; capturing closed dialog");
      }
    }
    await initAnnotations(page);
    if (!opened && hasRepeat) {
      await highlight(page, "text:Repeat", { spotlight: true, padding: 10 });
      await callout(page, "text:Repeat", "Daily to yearly, with an optional end date (Plus and Team)", { label: "Repeat", side: "right" });
    }
    await caption(page, opened
      ? "Set Reminder: pick how often it repeats. Never keeps it a one-time reminder."
      : "Set Reminder: the Repeat field turns a reminder into a series (Plus and Team)");
    const shot2 = await screenshot(page, join(tmpDir, "set-reminder-repeat.png"));
    await clearAll(page);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    urls.dialog = await upload(toWebP(shot2), `${BUCKET_PREFIX}/set-reminder-repeat.webp`);

    await context.close();
    Object.entries(urls).forEach(([k, u]) => console.log(`  ✅ ${k}: ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
