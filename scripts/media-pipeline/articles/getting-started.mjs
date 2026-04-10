#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/getting-started.mdx
 *
 * Multi-step journey: workspace overview → assets → QR-code asset detail → team
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-getting-started-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Home/dashboard (the first thing a user sees) ─────
  console.log("📸 Capturing workspace home...");
  await navigateTo(page, "/home");
  await initAnnotations(page);
  await caption(page, "Your workspace home — quick access to assets, kits, bookings, and reminders");
  const shot1 = await screenshot(page, join(tmpDir, "gs-home.png"));
  await clearAll(page);

  // ── Screenshot 2: Assets index (Step 2: Add Your Assets) ───────────
  console.log("📸 Capturing assets index...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "text:New asset", { padding: 8 });
  await callout(page, "text:New asset", "Add assets manually one at a time, or use Import for bulk CSV upload", {
    label: "Step 2",
    side: "bottom",
  });
  await caption(page, "Step 2 — Populate your workspace with assets manually or via CSV import");
  const shot2 = await screenshot(page, join(tmpDir, "gs-assets.png"));
  await clearAll(page);

  // ── Screenshot 3: Asset detail showing QR code (Step 3: QR labels) ──
  console.log("📸 Capturing asset with QR code...");
  // Look up the first asset dynamically so this works across workspaces
  await navigateTo(page, "/assets");
  const firstAssetHref = await page.evaluate(() => {
    const link = document.querySelector('table a[href^="/assets/"]');
    return link ? link.getAttribute("href") : null;
  });
  if (!firstAssetHref) throw new Error("No assets found in workspace");
  await navigateTo(page, firstAssetHref);
  await initAnnotations(page);
  await caption(page, "Step 3 — Each asset gets a unique QR code you can print and stick on the equipment");
  const shot3 = await screenshot(page, join(tmpDir, "gs-qr-code.png"));
  await clearAll(page);

  // ── Screenshot 4: Team page (Step 4: Invite Your Team) ──────────────
  console.log("📸 Capturing team page...");
  await navigateTo(page, "/settings/team/users");
  await initAnnotations(page);
  await caption(page, "Step 4 — Invite team members and assign roles: Owner, Administrator, Self Service, or Base");
  const shot4 = await screenshot(page, join(tmpDir, "gs-team.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: full onboarding tour ───────────────────────────────
  console.log("🎬 Recording getting started tour...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Getting Started", "Your First Hour with Shelf", 3500);

    // Step 1: Workspace
    await chapterCard(clipPage, "Step 1", "Your Workspace", 2500);
    await navigateTo(clipPage, "/home");
    await initAnnotations(clipPage);
    await caption(clipPage, "Welcome to your workspace — your home base for asset management");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Step 2: Add assets
    await chapterCard(clipPage, "Step 2", "Add Your Assets", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:New asset", { padding: 8 });
    await callout(clipPage, "text:New asset", "Add assets manually or import via CSV", {
      label: "Add Assets",
      side: "bottom",
    });
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Step 3: QR codes
    await chapterCard(clipPage, "Step 3", "Print QR Code Labels", 2500);
    // Look up first asset dynamically
    await navigateTo(clipPage, "/assets");
    const clipAssetHref = await clipPage.evaluate(() => {
      const link = document.querySelector('table a[href^="/assets/"]');
      return link ? link.getAttribute("href") : null;
    });
    if (!clipAssetHref) throw new Error("No asset found for QR code chapter in clip flow");
    await navigateTo(clipPage, clipAssetHref);
    await initAnnotations(clipPage);
    await caption(clipPage, "Each asset gets a QR code — download or print labels to stick on your equipment");
    await clipPage.waitForTimeout(3500);
    await clearAll(clipPage);

    // Step 4: Team
    await chapterCard(clipPage, "Step 4", "Invite Your Team", 2500);
    await navigateTo(clipPage, "/settings/team/users");
    await initAnnotations(clipPage);
    await caption(clipPage, "Invite team members and assign roles to control who can do what");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Final
    await chapterCard(clipPage, "You're Ready", "Start Managing Your Assets", 3000);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const webp3 = toWebP(shot3);
  const webp4 = toWebP(shot4);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.home = await upload(webp1, `${BUCKET_PREFIX}/gs-home.webp`);
  urls.assets = await upload(webp2, `${BUCKET_PREFIX}/gs-assets.webp`);
  urls.qr = await upload(webp3, `${BUCKET_PREFIX}/gs-qr-code.webp`);
  urls.team = await upload(webp4, `${BUCKET_PREFIX}/gs-team.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/gs-tour.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/gs-tour.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
