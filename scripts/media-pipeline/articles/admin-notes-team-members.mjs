#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/admin-notes-on-team-members.mdx
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-adminnotes-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Team page ────────────────────────────────────────
  console.log("📸 Capturing Team settings...");
  await navigateTo(page, "/settings/team");
  await initAnnotations(page);

  await caption(page, "Settings → Team — click on a team member's name to open their profile");
  const shot1 = await screenshot(page, join(tmpDir, "admin-notes-team-list.png"));
  await clearAll(page);

  // ── Screenshot 2: Click first team member to see their profile ─────
  console.log("📸 Capturing team member profile...");
  // Find and click a team member link
  const memberLinks = await page.$$('table a, [role="row"] a');
  if (memberLinks.length > 0) {
    await memberLinks[0].click();
    await page.waitForTimeout(3000);
  }
  await initAnnotations(page);

  // Try to find and click the Notes tab
  const notesTab = await page.$('text=Notes');
  if (notesTab) {
    await notesTab.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  await caption(page, "Team member profile — select the Notes tab to view and add admin notes");
  const shot2 = await screenshot(page, join(tmpDir, "admin-notes-profile.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording admin notes walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Admin Notes", "Add Private Notes to Team Members", 3000);

    // Show team page
    await navigateTo(clipPage, "/settings/team");
    await initAnnotations(clipPage);
    await caption(clipPage, "Navigate to Settings → Team to see all team members");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Click a team member
    const members = await clipPage.$$('table a, [role="row"] a');
    if (members.length > 0) {
      await members[0].click();
      await clipPage.waitForTimeout(3000);
    }

    await initAnnotations(clipPage);
    await caption(clipPage, "Click a team member's name to open their profile");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Click Notes tab
    const notes = await clipPage.$('text=Notes');
    if (notes) {
      await initAnnotations(clipPage);
      await highlight(clipPage, "text:Notes", { spotlight: true, padding: 6 });
      await callout(clipPage, "text:Notes", "Private notes visible only to admins and owners", {
        label: "Notes Tab",
        side: "bottom",
      });
      await clipPage.waitForTimeout(3000);

      await notes.click({ force: true }).catch(() => {});
      await clipPage.waitForTimeout(2000);
      await clearAll(clipPage);

      await initAnnotations(clipPage);
      await caption(clipPage, "Type your note and click Save — only admins and owners can see these");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);
    }
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.teamList = await upload(webp1, `${BUCKET_PREFIX}/admin-notes-team-list.webp`);
  urls.profile = await upload(webp2, `${BUCKET_PREFIX}/admin-notes-profile.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/admin-notes-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/admin-notes-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  console.log("\n📋 URLs for MDX:");
  console.log(`  ![Team settings page](${urls.teamList})`);
  console.log(`  ![Team member profile with Notes tab](${urls.profile})`);
  console.log(`  <InlineVideo mp4="${urls.mp4}" webm="${urls.webm}" alt="Walkthrough of adding admin notes to team members in Shelf" />`);

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
