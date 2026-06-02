#!/usr/bin/env node
/**
 * check-product-claims — flags stale / false product claims across the site,
 * in BOTH marketing copy and structured data (what Google + AI answer engines
 * read). Source of truth: PRODUCT-FACTS.md — update the rules below when the
 * facts there change. Exits non-zero on any hit, so CI + the growth IC catch
 * staleness before it ships (e.g. the "Native App Coming Soon" callout that
 * shipped on the #1 mobile-app page after the iOS app launched, or an Android
 * operatingSystem in JSON-LD when no Android app exists yet).
 *
 * Usage: node scripts/check-product-claims.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Stale marketing copy — scanned in content + AI-discovery files.
const CONTENT_RULES = [
  { re: /native app coming soon/i, why: "Shelf Companion (iPhone) launched 2026-05-25 — don't say 'coming soon'." },
  { re: /join the (beta )?waitlist/i, why: "The iOS app is live; link to the App Store, not a waitlist. (An Android 'notify me' form is fine — this flags 'beta waitlist' phrasing.)" },
  { re: /upcoming native app/i, why: "The native iPhone app already shipped (Shelf Companion)." },
];

// Structured-data / code claims — scanned in src (these feed Google + LLMs).
const SRC_RULES = [
  { re: /operatingSystem["'\s:]+["'][^"']*\bAndroid\b/i, why: "No native Android app exists yet (in development) — don't list Android in operatingSystem structured data." },
];

const TARGETS = [
  { roots: ["content", "public/llms.txt"], exts: [".mdx", ".md", ".txt"], rules: CONTENT_RULES },
  { roots: ["src"], exts: [".ts", ".tsx"], rules: SRC_RULES },
];

function collect(p, exts, out) {
  let s;
  try { s = statSync(p); } catch { return; }
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) collect(join(p, f), exts, out);
  } else if (exts.some((e) => p.endsWith(e))) {
    out.push(p);
  }
}

let hits = 0;
let scanned = 0;
for (const { roots, exts, rules } of TARGETS) {
  const files = [];
  for (const r of roots) collect(r, exts, files);
  scanned += files.length;
  for (const f of files) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const { re, why } of rules) {
        if (re.test(line)) {
          console.log(`✗ ${f}:${i + 1}  [${why}]`);
          console.log(`    ${line.trim()}`);
          hits++;
        }
      }
    });
  }
}

if (hits > 0) {
  console.error(`\n${hits} stale product claim(s) found across ${scanned} files. Fix per PRODUCT-FACTS.md.`);
  process.exit(1);
}
console.log(`✓ check-product-claims: no stale product claims across ${scanned} files.`);
