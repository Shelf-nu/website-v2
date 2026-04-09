#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/configure-what-self-service-and-base-users-can-see.mdx
 *
 * Shows: Settings → General → Permissions section with all toggles visible
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

/** Scroll to Permissions heading and position it near top of viewport */
async function scrollToPermissions(page) {
  const heading = await page.locator('text=Permissions').first();
  if (heading) {
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    // Nudge up so heading is visible at top with toggles below
    await page.evaluate(() => window.scrollBy(0, -60));
    await page.waitForTimeout(500);
  }
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-permissions-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Permissions section with heading visible ─────────
  console.log("📸 Capturing permissions section...");
  await navigateTo(page, "/settings/general");
  await scrollToPermissions(page);
  await initAnnotations(page);

  await highlight(page, "text:Permissions", { padding: 8 });
  await callout(page, "text:Permissions", "Control what Self Service and Base users can see", {
    label: "Permissions",
    side: "right",
  });
  await caption(page, "Settings → General → Scroll down to the Permissions section");
  const shot1 = await screenshot(page, join(tmpDir, "permissions-settings.png"));
  await clearAll(page);

  // ── Screenshot 2: Scroll further to show all toggles clearly ───────
  console.log("📸 Capturing all permission toggles...");
  // Scroll past the heading to show the actual toggles
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(800);
  await initAnnotations(page);
  await caption(page, "Toggle each permission independently for Self Service and Base users");
  const shot2 = await screenshot(page, join(tmpDir, "permissions-toggles.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording permissions walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Permissions", "Control What Your Team Can See", 3000);

    await navigateTo(clipPage, "/settings/general");
    await initAnnotations(clipPage);
    await caption(clipPage, "Go to Settings → General");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Smooth scroll to Permissions
    await scrollToPermissions(clipPage);

    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Permissions", { padding: 8 });
    await callout(clipPage, "text:Permissions", "Adjust visibility for Self Service and Base users", {
      label: "Permissions",
      side: "right",
    });
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Scroll to show toggles
    await clipPage.evaluate(async () => {
      const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const scroll = (delta, dur) => new Promise((resolve) => {
        const start = window.scrollY, t0 = performance.now();
        const s = (now) => { const p = Math.min((now - t0) / dur, 1); window.scrollTo(0, start + delta * ease(p)); p < 1 ? requestAnimationFrame(s) : resolve(); };
        requestAnimationFrame(s);
      });
      await scroll(250, 1200);
    });
    await clipPage.waitForTimeout(800);

    await initAnnotations(clipPage);
    await caption(clipPage, "Toggle custody and booking visibility per user role — changes apply immediately");
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

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
