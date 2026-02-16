#!/usr/bin/env node
/**
 * Upload feature page images from Webflow CDN to Supabase Storage
 */
import { readFile } from "node:fs/promises";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// Load env
const envContent = await readFile(join(PROJECT_ROOT, ".env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const eq = t.indexOf("=");
    if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
}
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY;
const BUCKET = env.SUPABASE_BUCKET;

const images = [
  // Workspaces
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6557425bcbb7c7668607046a_workspaces.jpg", "features/workspaces.jpg"],
  // Bookings
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65313cf4a65ebfd1ae8ae572_bookings.jpg", "features/bookings.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6852997b2b79b4c6c5a5fa91_availability.jpg", "features/availability.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66743fbf681b4e5527da890e_booking-with-kit-alt.jpg", "features/booking-with-kit-alt.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65313cf456da2e937c8005aa_bookings-2.jpg", "features/bookings-2.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6682c431a45c0d2b55d0bce5_generate-pdf-overview.jpg", "features/generate-pdf-overview.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/68497efb6fc8bf9b66c7cfaa_working-hours.jpg", "features/working-hours.jpg"],
  // Custody
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/64bfb0ae363259218e6ea3e9_custodians.jpg", "features/custodians.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65845d826a180961c9b87890_custody.jpg", "features/custody.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66cda8a95efaa76ef74aac2b_teampages.jpg", "features/teampages.jpg"],
  // Location Tracking
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65846d8ee3a87601ddd19279_location-tracking.jpg", "features/location-tracking.jpg"],
  // Dashboard
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6557537a39f342dd1ba3b14a_dashboard.jpg", "features/dashboard.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6584589239f5291e33fe59cf_dashboard-2.jpg", "features/dashboard-2.jpg"],
  // Kits
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66743c7bc23139098bf08012_kits.jpg", "features/kits.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66743c7b442798dc61e47fda_kit-page.jpg", "features/kit-page.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66743c7b215260afb5bcbb10_booking-with-kit.jpg", "features/booking-with-kit.jpg"],
  // Asset Reminders
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6797a6e19ceeaec6826c4048_reminders2-min.png", "features/reminders2-min.png"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6797972a746a215bf9c4946d_asset%20reminder%20notice.jpg", "features/asset-reminder-notice.jpg"],
];

const mimes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

let ok = 0;
let fail = 0;

for (const [url, path] of images) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const buf = Buffer.from(await resp.arrayBuffer());

    const ext = extname(path).toLowerCase();
    const mime = mimes[ext] || "application/octet-stream";

    const upResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": mime,
          "x-upsert": "true",
        },
        body: buf,
      }
    );
    if (!upResp.ok)
      throw new Error("Upload " + upResp.status + ": " + (await upResp.text()));

    ok++;
    console.log(`✅ ${path}`);
  } catch (e) {
    fail++;
    console.log(`❌ ${path} — ${e.message}`);
  }
}

console.log(`\n${ok} uploaded, ${fail} failed`);
const BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
console.log(`\nBase URL: ${BASE}/features/`);
