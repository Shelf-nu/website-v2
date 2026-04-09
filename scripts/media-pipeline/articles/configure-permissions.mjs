#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/configure-what-self-service-and-base-users-can-see.mdx
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, chapterCard, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-permissions-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Settings → General → Permissions section ─────────
  console.log("📸 Capturing permissions settings...");
  await navigateTo(page, "/settings/general");
  await initAnnotations(page);

  // Scroll to the Permissions section
  const permSection = await page.$('text=Permissions');
  if (permSection) {
    await permSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollBy(0, -100));
    await page.waitForTimeout(500);
  }

  await highlight(page, "text:Permissions", { padding: 8 });
  await callout(page, "text:Permissions", "Control what Self Service and Base users can see — custody and booking visibility", {
    label: "Permissions",
    side: "right",
  });
  await caption(page, "Settings → General → Permissions — toggle visibility for custody and bookings");

  const shot1 = await screenshot(page, join(tmpDir, "permissions-settings.png"));
  await clearAll(page);

  // ── Screenshot 2: Scroll to show the actual toggles ────────────────
  console.log("📸 Capturing permission toggles...");
  // Scroll further to show the toggle switches
  const viewCustody = await page.$('text=View custody');
  if (viewCustody) {
    await viewCustody.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollBy(0, -50));
    await page.waitForTimeout(500);
  }
  await initAnnotations(page);
  await caption(page, "Toggle each permission on or off for Self Service and Base users independently");
  const shot2 = await screenshot(page, join(tmpDir, "permissions-toggles.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording permissions walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Permissions", "Control What Your Team Can See", 3000);

    await navigateTo(clipPage, "/settings/general");
    await initAnnotations(clipPage);
    await caption(clipPage, "Go to Settings → General to find the Permissions section");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Smooth scroll to Permissions section
    const perm = await clipPage.$('text=Permissions');
    if (perm) {
      await perm.scrollIntoViewIfNeeded();
      await clipPage.waitForTimeout(500);
      await clipPage.evaluate(() => window.scrollBy(0, -100));
      await clipPage.waitForTimeout(1000);
    }

    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Permissions", { padding: 8 });
    await callout(clipPage, "text:Permissions", "Adjust visibility for Self Service and Base users", {
      label: "Permissions",
      side: "right",
    });
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Scroll to show toggles
    const vc = await clipPage.$('text=View custody');
    if (vc) {
      await vc.scrollIntoViewIfNeeded();
      await clipPage.waitForTimeout(500);
      await clipPage.evaluate(() => window.scrollBy(0, -50));
      await clipPage.waitForTimeout(500);
    }

    await initAnnotations(clipPage);
    await caption(clipPage, "Use these toggles to control custody and booking visibility per user role");
    await clipPage.waitForTimeout(4000);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.settings = await upload(webp1, `${BUCKET_PREFIX}/permissions-settings.webp`);
  urls.toggles = await upload(webp2, `${BUCKET_PREFIX}/permissions-toggles.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/permissions-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/permissions-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  console.log("\n📋 URLs for MDX:");
  console.log(`  ![Permissions settings](${urls.settings})`);
  console.log(`  ![Permission toggles](${urls.toggles})`);
  console.log(`  <InlineVideo mp4="${urls.mp4}" webm="${urls.webm}" alt="Walkthrough of configuring user permissions in Shelf" />`);

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
