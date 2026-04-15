#!/usr/bin/env node

/**
 * PR A — Feature page visual enhancements for:
 *   - features/audits.mdx
 *   - features/asset-search.mdx
 *   - features/asset-pages.mdx
 *   - features/calendar.mdx
 *
 * Produces 11 screenshots + 3 videos in a single run.
 *
 * Env:
 *   DRY_RUN=1   skip Supabase upload (screenshots stay in tmp dir, path echoed)
 *   KEEP_TMP=1  keep tmp dir after run (inspect outputs manually)
 */

import { mkdtemp, rm, cp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "features";
const DRY_RUN = !!process.env.DRY_RUN;
const KEEP_TMP = !!process.env.KEEP_TMP;

// IDs captured during recon (2026-04-15). If demo data is reshuffled,
// re-run recon and update these.
const AUDIT_PENDING_ID = "cmnir9n060155qbi0wfh3gtdu"; // Studio B Audit
const AUDIT_COMPLETED_ID = "cmmdognv10051qbibpsq5vbhu"; // Proof
const ASSET_ID = "clxegs5z300592gmoqiem28qy"; // Nikon D3200

/** Click a button by its exact visible text, best-effort. */
async function clickButtonText(page, text) {
  const clicked = await page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.innerText || "").trim() === t
    );
    if (btn) { btn.click(); return true; }
    return false;
  }, text);
  return clicked;
}

async function captureScreenshots(page, tmpDir, outputs) {
  const shots = [
    // --- audits.mdx ---
    {
      name: "audits-list",
      go: async () => navigateTo(page, "/audits"),
    },
    {
      name: "audits-overview-pending",
      go: async () => navigateTo(page, `/audits/${AUDIT_PENDING_ID}/overview`),
    },
    {
      name: "audits-overview-completed",
      go: async () => navigateTo(page, `/audits/${AUDIT_COMPLETED_ID}/overview`),
    },
    {
      name: "audits-scan",
      go: async () => navigateTo(page, `/audits/${AUDIT_COMPLETED_ID}/scan`),
    },

    // --- asset-search.mdx ---
    {
      name: "search-hero",
      go: async () => navigateTo(page, "/assets?s=camera"),
    },
    {
      name: "search-saved-filters",
      go: async () => {
        await navigateTo(page, "/assets");
        const ok = await clickButtonText(page, "Saved Filters (5)");
        if (!ok) throw new Error("Saved Filters button not found");
        await page.waitForTimeout(1500);
      },
    },

    // --- asset-pages.mdx ---
    {
      name: "asset-overview",
      go: async () => navigateTo(page, `/assets/${ASSET_ID}/overview`),
    },
    {
      name: "asset-activity",
      go: async () => navigateTo(page, `/assets/${ASSET_ID}/activity`),
    },
    {
      name: "asset-bookings",
      go: async () => navigateTo(page, `/assets/${ASSET_ID}/bookings`),
    },
    {
      name: "asset-reminders",
      go: async () => navigateTo(page, `/assets/${ASSET_ID}/reminders`),
    },

    // --- calendar.mdx ---
    {
      name: "calendar-month",
      go: async () => {
        await navigateTo(page, "/calendar");
        // First load shows only a couple of bookings; toggling views forces
        // a full fetch. Week → Month gives the dense view we want.
        await clickButtonText(page, "Week");
        await page.waitForTimeout(1500);
        await clickButtonText(page, "Month");
        await page.waitForTimeout(3500);
      },
    },
    {
      name: "calendar-day",
      // A day view with a full-day booking on screen (RacingThePlanet runs
      // Sep 30 2025 → mid-Oct 2025). Navigating with a start= param lands
      // the day view on that date.
      go: async () => {
        await navigateTo(
          page,
          "/calendar?start=2025-09-30T22%3A00%3A00.000Z&end=2025-10-01T22%3A00%3A00.000Z"
        );
        await clickButtonText(page, "Day");
        await page.waitForTimeout(3500);
      },
    },
  ];

  for (const shot of shots) {
    console.log(`  📸 ${shot.name}`);
    await shot.go();
    await page.waitForTimeout(1500);
    const pngPath = join(tmpDir, `${shot.name}.png`);
    await screenshot(page, pngPath);
    outputs.pngs[shot.name] = pngPath;
  }
}

async function recordAuditsVideo(browser) {
  return recordClip(browser, async (cp) => {
    await navigateTo(cp, "/audits");
    await cp.waitForTimeout(3500);
    await navigateTo(cp, `/audits/${AUDIT_PENDING_ID}/overview`);
    await cp.waitForTimeout(3500);
    // Scroll to asset list
    await cp.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
    await cp.waitForTimeout(2500);
    await cp.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await cp.waitForTimeout(1500);
    // Jump to a completed audit to show the other end of the lifecycle
    await navigateTo(cp, `/audits/${AUDIT_COMPLETED_ID}/overview`);
    await cp.waitForTimeout(4000);
  });
}

