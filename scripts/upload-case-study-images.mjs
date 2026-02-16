#!/usr/bin/env node
/**
 * Upload case study images from Webflow CDN to Supabase Storage
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
  // ─── Fabel Film — new cover image ───
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/68f8b95b953061f76c10c374_1726495559939.jpeg", "case-studies/fabel-film-cover.jpeg"],

  // ─── KCAI — cover + logo ───
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/67aa1ba2c258695b6bd94483_Printmaking_Studio.original.jpg", "case-studies/kcai-cover.jpg"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/68caf27af40a202c65e27d65_kcailogo.png", "case-studies/kcai-logo.png"],

  // ─── Eastern Michigan University — cover + logo ───
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/668d0ddb6dddf00203fde59a_homepage-fb-1.jpeg", "case-studies/emu-cover.jpeg"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/668bffa8f7610192dd3040e2_eastern-michigan-university.png", "case-studies/emu-logo.png"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/668d1135fbb47db7cdf2f7e0_images.png", "case-studies/emu-institutional.png"],

  // ─── Arellano Associates — all new ───
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/69735383265fec88bb5da4d4_DSC09359_JPG.avif", "case-studies/arellano-cover.avif"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/6973527f8d47d5d9648cbc90_AA%20Logo%202025%20Blue-horizontal.avif", "case-studies/arellano-logo.avif"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/697359cadd5e43dc0fc2b7cb_6733488720906c224ae3073d_assetindex2-p-2000-1.png", "case-studies/arellano-asset-index.png"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/6973588169d7e5b987c38eee_Screenshot%202026-01-23%20at%2012.16.05.jpg", "case-studies/arellano-screenshot.jpg"],
  ["https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/697355c6d2b28afc53042314_arellano_associates_logo.jpg", "case-studies/arellano-logo-square.jpg"],
];

const mimes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
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
console.log(`\nBase URL: ${BASE}/case-studies/`);
