#!/usr/bin/env node
/**
 * cluster-snapshot — query-level GSC snapshot for the "shelf app" cluster on
 * /knowledge-base/shelf-mobile-app.
 *
 * Why this exists: the built-in experiment tool (analytics.mjs
 * `experiments capture-baseline` → gscPageMetrics) is PAGE-level only. A page
 * total can look flat while individual right-intent queries regress — exactly
 * what hid the exp-028 outcome. This records every query individually, plus
 * head / qualified-variant / timing slices, and diffs result vs the last
 * baseline so per-query movement (and the `shelf app` canary) is visible.
 *
 * Reuses the same GSC service-account auth as scripts/analytics.mjs
 * (GSC_KEY_FILE + GSC_SITE_URL in .env.local).
 *
 * Usage:
 *   node scripts/cluster-snapshot.mjs baseline   # writes data/cluster-snapshots/<date>-baseline.json
 *   node scripts/cluster-snapshot.mjs result      # writes <date>-result.json + prints per-query delta vs latest baseline
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const PAGE = "https://www.shelf.nu/knowledge-base/shelf-mobile-app";
const OUT_DIR = resolve(root, "data", "cluster-snapshots");
const DAYS = 30;

const ymd = (d) => d.toISOString().slice(0, 10);

async function gscClient() {
  if (!process.env.GSC_KEY_FILE || !process.env.GSC_SITE_URL) {
    throw new Error("GSC_KEY_FILE and GSC_SITE_URL must be set (.env.local).");
  }
  // Resolve relative to the repo root, not the caller's cwd, so the script
  // works regardless of which directory it's invoked from.
  const key = JSON.parse(readFileSync(resolve(root, process.env.GSC_KEY_FILE), "utf-8"));
  const { google } = await import("googleapis");
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
}

function slice(rows, re) {
  const f = rows.filter((r) => re.test(r.q));
  return {
    queries: f.length,
    clicks: f.reduce((s, r) => s + r.clicks, 0),
    impr: f.reduce((s, r) => s + r.impr, 0),
  };
}

async function pull() {
  const client = await gscClient();
  const end = new Date();
  const start = new Date(end.getTime() - DAYS * 864e5);
  let res;
  try {
    res = await client.searchanalytics.query({
      siteUrl: process.env.GSC_SITE_URL,
      requestBody: {
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ["query"],
        rowLimit: 250,
        dataState: "all",
        dimensionFilterGroups: [
          { filters: [{ dimension: "page", operator: "equals", expression: PAGE }] },
        ],
      },
    });
  } catch (e) {
    console.error(`GSC query failed: ${e?.errors?.[0]?.message || e.message}`);
    process.exit(1);
  }
  const rows = (res.data.rows || []).map((r) => ({
    q: r.keys[0],
    clicks: r.clicks,
    impr: r.impressions,
    ctr: +(r.ctr * 100).toFixed(2),
    pos: +r.position.toFixed(1),
  }));
  rows.sort((a, b) => b.impr - a.impr);
  return {
    page: PAGE,
    dateRange: [ymd(start), ymd(end)],
    rows,
    slices: {
      head: slice(rows, /^(shelf app|app shelf)$/i),
      qualified: slice(rows, /android|apk|download|for android/i),
      timing: slice(rows, /when|coming|release|quando|lan[cç]a|cuando|sale|available|launch/i),
      all: {
        queries: rows.length,
        clicks: rows.reduce((s, r) => s + r.clicks, 0),
        impr: rows.reduce((s, r) => s + r.impr, 0),
      },
    },
  };
}

function latestBaseline() {
  if (!existsSync(OUT_DIR)) return null;
  const files = readdirSync(OUT_DIR).filter((f) => f.endsWith("-baseline.json")).sort();
  return files.length
    ? JSON.parse(readFileSync(resolve(OUT_DIR, files[files.length - 1]), "utf-8"))
    : null;
}

const mode = process.argv[2] ?? "baseline";
if (mode !== "baseline" && mode !== "result") {
  console.error(`Invalid mode: "${mode}". Usage: node scripts/cluster-snapshot.mjs [baseline|result]`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });
const snap = await pull();
const file = resolve(OUT_DIR, `${ymd(new Date())}-${mode}.json`);
writeFileSync(file, JSON.stringify(snap, null, 2) + "\n");
console.log(`\nSaved ${file}  (window ${snap.dateRange[0]} → ${snap.dateRange[1]})`);
for (const [k, v] of Object.entries(snap.slices)) {
  console.log(`  ${k.padEnd(10)} ${String(v.clicks).padStart(5)} clk  ${String(v.impr).padStart(7)} impr  (${v.queries} q)`);
}
if (mode === "result") {
  const base = latestBaseline();
  if (!base) {
    console.log("\nNo baseline snapshot found to diff against.");
  } else {
    const bm = new Map(base.rows.map((r) => [r.q, r]));
    console.log(`\nPER-QUERY DELTA (baseline ${base.dateRange[1]} → result ${snap.dateRange[1]})`);
    console.log(`  ${"query".padEnd(38)} dClk  dImpr   dCTR  dPos`);
    for (const r of snap.rows.slice(0, 40)) {
      const b = bm.get(r.q);
      if (!b) {
        console.log(`  ${r.q.slice(0, 38).padEnd(38)}  NEW (${r.clicks} clk @ pos ${r.pos})`);
        continue;
      }
      console.log(
        `  ${r.q.slice(0, 38).padEnd(38)} ${String(r.clicks - b.clicks).padStart(4)} ${String(r.impr - b.impr).padStart(6)} ${(r.ctr - b.ctr).toFixed(1).padStart(6)} ${(r.pos - b.pos).toFixed(1).padStart(5)}`
      );
    }
    console.log(`\nCANARY — watch the 'shelf app' row: revert if dImpr < -15% or dPos > +1.5.`);
  }
}
