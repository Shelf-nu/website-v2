#!/usr/bin/env node
/**
 * check-product-claims — flags stale / false product claims across the site,
 * in BOTH marketing copy and structured data (what Google + AI answer engines
 * read). Source of truth: PRODUCT-FACTS.md — update the rules below when the
 * facts there change. Exits non-zero on any hit, so CI + the growth IC catch
 * staleness before it ships. Real cases this guards (each shipped or nearly):
 *   • "Native App Coming Soon / join the beta waitlist" on the #1 mobile-app KB page
 *   • "Coming Soon: Bookings on Mobile … upcoming Shelf native app" on /features/bookings
 *   • a "Mobile App — Coming Soon" badge in the homepage feature nav
 *   • an Android operatingSystem in JSON-LD when no native Android app exists yet
 *
 * Usage: node scripts/check-product-claims.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// The iPhone Companion is LIVE (App Store, 2026-05-25) and does booking
// check-in/out; Android is genuinely in development. So a claim SCOPED to
// Android ("Android — in development", an Android "notify me" form) is fine —
// `unless: /android/i` lets those through. Anything else that calls the
// mobile / native / iPhone app "coming soon" or routes it to a waitlist is
// stale. These run over BOTH copy (content) and code (src badges, JSON-LD),
// matched per line — so phrasing variants ("Mobile App … Coming Soon",
// "Coming Soon: Bookings on Mobile") are caught, not just one exact string.
const MOBILE_LIVE_RULES = [
  { re: /(mobile|native|iphone|ios)[ -]?app[^\n]{0,40}coming soon/i, unless: /android/i,
    why: "Shelf Companion (iPhone) is LIVE — don't label the mobile/native app 'coming soon'." },
  { re: /coming soon[^\n]{0,40}(on mobile|mobile|native app|iphone|ios app|companion)/i, unless: /android/i,
    why: "Shelf Companion (iPhone) is LIVE — don't say the mobile app / bookings-on-mobile is 'coming soon'." },
  { re: /upcoming[^\n]{0,30}native[^\n]{0,12}app/i, unless: /android/i,
    why: "The native iPhone app already shipped (Shelf Companion)." },
  { re: /join the (beta )?waitlist/i, unless: /android/i,
    why: "The iOS app is live; link to the App Store. (An Android 'notify me' form is fine.)" },
];

// Code-only claims that feed Google + LLMs directly (structured data).
const SRC_ONLY_RULES = [
  { re: /operatingSystem["'\s:]+["'][^"']*\bAndroid\b/i, why: "No native Android app exists yet (in development) — don't list Android in operatingSystem structured data." },
];

const TARGETS = [
  { roots: ["content", "public/llms.txt"], exts: [".mdx", ".md", ".txt"], rules: MOBILE_LIVE_RULES },
  { roots: ["src"], exts: [".ts", ".tsx"], rules: [...MOBILE_LIVE_RULES, ...SRC_ONLY_RULES] },
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
      for (const { re, unless, why } of rules) {
        if (re.test(line) && !(unless && unless.test(line))) {
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
