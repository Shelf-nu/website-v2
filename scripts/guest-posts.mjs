/**
 * Guest Post Campaign Tracker
 *
 * Answers "is the guest-post agency moving the needle or are we missing the
 * mark?" by comparing current trailing-90d GSC data against the pre-campaign
 * baselines in data/guest-post-campaign.json, including control pages (tide
 * detection) and time-based decision gates.
 *
 * Usage:
 *   node scripts/guest-posts.mjs           # full status report
 *
 * Requires GSC_KEY_FILE / GSC_SITE_URL (same as scripts/analytics.mjs).
 *
 * @see data/guest-post-campaign.json — slots, baselines, gates, anchor rules
 */
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

const campaign = JSON.parse(
  readFileSync(path.join(root, "data", "guest-post-campaign.json"), "utf8")
);

const { google } = await import("googleapis");
// Resolve relative GSC_KEY_FILE values against the repo root (matches analytics.mjs behavior)
const keyFile = path.resolve(root, process.env.GSC_KEY_FILE || "gsc-service-account.json");
const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});
const client = google.searchconsole({ version: "v1", auth });
const site = process.env.GSC_SITE_URL || "sc-domain:shelf.nu";

const BASE = "https://www.shelf.nu";
const end = new Date();
end.setDate(end.getDate() - 2); // GSC data lags ~2 days
const start = new Date(end);
start.setDate(start.getDate() - 90);
const fmt = (d) => d.toISOString().slice(0, 10);

/** Fetch current trailing-90d metrics for every tracked query of a page. */
async function fetchPageQueries(url) {
  const page = url === "/" ? `${BASE}/` : `${BASE}${url}`;
  const res = await client.searchanalytics.query({
    siteUrl: site,
    requestBody: {
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: ["query"],
      dimensionFilterGroups: [
        { filters: [{ dimension: "page", operator: "equals", expression: page }] },
      ],
      rowLimit: 250,
    },
  });
  const map = new Map();
  for (const r of res.data.rows || []) {
    map.set(r.keys[0], {
      position: r.position,
      impressions: r.impressions,
      clicks: r.clicks,
    });
  }
  return map;
}

const delta = (cur, base, invert = false) => {
  if (cur == null) return "  (gone)";
  const d = cur - base;
  const good = invert ? d < 0 : d > 0;
  const sign = d > 0 ? "+" : "";
  const mark = Math.abs(d) < (invert ? 0.5 : base * 0.05) ? " " : good ? "✅" : "🔻";
  return `${sign}${invert ? d.toFixed(1) : d} ${mark}`;
};

const daysSinceStart = Math.floor(
  (Date.now() - new Date(campaign.startDate).getTime()) / 86400000
);

console.log(`\n🔗 Guest Post Campaign — ${campaign.campaign}`);
console.log("=".repeat(78));
console.log(
  `  Started: ${campaign.startDate} (day ${daysSinceStart})  |  Baseline: ${campaign.baseline.window.join(" → ")}  |  Current: ${fmt(start)} → ${fmt(end)}`
);

// Control drift first — everything else is judged net of this
let controlPosDrift = 0;
console.log(`\n🧭 CONTROLS (untouched pages — the tide)`);
for (const c of campaign.controls) {
  const queries = await fetchPageQueries(c.url);
  const cur = queries.get(c.query);
  const drift = cur ? cur.position - c.baseline.position : 0;
  controlPosDrift += drift / campaign.controls.length;
  console.log(
    `  ${c.url.padEnd(38)} "${c.query}"\n` +
      `    pos ${c.baseline.position} → ${cur ? cur.position.toFixed(1) : "—"} (${delta(cur?.position, c.baseline.position, true)})  impr ${c.baseline.impressions} → ${cur ? cur.impressions : "—"}`
  );
}
console.log(
  `  Avg control position drift: ${controlPosDrift >= 0 ? "+" : ""}${controlPosDrift.toFixed(1)} (subtract this mentally from slot movements)`
);

// Slots
for (const slot of campaign.slots) {
  const queries = await fetchPageQueries(slot.url);
  console.log(`\n📌 ${slot.url}  (${slot.postsPerMonth} post/mo — primary: "${slot.primaryKeyword}")`);
  for (const t of slot.trackedQueries) {
    const cur = queries.get(t.query);
    console.log(
      `  ${t.query.padEnd(42).slice(0, 42)} pos ${String(t.baseline.position).padStart(5)} → ${cur ? cur.position.toFixed(1).padStart(5) : "    —"} (${delta(cur?.position, t.baseline.position, true)})  impr ${String(t.baseline.impressions).padStart(5)} → ${cur ? String(cur.impressions).padStart(5) : "    —"} (${delta(cur?.impressions, t.baseline.impressions)})  clicks ${t.baseline.clicks} → ${cur ? cur.clicks : "—"}`
    );
  }
}

// Gates
console.log(`\n🚦 DECISION GATES`);
for (const g of campaign.gates) {
  const due = daysSinceStart >= g.daysAfterStart;
  const status = due ? "⏰ DUE — evaluate now" : `in ${g.daysAfterStart - daysSinceStart} days`;
  console.log(`  [${g.id}] ${status}`);
  console.log(`      ${g.criteria}`);
}

console.log(
  `\n  Anchor rules: max ${campaign.anchorRules.exactMatchPerMonth} exact-match/month across all posts. Vendor must report live URLs monthly.`
);
console.log();
