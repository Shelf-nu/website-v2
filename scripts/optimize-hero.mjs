#!/usr/bin/env node
/**
 * Convert source PNGs to WebP for LCP optimization.
 * Run: node scripts/optimize-hero.mjs
 *
 * Source PNGs live under scripts/source-images/ (NOT public/) so the
 * uncompressed originals don't ship in the static export. Only the
 * generated .webp lands in public/images/ and is referenced by the app.
 */
import sharp from "sharp";
import { stat } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/**
 * Each entry: a source PNG (outside public/) → a shipped WebP (in public/).
 *
 * Follow-up — mobile-app hero (public/images/mobile-app/hero-hand.png, ~900 KB):
 *   not converted here yet. It is referenced in two places, one of which is a
 *   blog post's `image:` (OG/social share). Before converting, move the source
 *   PNG into scripts/source-images/, add it below, regenerate, then swap BOTH
 *   references — and confirm the social-share use renders (some scrapers still
 *   prefer PNG/JPG for OG images, so a PNG/JPG OG fallback may be wanted).
 */
const conversions = [
    {
        input: resolve(root, "scripts/source-images/hero_dashboard_v3.png"),
        output: resolve(root, "public/images/hero_dashboard_v3.webp"),
    },
];

for (const { input, output } of conversions) {
    const before = (await stat(input)).size;
    await sharp(input).webp({ quality: 82 }).toFile(output);
    const after = (await stat(output)).size;

    const name = input.split("/").pop();
    console.log(`✓ ${name} → .webp`);
    console.log(`  Before: ${(before / 1024).toFixed(0)} KB`);
    console.log(`  After:  ${(after / 1024).toFixed(0)} KB`);
    console.log(`  Saved:  ${((1 - after / before) * 100).toFixed(0)}%`);
}
