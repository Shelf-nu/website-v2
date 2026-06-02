#!/usr/bin/env node
/**
 * check-product-claims — flags stale / forbidden product claims in content.
 *
 * Source of truth: PRODUCT-FACTS.md. When the facts there change, update the
 * FORBIDDEN patterns below. Exits non-zero if any forbidden claim is found, so
 * CI and the growth IC catch staleness before it ships (e.g. the "Native App
 * Coming Soon" callout that shipped on the #1-ranking mobile-app page after the
 * iOS app had already launched).
 *
 * Usage: node scripts/check-product-claims.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const FORBIDDEN = [
  { re: /native app coming soon/i, why: "Shelf Companion (iPhone) launched 2026-05-25 — don't say 'coming soon'." },
  { re: /join the (beta )?waitlist/i, why: "The iOS app is live on the App Store — link to it, not a waitlist." },
  { re: /upcoming native app/i, why: "The native iPhone app already shipped (Shelf Companion)." },
];

const ROOTS = ["content", "public/llms.txt"];
const EXTS = [".mdx", ".md", ".txt"];

function collect(p, out) {
  let s;
  try { s = statSync(p); } catch { return; }
  if (s.isDirectory()) {
    for (const f of readdirSync(p)) collect(join(p, f), out);
  } else if (EXTS.some((e) => p.endsWith(e))) {
    out.push(p);
  }
}

const files = [];
for (const r of ROOTS) collect(r, files);

let hits = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line)) {
        console.log(`✗ ${f}:${i + 1}  [${why}]`);
        console.log(`    ${line.trim()}`);
        hits++;
      }
    }
  });
}

if (hits > 0) {
  console.error(`\n${hits} stale product claim(s) found across ${files.length} files. Fix per PRODUCT-FACTS.md.`);
  process.exit(1);
}
console.log(`✓ check-product-claims: no stale product claims across ${files.length} files.`);
