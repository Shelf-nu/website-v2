#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/changing-user-roles.mdx
 *
 * Team member roles and how to change them
 */

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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-changing-roles-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Team users page showing role badges ───────────────
  console.log("📸 Capturing team users page...");
  await navigateTo(page, "/settings/team/users");
  await initAnnotations(page);
  await highlight(page, "text:Administrator", { padding: 4 });
  await caption(page, "The team page shows each member with their assigned role — Owner, Administrator, Self Service, or Base");
  const shot1 = await screenshot(page, join(tmpDir, "changing-roles-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Actions dropdown on a user row ────────────────────
  console.log("📸 Capturing user actions...");
  await navigateTo(page, "/settings/team/users");
  await initAnnotations(page);
  // Look for the actions button (typically a "..." or kebab menu)
  const actionsCount = await page.locator('button:has-text("Actions")').count();
  if (actionsCount > 0) {
    await page.locator('button:has-text("Actions")').first().click();
    await page.waitForTimeout(500);
  }
  await caption(page, "Click the actions menu on any team member to change their role or remove them");
  const shot2 = await screenshot(page, join(tmpDir, "changing-roles-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: changing roles walkthrough ──────────────────────────
  console.log("🎬 Recording changing roles walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "User Roles", "Control Who Can Do What", 3000);

    await navigateTo(clipPage, "/settings/team/users");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Administrator", { padding: 4 });
    await caption(clipPage, "Each team member has a role that controls their permissions");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Change Role", "Update a Member's Permissions", 2500);
    await navigateTo(clipPage, "/settings/team/users");
    await initAnnotations(clipPage);
    await highlight(clipPage, 'text:Actions', { padding: 6 });
    await caption(clipPage, "Use the actions menu to change a role — changes take effect immediately");
    await clipPage.waitForTimeout(3500);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/changing-roles-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/changing-roles-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/changing-roles-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/changing-roles-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
