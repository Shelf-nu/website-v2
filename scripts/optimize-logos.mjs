#!/usr/bin/env node
/**
 * Optimize customer logos: resize to max 320px wide + convert to WebP.
 * Skips SVGs and files already in WebP format.
 * Run: node scripts/optimize-logos.mjs
 */
import sharp from "sharp";
import { readdir, stat, unlink } from "fs/promises";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logosDir = resolve(__dirname, "..", "public/logos");

const MAX_WIDTH = 320; // 2× retina for 160px display
const WEBP_QUALITY = 80;
const SKIP_EXTENSIONS = new Set([".svg", ".webp"]);

const files = await readdir(logosDir);
let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;

for (const file of files.sort()) {
  const ext = extname(file).toLowerCase();
  const filePath = resolve(logosDir, file);

  // Skip non-image files, SVGs, and existing WebPs
  if (![".png", ".jpg", ".jpeg"].includes(ext)) {
    if (SKIP_EXTENSIONS.has(ext)) {
      skipped++;
    }
    continue;
  }

  const beforeSize = (await stat(filePath)).size;
  totalBefore += beforeSize;

  const outputName = basename(file, ext) + ".webp";
  const outputPath = resolve(logosDir, outputName);

  try {
    const image = sharp(filePath);
    const meta = await image.metadata();

    // Resize if wider than MAX_WIDTH, maintaining aspect ratio
    const pipeline = meta.width && meta.width > MAX_WIDTH
      ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true })
      : image;

    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outputPath);

    const afterSize = (await stat(outputPath)).size;
    totalAfter += afterSize;
    converted++;

    const savings = ((1 - afterSize / beforeSize) * 100).toFixed(0);
    console.log(
      `✓ ${file} → ${outputName}  ` +
      `${(beforeSize / 1024).toFixed(0)} KB → ${(afterSize / 1024).toFixed(0)} KB  (${savings}% saved)`
    );
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

console.log(`\n--- Summary ---`);
console.log(`Converted: ${converted} files`);
console.log(`Skipped:   ${skipped} files (SVG/WebP)`);
console.log(`Total before: ${(totalBefore / 1024).toFixed(0)} KB`);
console.log(`Total after:  ${(totalAfter / 1024).toFixed(0)} KB`);
console.log(`Total saved:  ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%`);
