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

// Both Shelf Companion apps are LIVE — iPhone (App Store, 2026-05-25) and
// Android (Google Play, 2026-06-09) — and do scanning, audits, custody, and
// booking check-in/out. So ANY "coming soon" / waitlist framing for the
// mobile / native / iPhone / Android app is now stale (the per-rule `unless`
// Android exception was removed), and listing iOS *and* Android in
// operatingSystem structured data is correct. These run over BOTH copy
// (content) and code (src badges, JSON-LD), matched per line — so phrasing
// variants ("Mobile App … Coming Soon", "Coming Soon: Bookings on Mobile")
// are caught, not just one exact string.
const MOBILE_LIVE_RULES = [
  { re: /(mobile|native|iphone|ios|android)[ -]?app[^\n]{0,40}coming soon/i,
    why: "Shelf Companion is LIVE on iPhone and Android — don't label the app 'coming soon'." },
  { re: /coming soon[^\n]{0,40}(on mobile|mobile|native app|iphone|ios app|android|companion)/i,
    why: "Shelf Companion is LIVE — don't say the mobile app / bookings-on-mobile is 'coming soon'." },
  { re: /upcoming[^\n]{0,30}native[^\n]{0,12}app/i,
    why: "The native Shelf Companion app already shipped (iPhone + Android)." },
  { re: /join the (beta )?waitlist/i,
    why: "Both apps are live — link to the App Store / Google Play, not a waitlist." },
];

// Code-only claims that feed Google + LLMs directly (structured data).
// (The Android operatingSystem rule was retired when Shelf Companion shipped
//  on Google Play — listing iOS + Android is now correct.)
const SRC_ONLY_RULES = [];

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
