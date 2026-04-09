#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/admin-notes-on-team-members.mdx
 *
 * Shows: Team list, member profile Notes tab, actually typing + saving a note
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
  await caption(page, "Settings → Team — click a team member's name to open their profile");
  const shot1 = await screenshot(page, join(tmpDir, "admin-notes-team-list.png"));
  await clearAll(page);

  // ── Screenshot 2: Navigate to Carlos's profile → Notes tab ──────────
  console.log("📸 Capturing Carlos's profile with Notes tab...");
  // Click on Carlos's profile link
  const carlosLink = page.locator('a:has-text("Carlos Virreiracarlos@virreira.com"), a[href*="45a7f1d5"]').first();
  if (await carlosLink.count() > 0) {
    await carlosLink.click();
    await page.waitForTimeout(3000);
  }
  // Click Notes tab
  const notesTab = page.locator('a:has-text("Notes"), button:has-text("Notes")').first();
  if (await notesTab.count() > 0) {
    await notesTab.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  await initAnnotations(page);
  await caption(page, "Notes tab — private notes visible only to admins and owners");
  const shot2 = await screenshot(page, join(tmpDir, "admin-notes-profile.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip — navigate to team, open profile, type a note ───────
  console.log("🎬 Recording admin notes walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Admin Notes", "Add Private Notes to Team Members", 3000);

    // Show team page
    await navigateTo(clipPage, "/settings/team");
    await initAnnotations(clipPage);
    await caption(clipPage, "Navigate to Settings → Team");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Click Carlos's profile
    await initAnnotations(clipPage);
    await caption(clipPage, "Click on a team member's name to open their profile");
    await clipPage.waitForTimeout(1500);
    await clearAll(clipPage);

    const carlos = clipPage.locator('a:has-text("Carlos Virreiracarlos@virreira.com"), a[href*="45a7f1d5"]').first();
    if (await carlos.count() > 0) {
      await carlos.click();
      await clipPage.waitForTimeout(3000);
    }

    // Click Notes tab
    const notes = clipPage.locator('a:has-text("Notes"), button:has-text("Notes")').first();
    if (await notes.count() > 0) {
      await initAnnotations(clipPage);
      await highlight(clipPage, "text:Notes", { spotlight: true, padding: 6 });
      await callout(clipPage, "text:Notes", "Private notes — only visible to admins and owners", {
        label: "Notes Tab",
        side: "bottom",
      });
      await clipPage.waitForTimeout(2500);
      await clearAll(clipPage);

      await notes.click({ force: true }).catch(() => {});
      await clipPage.waitForTimeout(2000);
    }

    // Type a note
    await chapterCard(clipPage, "Adding a Note", "Type and Save a Private Note", 2500);

    // Find the "Leave a note" input
    const noteInput = clipPage.locator('input[placeholder="Leave a note"]').first();
    if (await noteInput.count() > 0) {
      await initAnnotations(clipPage);
      await highlight(clipPage, 'input[placeholder="Leave a note"]', { spotlight: true, padding: 6 });
      await clipPage.waitForTimeout(1500);
      await clearAll(clipPage);

      await noteInput.click();
      await clipPage.waitForTimeout(500);

      // Type with natural cadence
      const noteText = "Equipment training completed. Ready for field assignments.";
      for (const char of noteText) {
        await clipPage.keyboard.type(char);
        await clipPage.waitForTimeout(40 + Math.random() * 30);
      }
      await clipPage.waitForTimeout(1500);

      await initAnnotations(clipPage);
      await caption(clipPage, "Type your note and press Enter or click Save");
      await clipPage.waitForTimeout(2500);
      await clearAll(clipPage);

      // Submit the note
      await clipPage.keyboard.press("Enter");
      await clipPage.waitForTimeout(2500);

      await initAnnotations(clipPage);
      await caption(clipPage, "Note saved — only admins and owners can see this");
      await clipPage.waitForTimeout(3000);
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

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