async function recordSearchVideo(browser) {
  return recordClip(browser, async (cp) => {
    await navigateTo(cp, "/assets");
    await cp.waitForTimeout(2000);
    // Type into the search input character-by-character to show live filtering.
    // The input submits on change — each keystroke refines results.
    const input = await cp.$('input[name="s"]');
    if (!input) throw new Error("Search input not found");
    await input.click();
    await cp.waitForTimeout(500);
    for (const ch of "camera") {
      await cp.keyboard.type(ch, { delay: 180 });
    }
    await cp.waitForTimeout(2500);
    // Open Saved Filters presets
    await cp.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(
        (b) => (b.innerText || "").trim().startsWith("Saved Filters")
      );
      btn?.click();
    });
    await cp.waitForTimeout(3000);
  });
}

async function recordCalendarVideo(browser) {
  return recordClip(browser, async (cp) => {
    await navigateTo(cp, "/calendar");
    await cp.waitForTimeout(3000);
    // Toggle Week view
    await cp.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(
        (b) => (b.innerText || "").trim() === "Week"
      );
      btn?.click();
    });
    await cp.waitForTimeout(2500);
    // Toggle Day view
    await cp.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(
        (b) => (b.innerText || "").trim() === "Day"
      );
      btn?.click();
    });
    await cp.waitForTimeout(2500);
    // Back to Month
    await cp.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(
        (b) => (b.innerText || "").trim() === "Month"
      );
      btn?.click();
    });
    await cp.waitForTimeout(2500);
  });
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-features-pr-a-"));
  console.log(`Working in: ${tmpDir}`);
  console.log(`Dry run: ${DRY_RUN ? "YES (no uploads)" : "no — will upload"}`);

  const outputs = { pngs: {}, videos: {} };
  const urls = {};

  let browser;
  try {
    browser = await launchBrowser();

    // ------- Screenshots (one page session) -------
    {
      const ctx = await createContext(browser);
      const page = await ctx.newPage();
      page.setDefaultTimeout(60000);
      await loginToShelf(page);

      console.log("\n📸 Capturing screenshots...");
      await captureScreenshots(page, tmpDir, outputs);
      await ctx.close();
    }

    // ------- Videos (fresh context each — avoids state bleed) -------
    console.log("\n🎬 Recording audits video...");
    outputs.videos["audits-flow"] = await recordAuditsVideo(browser);
    console.log("🎬 Recording search video...");
    outputs.videos["search-flow"] = await recordSearchVideo(browser);
    console.log("🎬 Recording calendar video...");
    outputs.videos["calendar-flow"] = await recordCalendarVideo(browser);

    // ------- Convert -------
    console.log("\n🔄 Converting screenshots → WebP...");
    const webps = {};
    for (const [name, pngPath] of Object.entries(outputs.pngs)) {
      webps[name] = toWebP(pngPath);
    }
    console.log("🔄 Converting videos → MP4 + WebM...");
    const videoFormats = {};
    for (const [name, webmIn] of Object.entries(outputs.videos)) {
      videoFormats[name] = toVideoFormats(webmIn);
    }

    // ------- Upload -------
    if (DRY_RUN) {
      // Copy outputs to /tmp/features-pr-a for easy inspection
      const reviewDir = join(tmpdir(), "features-pr-a-review");
      await rm(reviewDir, { recursive: true, force: true }).catch(() => {});
      await cp(tmpDir, reviewDir, { recursive: true });
      console.log(`\n🔍 DRY RUN — assets in ${reviewDir}`);
    } else {
      console.log("\n☁️  Uploading...");
      for (const [name, webpPath] of Object.entries(webps)) {
        urls[name] = await upload(webpPath, `${BUCKET_PREFIX}/${name}.webp`);
        console.log(`  ✅ ${name}.webp`);
      }
      for (const [name, { mp4, webm }] of Object.entries(videoFormats)) {
        urls[`${name}-mp4`] = await upload(mp4, `${BUCKET_PREFIX}/${name}.mp4`);
        urls[`${name}-webm`] = await upload(webm, `${BUCKET_PREFIX}/${name}.webm`);
        console.log(`  ✅ ${name}.{mp4,webm}`);
      }

      console.log("\n" + "=".repeat(60));
      console.log(`PR A COMPLETE: ${Object.keys(urls).length} assets uploaded`);
      console.log("=".repeat(60));
      for (const [name, url] of Object.entries(urls)) {
        console.log(`  ${name}: ${url}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    if (!KEEP_TMP && !DRY_RUN) {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    } else {
      console.log(`\n(tmp dir preserved: ${tmpDir})`);
    }
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
