#!/usr/bin/env node
/** Video for: converting-non-registered-members-nrms-to-users.mdx
 * Shows: NRM tab → actions on an NRM → invite to convert them to a user */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-converting-nrms-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Screenshot: NRM tab with actions menu open on a member
    console.log("📸 Capturing NRM page with actions...");
    await navigateTo(page, "/settings/team/nrm");
    // Click the ⋮ menu on the first NRM
    const dotsBtnClicked = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      if (rows.length > 0) {
        const btn = rows[0].querySelector('td:last-child button, td:last-child [aria-haspopup]');
        if (btn) { btn.click(); return true; }
      }
      return false;
    });
    if (!dotsBtnClicked) throw new Error("No NRM actions button found");
    await page.waitForTimeout(1500);
    await initAnnotations(page);
    await caption(page, "Click the ⋮ menu on any non-registered member to see conversion options — invite them to become a full user");
    const shot1 = await screenshot(page, join(tmpDir, "converting-nrms-1.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording NRM conversion walkthrough...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Non-Registered Members", "Convert NRMs to Full Users", 3000);

      // Show NRM tab
      await navigateTo(cp, "/settings/team/nrm");
      await initAnnotations(cp);
      await caption(cp, "Non-registered members can hold custody but can't log in — convert them when they need full access");
      await cp.waitForTimeout(3000);
      await clearAll(cp);

      // Scroll to show the NRM list
      await cp.evaluate(async () => {
        await new Promise(r => { window.scrollTo({ top: 200, behavior: 'smooth' }); setTimeout(r, 1000); });
        await new Promise(r => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(r, 800); });
      });
      await cp.waitForTimeout(500);

      // Click ⋮ on first NRM
      await chapterCard(cp, "Convert to User", "Invite an NRM to Create an Account", 2500);
      await navigateTo(cp, "/settings/team/nrm");
      await cp.waitForTimeout(1000);
      const clicked = await cp.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        if (rows.length > 0) {
          const btn = rows[0].querySelector('td:last-child button, td:last-child [aria-haspopup]');
          if (btn) { btn.click(); return true; }
        }
        return false;
      });
      if (!clicked) throw new Error("No NRM actions button found in clip");
      await cp.waitForTimeout(1500);
      await initAnnotations(cp);
      await caption(cp, "Click the ⋮ menu → invite the NRM via email — they'll create an account and keep their existing custodies");
      await cp.waitForTimeout(4500);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/converting-nrms-1.webp`);
    urls.b = await upload(mp4, `${BUCKET_PREFIX}/converting-nrms-flow.mp4`);
    urls.c = await upload(webm, `${BUCKET_PREFIX}/converting-nrms-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { if (browser) await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
