#!/usr/bin/env node
/**
 * Convert hero dashboard PNG to WebP for LCP optimization.
 * Run: node scripts/optimize-hero.mjs
 */
import sharp from "sharp";
import { stat } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const input = resolve(root, "public/images/hero_dashboard_v3.png");
const output = resolve(root, "public/images/hero_dashboard_v3.webp");

const before = (await stat(input)).size;
await sharp(input).webp({ quality: 82 }).toFile(output);
const after = (await stat(output)).size;

console.log(`✓ hero_dashboard_v3.png → .webp`);
console.log(`  Before: ${(before / 1024).toFixed(0)} KB`);
console.log(`  After:  ${(after / 1024).toFixed(0)} KB`);
console.log(`  Saved:  ${((1 - after / before) * 100).toFixed(0)}%`);
