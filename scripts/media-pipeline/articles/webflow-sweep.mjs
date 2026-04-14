#!/usr/bin/env node

/**
 * Webflow CDN Image Sweep — captures fresh screenshots for 22 KB articles
 * that still have broken Webflow CDN images. No video — screenshots only.
 *
 * Single browser session, login once, capture everything.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "knowledgebase";

/**
 * Each entry: { slug, captures: [{ name, url, setup?, description }] }
 * setup is an optional async function that runs after navigation
 */
const ARTICLES = [
  {
    slug: "activity-logs",
    captures: [
      { name: "activity-logs-1", url: "/bookings", desc: "Bookings page showing activity" },
    ],
  },
  {
    slug: "adding-new-assets",
    captures: [
      { name: "adding-new-assets-1", url: "/assets/new", desc: "New asset form" },
      { name: "adding-new-assets-2", url: "/assets", desc: "Assets index" },
    ],
  },
  {
    slug: "bookings-export",
    captures: [
      { name: "bookings-export-1", url: "/bookings", desc: "Bookings page with export" },
    ],
  },
  {
    slug: "cant-find-workspace",
    captures: [
      { name: "cant-find-workspace-1", url: "/assets", desc: "Workspace switcher in sidebar" },
    ],
  },
  {
    slug: "converting-nrms",
    captures: [
      { name: "converting-nrms-1", url: "/settings/team/users", desc: "Team users page" },
      { name: "converting-nrms-2", url: "/settings/team/nrm", desc: "Non-registered members" },
    ],
  },
  {
    slug: "custom-field-types",
    captures: [
      { name: "custom-field-types-1", url: "/settings/custom-fields", desc: "Custom fields settings" },
    ],
  },
  {
    slug: "early-checkin",
    captures: [
      { name: "early-checkin-1", url: "/bookings", desc: "Bookings with check-in/out actions" },
    ],
  },
  {
    slug: "extending-booking",
    captures: [
      { name: "extending-booking-1", url: "/bookings", desc: "Bookings page" },
    ],
  },
  {
    slug: "free-trial",
    captures: [
      { name: "free-trial-1", url: "/settings/general", desc: "Settings general for workspace" },
    ],
  },
  {
    slug: "how-to-change-email",
    captures: [
      { name: "change-email-1", url: "/settings", desc: "Settings page" },
    ],
  },
  {
    slug: "how-to-create-workspaces",
    captures: [
      { name: "create-workspaces-1", url: "/settings/general", desc: "Settings general" },
    ],
  },
  {
    slug: "how-to-generate-pdf",
    captures: [
      { name: "generate-pdf-1", url: "/bookings", desc: "Booking detail with PDF option" },
    ],
  },
  {
    slug: "importing-csv",
    captures: [
      { name: "importing-csv-1", url: "/assets/import", desc: "Import assets page" },
    ],
  },
  {
    slug: "intro-workspaces",
    captures: [
      { name: "intro-workspaces-1", url: "/home", desc: "Workspace home" },
      { name: "intro-workspaces-2", url: "/settings/general", desc: "Workspace settings" },
    ],
  },
  {
    slug: "inviting-csv",
    captures: [
      { name: "inviting-csv-1", url: "/settings/team/users", desc: "Team page with Import Users" },
    ],
  },
  {
    slug: "linking-custom-fields",
    captures: [
      { name: "linking-custom-fields-1", url: "/settings/custom-fields", desc: "Custom fields settings" },
    ],
  },
  {
    slug: "onboarding-team",
    captures: [
      { name: "onboarding-team-1", url: "/settings/team/users", desc: "Team page" },
      { name: "onboarding-team-2", url: "/settings/team/nrm", desc: "Non-registered members" },
    ],
  },
  {
    slug: "understanding-qr-swap",
    captures: [
      { name: "qr-swap-1", url: "/assets", desc: "Assets page — first asset for QR" },
    ],
  },
  {
    slug: "user-roles",
    captures: [
      { name: "user-roles-1", url: "/settings/team/users", desc: "Team page showing roles" },
    ],
  },
  {
    slug: "batch-actions",
    captures: [
      { name: "batch-actions-1", url: "/assets", desc: "Assets index with batch toolbar" },
    ],
  },
  {
    slug: "what-is-a-tag",
    captures: [
      { name: "what-is-a-tag-1", url: "/tags", desc: "Tags page" },
    ],
  },
  {
    slug: "what-to-do-after-tags",
    captures: [
      { name: "after-tags-1", url: "/assets", desc: "Assets page — for QR scanning context" },
    ],
  },
];

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-sweep-"));
  console.log(`Working in: ${tmpDir}`);
  console.log(`Articles to capture: ${ARTICLES.length}`);

  let browser;
  try {
    browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    const allUrls = {};

    for (const article of ARTICLES) {
      console.log(`\n📸 ${article.slug} (${article.captures.length} screenshots)...`);

      for (const cap of article.captures) {
        await navigateTo(page, cap.url);

        // Run setup function if provided
        if (cap.setup) await cap.setup(page);

        const pngPath = join(tmpDir, `${cap.name}.png`);
        await screenshot(page, pngPath);
        const webpPath = toWebP(pngPath);

        const cdnUrl = await upload(webpPath, `${BUCKET_PREFIX}/${cap.name}.webp`);
        console.log(`  ✅ ${cap.name}: ${cdnUrl}`);
        allUrls[cap.name] = cdnUrl;
      }
    }

    await context.close();

    // Print summary
    console.log(`\n${"=".repeat(60)}`);
    console.log(`SWEEP COMPLETE: ${Object.keys(allUrls).length} screenshots uploaded`);
    console.log(`${"=".repeat(60)}`);
    for (const [name, url] of Object.entries(allUrls)) {
      console.log(`  ${name}: ${url}`);
    }

  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
