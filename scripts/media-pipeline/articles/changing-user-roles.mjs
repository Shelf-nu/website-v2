#!/usr/bin/env node
/** Capture for: changing-user-roles-in-shelf.mdx
 * Show team page with roles → click ⋮ actions menu on a user → show the popup */
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
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Team page showing roles
    console.log("📸 Capturing team page with roles...");
    await navigateTo(page, "/settings/team/users");
    await initAnnotations(page);
    await highlight(page, "text:Role", { padding: 8 });
    await callout(page, "text:Role", "Each team member has a role — Owner, Administrator, Self Service, or Base", { label: "Roles", side: "bottom" });
    await caption(page, "Settings → Team — see each member's role, custodies, and status");
    const shot1 = await screenshot(page, join(tmpDir, "changing-roles-1.png"));
    await clearAll(page);

    // Shot 2: Click the ⋮ menu on a non-owner user to show action options
    console.log("📸 Capturing actions menu...");
    // Find the actions button on a non-Owner user row
    const dotsBtnClicked = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (const row of rows) {
        if (row.textContent.includes('Owner')) continue;
        const btn = row.querySelector('button, [aria-haspopup]');
        if (btn) { btn.click(); return true; }
      }
      return false;
    });
    if (!dotsBtnClicked) throw new Error("No non-Owner user row with actions button found");
    await page.waitForTimeout(1500);
    await initAnnotations(page);
    await caption(page, "Click the ⋮ menu to see role management options — Revoke access changes the user to a Non-Registered Member");
    const shot2 = await screenshot(page, join(tmpDir, "changing-roles-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "User Roles", "Manage Team Member Access", 3000);
      await navigateTo(cp, "/settings/team/users");
      await initAnnotations(cp);
      await highlight(cp, "text:Role", { padding: 8 });
      await caption(cp, "Each team member has a role — Owner, Administrator, Self Service, or Base");
      await cp.waitForTimeout(3000);
      await clearAll(cp);

      await chapterCard(cp, "Change a Role", "Use the Actions Menu", 2500);
      await navigateTo(cp, "/settings/team/users");
      await cp.waitForTimeout(1500);
      // Click the dots menu on a non-Owner user row
      const dotsClicked = await cp.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        for (const row of rows) {
          if (row.textContent.includes('Owner')) continue;
          const btn = row.querySelector('button, [aria-haspopup]');
          if (btn) { btn.click(); return true; }
        }
        return false;
      });
      if (!dotsClicked) throw new Error("No non-Owner user row with actions button found (video clip)");
      await cp.waitForTimeout(1500);
      await initAnnotations(cp);
      await caption(cp, "The ⋮ menu lets you revoke access — the user becomes a Non-Registered Member, then re-invite with a new role");
      await cp.waitForTimeout(4000);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/changing-roles-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/changing-roles-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/changing-roles-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/changing-roles-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { if (browser) await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
