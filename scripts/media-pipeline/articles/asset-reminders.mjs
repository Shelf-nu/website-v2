#!/usr/bin/env node
/** Capture for: asset-reminders.mdx
 * Shows: Reminders index page + asset detail with Actions > Set Reminder */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, chapterCard, clearAll } from "../lib/annotate.mjs";
const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-reminders-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Reminders index page showing all reminders
    console.log("📸 Capturing reminders index...");
    await navigateTo(page, "/reminders");
    await initAnnotations(page);
    await caption(page, "Reminders page — view all active reminders across your workspace with name, message, asset, and alert date");
    const shot1 = await screenshot(page, join(tmpDir, "reminders-1.png"));
    await clearAll(page);

    // Shot 2: Asset detail with Actions dropdown showing "Set reminder"
    console.log("📸 Capturing Set Reminder action...");
    await navigateTo(page, "/assets");
    const assetHref = await page.evaluate(() => document.querySelector('table a[href^="/assets/"]')?.getAttribute("href"));
    if (!assetHref) throw new Error("No assets found");
    await navigateTo(page, assetHref);
    // Open the Actions dropdown
    const actionsBtn = page.locator('button:has-text("Actions")').first();
    if (await actionsBtn.count() > 0) {
      await actionsBtn.click();
      await page.waitForTimeout(1500);
    }
    await initAnnotations(page);
    await highlight(page, "text:Set reminder", { padding: 6 });
    await callout(page, "text:Set reminder", "Set a reminder for this asset — choose a date, message, and which team members to notify", { label: "Set Reminder", side: "left" });
    await caption(page, "Open any asset → Actions → Set reminder to create a scheduled alert for your team");
    const shot2 = await screenshot(page, join(tmpDir, "reminders-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Reminders", "Schedule Alerts for Your Assets", 3000);
      await navigateTo(cp, "/reminders");
      await initAnnotations(cp);
      await caption(cp, "The Reminders page shows all scheduled alerts — name, message, asset, date, and status");
      await cp.waitForTimeout(3500);
      await clearAll(cp);

      await chapterCard(cp, "Set a Reminder", "From the Asset Actions Menu", 2500);
      await navigateTo(cp, "/assets");
      const href = await cp.evaluate(() => document.querySelector('table a[href^="/assets/"]')?.getAttribute("href"));
      if (href) await navigateTo(cp, href);
      await cp.waitForTimeout(1000);
      const ab = cp.locator('button:has-text("Actions")').first();
      if (await ab.count() > 0) {
        await ab.click();
        await cp.waitForTimeout(1500);
      }
      await initAnnotations(cp);
      await highlight(cp, "text:Set reminder", { padding: 6 });
      await callout(cp, "text:Set reminder", "Create a scheduled reminder", { label: "Reminder", side: "left" });
      await caption(cp, "Actions → Set Reminder — choose date, message, and team members to notify");
      await cp.waitForTimeout(4000);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/reminders-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/reminders-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/reminders-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/reminders-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
