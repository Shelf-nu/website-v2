#!/usr/bin/env node
/**
 * Upload solution page images from Webflow CDN to Supabase Storage
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
  // ─── Shared across multiple solution pages ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65d472ff03f2c30502ccfb49_asset-index.webp", "solutions/asset-index.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f84bd35ca3d601a13c8e3e_phone-qr-alt-2.png", "solutions/phone-qr-alt-2.png"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd6c58e006e99fc380fa0c_imac.webp", "solutions/imac.webp"],

  // ─── Asset Tracking ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e964327180bd71a8cb572d_Asset%20tracking%20page.jpg", "solutions/asset-tracking-hero.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f99a565de77c4670b6d8b1_laptop-reverse.webp", "solutions/laptop-reverse.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f99f50519f25af9240963e_mouse.webp", "solutions/mouse.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f99f506382f8dd55399183_keyboard-reverse.webp", "solutions/keyboard-reverse.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f963c6c6c4284e23158de5_asset-tracking.webp", "solutions/asset-tracking-illustration.webp"],

  // ─── Fixed Asset Tracking ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f963b6e154d44e3681172f_main-fixed-asset-tracking.webp", "solutions/main-fixed-asset-tracking.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd6c8e757a6f3e7ae95c34_imac-reverse.webp", "solutions/imac-reverse.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd9f1a54a5b0a2b7f52120_server-rack.png", "solutions/server-rack.png"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd9f1a828ad5fb6ad659fb_racks-reserve.png", "solutions/racks-reserve.png"],

  // ─── Tool Tracking ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f963b6bb1ebf95ab989f49_main-tool-tracking.webp", "solutions/main-tool-tracking.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd7c0eac10359bc7645488_toolbox-reverse.webp", "solutions/toolbox-reverse.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd79c801c3e2c49a2ce004_drill2.webp", "solutions/drill2.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd79c874aaf41368b1b38f_drill-reverse.webp", "solutions/drill-reverse.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fd7c0eaf536c05faee7773_toolbox.webp", "solutions/toolbox.webp"],

  // ─── Camera Equipment Check-Out ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f963b601a882525a254d42_main-camera-equipment-tracking.webp", "solutions/main-camera-equipment-tracking.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fc58b4a61ca6c1d86c2096_video-camera.webp", "solutions/video-camera.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65f99a4d020ea87653598127_laptop.webp", "solutions/laptop.webp"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/65fc59ba573524f28b7fa3bb_light-reverse.webp", "solutions/light-reverse.webp"],
  // Fabel Film gallery images
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/673749a3240b44b42f89257c_191224_Portugal%2B16.jpg", "solutions/fabel-portugal.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/673749cfeff20d33fb16a4b8_Human_Playground_S1_E1_00_01_09_21_R%2B(1).jpg", "solutions/fabel-human-playground.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/67374a30b8cb366523b4f633_Screenshot%202024-11-15%20at%2014.18.27.jpg", "solutions/fabel-screenshot-booking.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/673748eabe3c146f36e03718_crew.jpg", "solutions/fabel-crew.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/6737472c5839d97bcbca2609_Screenshot%202024-11-15%20at%2014.05.37.jpg", "solutions/fabel-screenshot-assets.jpg"],

  // ─── Equipment Reservations ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e95d07e9395c75750d77d1_Calendar%20solution%20page-min.jpg", "solutions/calendar-hero.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e95fcba0870c6a060b32cc_data-types-shelf.jpg", "solutions/data-types-shelf.jpg"],

  // ─── Educational Resource Management ───
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66ede84d70e32585582d38af_Screenshot%202024-09-20%20at%2023.25.26.jpg", "solutions/education-screenshot.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66169f24c56bd1810678669f_laptop-reverse.jpg", "solutions/education-laptop.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66169f24e04890ccb3506349_keyboard-1.jpg", "solutions/education-keyboard.jpg"],
  // Gallery / case study images
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e9adc410522d23e86a7380_668d335ced149798bc9ae0fe_cmta-tvstudio-686x485.jpg", "solutions/education-tvstudio.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e9ae410e88014cfb5fa72f_668d0ddb6dddf00203fde59a_homepage-fb-1.jpeg", "solutions/education-homepage.jpeg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e9ae2525c7a6894e147def_Screenshot%202024-09-17%20at%2018.28.14.jpg", "solutions/education-screenshot-2.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e9ac188cbbc2c091da8683_feature-image-05.jpg", "solutions/education-feature.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/66e9ae547361ba597acee397_668d334ddfce924232b214ab_62385954_10155340267172614_8111997958515326976_n.jpg", "solutions/education-students.jpg"],
  ["https://cdn.prod.website-files.com/64186faca4f0a0ec048fb2dd/668bed202994d7e6611db561_eastern-michigan-university.png", "solutions/eastern-michigan-university.png"],
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
console.log(`\nBase URL: ${BASE}/solutions/`);
