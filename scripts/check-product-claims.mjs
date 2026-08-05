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
 * Usage:
 *   node scripts/check-product-claims.mjs                       # full-repo scan (push to main + weekly cron)
 *   node scripts/check-product-claims.mjs --changed <files...>  # PR: scan only the files the PR changed
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
// Run on .ts/.tsx only — prose MDX can legitimately mention iOS without Android
// (e.g. an iPhone-specific KB step), which would false-positive here.
const SRC_ONLY_RULES = [
  { re: /operatingSystem"?\s*:\s*"(?=[^"]*\biOS\b)(?![^"]*\bAndroid\b)[^"]*"/i,
    why: "Shelf Companion is LIVE on Android (Google Play, 2026-06-09) — platform operatingSystem structured data must list Android alongside iOS (e.g. \"Web, iOS, Android\")." },
];

// Hardcoded prices are the other way stale claims ship. Every price the site
// publishes must come from src/data/pricing.ts or src/data/pricing.addons.ts
// (the latter verified against Stripe) so one edit updates every surface.
// This caught nothing historically because nothing checked — meanwhile the
// pricing FAQ published "Alternative Barcodes ($170/yr)" for months while a
// live monthly price for the same add-on went unmentioned.
const PRICE_RULES = [
  { re: /\$\d[\d,]*(\.\d{2})?\s*\/\s*(mo|month|yr|year|user)/i,
    why: "Hardcoded price. Import it from src/data/pricing.addons.ts (add-ons) or src/data/pricing.ts (plans) instead — see the add-on price helpers." },
  { re: /\$\d[\d,]*(\.\d{2})?\s*(per|a)\s+(month|year|user|seat)/i,
    why: "Hardcoded price. Import it from src/data/pricing.addons.ts or src/data/pricing.ts instead." },
];

// Files allowed to contain literal price strings: the data modules that ARE
// the source of truth, plus PRODUCT-FACTS.md which documents them for humans.
const PRICE_RULE_EXEMPT = [
  "src/data/pricing.ts",
  "src/data/pricing.addons.ts",
  "src/data/pricing-audit.txt",
  "PRODUCT-FACTS.md",
];

// ---------------------------------------------------------------------------
// THIS REPOSITORY IS PUBLIC.
//
// Anything committed here — source, comments, commit messages — is world
// readable, permanently, including via the commit history after a later edit.
// Business internals have no business being in it. This rule exists because
// they were: a PR description and several code comments carried per-add-on
// subscriber counts, a named customer with their invoice number, and a
// negotiated licence price we had explicitly decided not to publish.
//
// Only prices and facts we publish on the website belong in this repo.
// Everything else stays in Stripe, PostHog, or the sales tooling.
// ---------------------------------------------------------------------------
// Never legitimate anywhere in the repo.
const CONFIDENTIAL_RULES = [
  { re: /\b(acct|prod|price|sub|cus|in|txn|ch)_[A-Za-z0-9]{14,}\b/,
    why: "Stripe object identifier in a public repo. Reference the product by name, not by id." },
  { re: /\binvoice\s+[A-Z0-9]{6,}-\d{3,}/i,
    why: "Invoice number in a public repo. Never reference a customer invoice in source." },
];

// Our own business volumes. Scoped to code, NOT content — comparison pages
// legitimately cite a competitor's published customer count ("Sortly ... over
// 30,000 customers"), which is a public fact about someone else, not ours.
const OUR_METRICS_RULES = [
  { re: /\b\d[\d,]*\s+(paying\s+)?(subscribers?|subscriptions?)\b/i,
    why: "Subscriber count in a public repo. Our business volumes belong in Stripe, not in source or comments." },
  { re: /\b(active|paying)\s+subscriptions?\s*[:=]?\s*\d/i,
    why: "Subscriber count in a public repo. Our business volumes belong in Stripe." },
  { re: /\bMRR\b[^\n]{0,20}[$€£]\s?\d/i,
    why: "Revenue figure in a public repo. MRR belongs in Stripe, not in source or comments." },
];

const MOBILE_LIVE_RULES_EXTRA = [
  { re: /android[^\n]{0,30}(in development|coming|not yet|planned|on the roadmap)/i,
    why: "Shelf Companion for Android is LIVE on Google Play (2026-06-09) — don't describe it as in development or planned." },
  { re: /(ios|iphone)[- ]only[^\n]{0,20}(app|companion)/i,
    why: "Shelf Companion ships on BOTH iPhone and Android — don't call it iOS-only." },
];

MOBILE_LIVE_RULES.push(...MOBILE_LIVE_RULES_EXTRA);

// NOTE: PRICE_RULES deliberately do NOT run over `content`. Blog posts and
// comparison pages legitimately quote competitor pricing ("Reftab Business
// $125/mo") and equipment budget ranges ("$1,200 - $1,800/yr") — those are
// editorial facts about the world, not Shelf's own prices, and gating them
// would make the check unusable (97 hits, ~90 of them noise). Shelf's own
// prices are rendered from src/, which is where the rule bites.
const TARGETS = [
  // public/llms.txt is now GENERATED by src/app/llms.txt/route.ts, so the
  // route file (under "src") is what needs scanning — the old public/ path is
  // kept off the list deliberately rather than silently matching nothing.
  { roots: ["content"], exts: [".mdx", ".md", ".txt"], rules: MOBILE_LIVE_RULES },
  { roots: ["src"], exts: [".ts", ".tsx"], rules: [...MOBILE_LIVE_RULES, ...SRC_ONLY_RULES, ...PRICE_RULES] },
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

// The source-of-truth data modules are allowed to hold literal prices — they
// are where every other surface reads them from. Everything else must import.
function stripExemptRules(filePath, rules) {
  const p = filePath.replace(/^\.\//, "");
  if (!PRICE_RULE_EXEMPT.includes(p)) return rules;
  return rules.filter((r) => !PRICE_RULES.includes(r));
}

// Map a file path to the rule set that applies, or null if it is out of scope
// (not under a scanned root, or the wrong extension). Drives --changed mode.
function rulesForFile(filePath) {
  const p = filePath.replace(/^\.\//, "");
  for (const { roots, exts, rules } of TARGETS) {
    const underRoot = roots.some((r) => p === r || p.startsWith(`${r}/`));
    if (underRoot && exts.some((e) => p.endsWith(e))) {
      return stripExemptRules(p, rules);
    }
  }
  return null;
}

// Build the scan list. On a PR, CI passes the PR's changed files after
// `--changed`, so we gate only on the claims the PR actually touches — never on
// pre-existing claims in files it didn't change (which would block unrelated
// work). With no `--changed` (push to main + the weekly cron) we fall back to
// the full-repo scan that catches drift anywhere on the site.
const changedMode = process.argv.includes("--changed");
const argFiles = process.argv.slice(2).filter((a) => !a.startsWith("-"));

const workList = []; // { file, rules }
if (changedMode) {
  for (const f of argFiles) {
    const rules = rulesForFile(f);
    if (rules) workList.push({ file: f, rules });
  }
} else {
  for (const { roots, exts, rules } of TARGETS) {
    const files = [];
    for (const r of roots) collect(r, exts, files);
    for (const f of files) workList.push({ file: f, rules: stripExemptRules(f, rules) });
  }
}

let hits = 0;
for (const { file, rules } of workList) {
  let lines;
  try {
    lines = readFileSync(file, "utf8").split("\n");
  } catch {
    continue; // file deleted/renamed away in the PR — nothing to scan
  }
  // Code comments are never rendered to a user, and they are where we document
  // WHY a rule exists (e.g. "published $170/yr while a live monthly price went
  // unmentioned", "described Android as in development"). Scanning them turns
  // every explanation into a self-inflicted failure. Only applies to .ts/.tsx —
  // in MDX a leading `*` is a bullet or bold marker, not a comment.
  const isCode = /\.tsx?$/.test(file);
  const isComment = (line) => isCode && /^\s*(\/\/|\/\*|\*)/.test(line);

  lines.forEach((line, i) => {
    if (isComment(line)) return;
    for (const { re, unless, why } of rules) {
      if (re.test(line) && !(unless && unless.test(line))) {
        console.log(`✗ ${file}:${i + 1}  [${why}]`);
        console.log(`    ${line.trim()}`);
        hits++;
      }
    }
  });
}

// Confidential-data sweep. Deliberately a FULL-REPO scan even in --changed
// mode, and deliberately scans comments too: the leak this guards against was
// introduced entirely in comments and prose, and once pushed to a public repo
// it is permanent regardless of any later edit.
{
  const codeFiles = [];
  collect("src", [".ts", ".tsx"], codeFiles);
  collect("scripts", [".mjs", ".js"], codeFiles);
  collect("data", [".json"], codeFiles);

  const allFiles = [...codeFiles];
  collect("content", [".mdx", ".md"], allFiles);

  const scan = (list, rules) => {
    for (const file of list) {
      let lines;
      try { lines = readFileSync(file, "utf8").split("\n"); } catch { continue; }
      lines.forEach((line, i) => {
        for (const { re, why } of rules) {
          if (re.test(line)) {
            console.log(`✗ ${file}:${i + 1}  [CONFIDENTIAL — ${why}]`);
            console.log(`    ${line.trim().slice(0, 160)}`);
            hits++;
          }
        }
      });
    }
  };

  scan(allFiles, CONFIDENTIAL_RULES);
  scan(codeFiles, OUR_METRICS_RULES);
}

const scope = changedMode
  ? `${workList.length} changed file(s)`
  : `${workList.length} files`;
if (hits > 0) {
  console.error(`\n${hits} stale product claim(s) found across ${scope}. Fix per PRODUCT-FACTS.md.`);
  process.exit(1);
}
console.log(`✓ check-product-claims: no stale product claims across ${scope}.`);
