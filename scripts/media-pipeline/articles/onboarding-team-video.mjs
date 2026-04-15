#!/usr/bin/env node
/** Video for: onboarding-your-team-members.mdx
 * Shows: Team page → Invite a user button → invite flow */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-onboarding-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Screenshot: Team page with Invite a user highlighted
    console.log("📸 Capturing team page with invite button...");
    await navigateTo(page, "/settings/team/users");
    await initAnnotations(page);
    await highlight(page, "text:Invite a user", { spotlight: true, padding: 8 });
    await callout(page, "text:Invite a user", "Click to invite a team member by email — assign their role during the invite", {
      label: "Invite",
      side: "bottom",
    });
    await caption(page, "Settings → Team → click Invite a user to add team members to your workspace");
    const shot1 = await screenshot(page, join(tmpDir, "onboarding-1.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording onboarding walkthrough...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Team Onboarding", "Invite Members to Your Workspace", 3000);

      // Show the team page
      await navigateTo(cp, "/settings/team/users");
      await initAnnotations(cp);
      await caption(cp, "Your team page — see all members with their roles, custodies, and status");
      await cp.waitForTimeout(3000);
      await clearAll(cp);

      // Highlight invite button
      await initAnnotations(cp);
      await highlight(cp, "text:Invite a user", { spotlight: true, padding: 8 });
      await callout(cp, "text:Invite a user", "Send an email invite with a role assignment", { label: "Invite", side: "bottom" });
      await caption(cp, "Click Invite a user — enter their email and assign a role (Administrator, Self Service, or Base)");
      await cp.waitForTimeout(4000);
      await clearAll(cp);

      // Show NRM tab — for team members who don't need login access
      await chapterCard(cp, "Non-Registered Members", "Team Members Without Login Access", 2500);
      await navigateTo(cp, "/settings/team/nrm");
      await initAnnotations(cp);
      await highlight(cp, "text:Add NRM", { spotlight: true, padding: 8 });
      await callout(cp, "text:Add NRM", "Add team members who don't need to log in — they can still be assigned custody", { label: "Add NRM", side: "bottom" });
      await caption(cp, "Non-registered members can hold custody of assets without needing a Shelf account");
      await cp.waitForTimeout(4000);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/onboarding-team-1.webp`);
    urls.b = await upload(mp4, `${BUCKET_PREFIX}/onboarding-flow.mp4`);
    urls.c = await upload(webm, `${BUCKET_PREFIX}/onboarding-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { if (browser) await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
