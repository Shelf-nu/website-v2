#!/usr/bin/env node

/**
 * Analytics CLI — query Cloudflare Web Analytics + Supabase custom events.
 *
 * Usage:
 *   node scripts/analytics.mjs summary      [--days 7]
 *   node scripts/analytics.mjs traffic      [--days 30]
 *   node scripts/analytics.mjs top-pages    [--days 30]
 *   node scripts/analytics.mjs conversions  [--days 7]
 *   node scripts/analytics.mjs searches     [--days 30]
 *   node scripts/analytics.mjs referrers    [--days 30]
 *   node scripts/analytics.mjs content-changes [--days 30]
 *   node scripts/analytics.mjs attribution  [--days 30]
 *
 *   node scripts/analytics.mjs gsc-queries   [--days 30]
 *   node scripts/analytics.mjs gsc-pages     [--days 30]
 *   node scripts/analytics.mjs gsc-summary   [--days 30]
 *
 *   node scripts/analytics.mjs experiments                        # Show all experiments
 *   node scripts/analytics.mjs experiments capture-baseline <id>  # Capture baseline GSC metrics
 *   node scripts/analytics.mjs experiments deploy <id>            # Mark experiment as deployed
 *
 * Env vars required:
 *   CF_API_TOKEN       — Cloudflare API token with Analytics:Read scope
 *   CF_SITE_TAG        — Cloudflare Web Analytics site tag
 *   SUPABASE_URL       — Supabase project URL
 *   SUPABASE_SERVICE_KEY — Supabase service role key
 *   GSC_KEY_FILE       — Path to Google Search Console service account JSON key
 *   GSC_SITE_URL       — GSC property URL (e.g. sc-domain:shelf.nu)
 */

import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync } from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") }); // fallback

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_SITE_TAG = process.env.CF_SITE_TAG;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const GSC_KEY_FILE = process.env.GSC_KEY_FILE;
const GSC_SITE_URL = process.env.GSC_SITE_URL;

const args = process.argv.slice(2);
const command = args[0] || "summary";
const daysIdx = args.indexOf("--days");
const days = daysIdx >= 0 ? parseInt(args[daysIdx + 1], 10) || 7 : 7;

const now = new Date();
const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);

function dateStr(d) {
    return d.toISOString().split("T")[0];
}

/* ------------------------------------------------------------------ */
/*  Cloudflare GraphQL                                                 */
/* ------------------------------------------------------------------ */

async function cfQuery(query, variables = {}) {
    if (!CF_API_TOKEN || !CF_SITE_TAG) {
        console.log("⚠️  CF_API_TOKEN and CF_SITE_TAG required for Cloudflare data.");
        return null;
    }

    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        console.error("CF API error:", res.status, await res.text());
        return null;
    }

    const json = await res.json();
    if (json.errors?.length) {
        console.error("CF GraphQL errors:", JSON.stringify(json.errors, null, 2));
        return null;
    }
    return json.data;
}

async function getTraffic(startDate, endDate) {
    const query = `
        query ($accountTag: string!, $siteTag: string!, $since: string!, $until: string!) {
            viewer {
                accounts(filter: { accountTag: $accountTag }) {
                    rumPageloadEventsAdaptiveGroups(
                        filter: { AND: [
                            { siteTag: $siteTag },
                            { date_geq: $since },
                            { date_leq: $until }
                        ] }
                        limit: 1
                    ) {
                        count
                        sum { visits }
                    }
                }
            }
        }
    `;
    return cfQuery(query, { accountTag: CF_ACCOUNT_ID, siteTag: CF_SITE_TAG, since: startDate, until: endDate });
}

async function getTopPages(startDate, endDate, limit = 15) {
    const query = `
        query ($accountTag: string!, $siteTag: string!, $since: string!, $until: string!) {
            viewer {
                accounts(filter: { accountTag: $accountTag }) {
                    rumPageloadEventsAdaptiveGroups(
                        filter: { AND: [
                            { siteTag: $siteTag },
                            { date_geq: $since },
                            { date_leq: $until }
                        ] }
                        limit: ${limit}
                        orderBy: [count_DESC]
                    ) {
                        count
                        dimensions { requestPath }
                    }
                }
            }
        }
    `;
    return cfQuery(query, { accountTag: CF_ACCOUNT_ID, siteTag: CF_SITE_TAG, since: startDate, until: endDate });
}

async function getReferrers(startDate, endDate, limit = 10) {
    const query = `
        query ($accountTag: string!, $siteTag: string!, $since: string!, $until: string!) {
            viewer {
                accounts(filter: { accountTag: $accountTag }) {
                    rumPageloadEventsAdaptiveGroups(
                        filter: { AND: [
                            { siteTag: $siteTag },
                            { date_geq: $since },
                            { date_leq: $until }
                        ] }
                        limit: ${limit}
                        orderBy: [count_DESC]
                    ) {
                        count
                        dimensions { refererHost }
                    }
                }
            }
        }
    `;
    return cfQuery(query, { accountTag: CF_ACCOUNT_ID, siteTag: CF_SITE_TAG, since: startDate, until: endDate });
}

/* ------------------------------------------------------------------ */
/*  Supabase REST                                                      */
/* ------------------------------------------------------------------ */

async function supabaseQuery(table, params = "") {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.log("⚠️  SUPABASE_URL and SUPABASE_SERVICE_KEY required for event data.");
        return null;
    }

    const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
    const res = await fetch(url, {
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "count=exact",
        },
    });

    if (!res.ok) {
        console.error("Supabase error:", res.status, await res.text());
        return null;
    }

    const count = res.headers.get("content-range")?.split("/")[1];
    const data = await res.json();
    return { data, total: count ? parseInt(count) : data.length };
}

async function getEvents(eventName, sinceDate) {
    const params = new URLSearchParams({
        event_name: `eq.${eventName}`,
        "created_at": `gte.${sinceDate.toISOString()}`,
        order: "created_at.desc",
        limit: "1000",
    });
    return supabaseQuery("analytics_events", params.toString());
}

async function getEventCounts(sinceDate) {
    const params = new URLSearchParams({
        "created_at": `gte.${sinceDate.toISOString()}`,
        select: "event_name",
        order: "created_at.desc",
        limit: "10000",
    });
    const result = await supabaseQuery("analytics_events", params.toString());
    if (!result) return {};

    const counts = {};
    for (const row of result.data) {
        counts[row.event_name] = (counts[row.event_name] || 0) + 1;
    }
    return counts;
}

async function getContentChanges(sinceDate) {
    const params = new URLSearchParams({
        "created_at": `gte.${sinceDate.toISOString()}`,
        order: "created_at.desc",
        limit: "100",
    });
    return supabaseQuery("content_changelog", params.toString());
}

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

function pct(a, b) {
    if (!b) return "N/A";
    return ((a / b) * 100).toFixed(1) + "%";
}

function delta(current, previous) {
    if (!previous) return "";
    const d = ((current - previous) / previous) * 100;
    const sign = d >= 0 ? "+" : "";
    const arrow = d >= 0 ? "↑" : "↓";
    return `  (${sign}${d.toFixed(0)}% ${arrow})`;
}

function pad(str, len) {
    return String(str).padEnd(len);
}

function rpad(str, len) {
    return String(str).padStart(len);
}

/* ------------------------------------------------------------------ */
/*  Commands                                                           */
/* ------------------------------------------------------------------ */

async function cmdSummary() {
    console.log(`\n📊 Shelf.nu — Last ${days} Days\n${"=".repeat(50)}`);

    // Traffic from Cloudflare
    const traffic = await getTraffic(dateStr(since), dateStr(now));
    const prevTraffic = await getTraffic(dateStr(prevSince), dateStr(since));

    if (traffic) {
        const accounts = traffic.viewer?.accounts?.[0];
        const prevAccounts = prevTraffic?.viewer?.accounts?.[0];
        const groups = accounts?.rumPageloadEventsAdaptiveGroups?.[0];
        const prevGroups = prevAccounts?.rumPageloadEventsAdaptiveGroups?.[0];

        const views = groups?.count || 0;
        const visits = groups?.sum?.visits || 0;
        const prevViews = prevGroups?.count || 0;
        const prevVisits = prevGroups?.sum?.visits || 0;

        console.log("\nTRAFFIC");
        console.log(`  Page views:  ${rpad(views.toLocaleString(), 10)}${delta(views, prevViews)}`);
        console.log(`  Visits:      ${rpad(visits.toLocaleString(), 10)}${delta(visits, prevVisits)}`);
    }

    // Conversions from Supabase
    const counts = await getEventCounts(since);
    const prevCounts = await getEventCounts(prevSince);

    if (Object.keys(counts).length > 0) {
        console.log("\nCONVERSIONS");
        const events = ["signup_click", "demo_form_submit", "pricing_cta"];
        for (const e of events) {
            const c = counts[e] || 0;
            const p = prevCounts[e] || 0;
            console.log(`  ${pad(e, 22)} ${rpad(c, 6)}${delta(c, p)}`);
        }
    }

    // Top pages from Cloudflare
    const topPages = await getTopPages(dateStr(since), dateStr(now), 10);
    if (topPages) {
        const pages = topPages.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
        if (pages.length > 0) {
            console.log("\nTOP PAGES BY VIEWS");
            for (const p of pages) {
                console.log(`  ${pad(p.dimensions?.requestPath || p.dimensions?.path || "(unknown)", 45)} ${rpad(p.count.toLocaleString(), 8)}`);
            }
        }
    }

    // Search queries from Supabase
    const searches = await getEvents("search_query", since);
    if (searches?.data?.length) {
        const queryCounts = {};
        for (const e of searches.data) {
            const q = e.properties?.query || "";
            if (q) queryCounts[q] = (queryCounts[q] || 0) + 1;
        }
        const sorted = Object.entries(queryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length > 0) {
            console.log("\nSEARCH QUERIES (content gap opportunities)");
            console.log("  " + sorted.map(([q, c]) => `"${q}" (${c}×)`).join(", "));
        }
    }

    // Scroll depth summary
    const scrolls = await getEvents("scroll_depth", since);
    if (scrolls?.data?.length) {
        const pathDepths = {};
        for (const e of scrolls.data) {
            const path = e.page_path || "";
            const depth = parseInt(e.properties?.depth || "0");
            if (!pathDepths[path]) pathDepths[path] = { max: 0, count: 0 };
            if (depth === 100) pathDepths[path].count++;
            pathDepths[path].max = Math.max(pathDepths[path].max, depth);
        }

        // Show pages with best/worst completion rates
        const pageViews = {};
        const pvData = await getEvents("page_view", since);
        if (pvData?.data) {
            for (const e of pvData.data) {
                const p = e.page_path || "";
                pageViews[p] = (pageViews[p] || 0) + 1;
            }
        }

        const engagement = Object.entries(pathDepths)
            .map(([path, data]) => ({
                path,
                completionRate: pageViews[path] ? data.count / pageViews[path] : 0,
                views: pageViews[path] || 0,
            }))
            .filter(e => e.views >= 3)
            .sort((a, b) => b.completionRate - a.completionRate);

        if (engagement.length > 0) {
            console.log("\nCONTENT ENGAGEMENT (scroll to bottom rate)");
            for (const e of engagement.slice(0, 5)) {
                const emoji = e.completionRate >= 0.5 ? "✅" : e.completionRate < 0.25 ? "⚠️" : "";
                console.log(`  ${pad(e.path, 45)} ${pct(e.completionRate * 100, 100).padStart(5)} ${emoji}`);
            }
        }
    }

    console.log("");
}

async function cmdTraffic() {
    console.log(`\n📈 Traffic — Last ${days} Days\n${"=".repeat(40)}`);
    const data = await getTraffic(dateStr(since), dateStr(now));
    const prev = await getTraffic(dateStr(prevSince), dateStr(since));
    if (!data) return;

    const groups = data.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups?.[0];
    const prevGroups = prev?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups?.[0];

    console.log(`  Page views:  ${groups?.count?.toLocaleString() || 0}${delta(groups?.count || 0, prevGroups?.count || 0)}`);
    console.log(`  Visits:      ${groups?.sum?.visits?.toLocaleString() || 0}${delta(groups?.sum?.visits || 0, prevGroups?.sum?.visits || 0)}`);
    console.log("");
}

async function cmdTopPages() {
    console.log(`\n📄 Top Pages — Last ${days} Days\n${"=".repeat(50)}`);
    const data = await getTopPages(dateStr(since), dateStr(now));
    if (!data) return;

    const pages = data.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
    for (const p of pages) {
        console.log(`  ${pad(p.dimensions?.requestPath || p.dimensions?.path || "(unknown)", 50)} ${rpad(p.count.toLocaleString(), 8)}`);
    }
    console.log("");
}

async function cmdConversions() {
    console.log(`\n🎯 Conversions — Last ${days} Days\n${"=".repeat(40)}`);
    const counts = await getEventCounts(since);
    const prevCounts = await getEventCounts(prevSince);

    const events = ["signup_click", "demo_form_submit", "pricing_cta", "search_query", "404_hit"];
    for (const e of events) {
        const c = counts[e] || 0;
        const p = prevCounts[e] || 0;
        console.log(`  ${pad(e, 22)} ${rpad(c, 6)}${delta(c, p)}`);
    }
    console.log("");
}

async function cmdSearches() {
    console.log(`\n🔍 Search Queries — Last ${days} Days\n${"=".repeat(50)}`);
    const result = await getEvents("search_query", since);
    if (!result?.data?.length) {
        console.log("  No search data yet.");
        return;
    }

    const queryCounts = {};
    for (const e of result.data) {
        const q = e.properties?.query || "";
        if (q) queryCounts[q] = (queryCounts[q] || 0) + 1;
    }

    const sorted = Object.entries(queryCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
    for (const [q, c] of sorted) {
        console.log(`  ${pad(`"${q}"`, 35)} ${rpad(c, 6)}`);
    }
    console.log("");
}

async function cmdReferrers() {
    console.log(`\n🔗 Referrers — Last ${days} Days\n${"=".repeat(50)}`);
    const data = await getReferrers(dateStr(since), dateStr(now));
    if (!data) return;

    const refs = data.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
    for (const r of refs) {
        console.log(`  ${pad(r.dimensions?.refererHost || r.dimensions?.referrerHost || "(direct)", 35)} ${rpad(r.count.toLocaleString(), 8)}`);
    }
    console.log("");
}

async function cmdContentChanges() {
    console.log(`\n📝 Content Changes — Last ${days} Days\n${"=".repeat(50)}`);
    const result = await getContentChanges(since);
    if (!result?.data?.length) {
        console.log("  No content changes recorded yet.");
        console.log("  Run a deployment to start tracking changes.");
        return;
    }

    for (const change of result.data) {
        const date = new Date(change.created_at).toLocaleDateString();
        console.log(`\n  ${date} — ${change.page_path} [${change.field}]`);
        console.log(`    Old: ${change.old_value || "(none)"}`);
        console.log(`    New: ${change.new_value || "(none)"}`);
    }
    console.log("");
}

async function cmdAttribution() {
    console.log(`\n🔄 Demo Form Attribution — Last ${days} Days\n${"=".repeat(50)}`);
    const result = await getEvents("demo_form_submit", since);
    if (!result?.data?.length) {
        console.log("  No demo submissions in this period.");
        return;
    }

    console.log(`  Total submissions: ${result.data.length}\n`);

    // Landing page breakdown
    const landingPages = {};
    const referrers = {};
    const heardAbout = {};
    for (const e of result.data) {
        const lp = e.properties?.landing_page || "(unknown)";
        const ref = e.properties?.utm_source || e.referrer || "(direct)";
        const ha = e.properties?.heard_about || "(not specified)";
        landingPages[lp] = (landingPages[lp] || 0) + 1;
        referrers[ref] = (referrers[ref] || 0) + 1;
        heardAbout[ha] = (heardAbout[ha] || 0) + 1;
    }

    console.log("  TOP LANDING PAGES → DEMO");
    const sortedLP = Object.entries(landingPages).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [page, count] of sortedLP) {
        console.log(`    ${pad(page, 45)} ${count} (${pct(count, result.data.length)})`);
    }

    console.log("\n  TOP REFERRERS → DEMO");
    const sortedRef = Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [ref, count] of sortedRef) {
        console.log(`    ${pad(ref, 45)} ${count} (${pct(count, result.data.length)})`);
    }

    console.log("\n  HOW THEY HEARD ABOUT US");
    const sortedHA = Object.entries(heardAbout).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [source, count] of sortedHA) {
        console.log(`    ${pad(source, 45)} ${count} (${pct(count, result.data.length)})`);
    }

    // Journey paths
    const paths = result.data
        .map(e => e.properties?.pages_viewed)
        .filter(Boolean);
    if (paths.length > 0) {
        console.log("\n  COMMON PATHS TO DEMO");
        const pathCounts = {};
        for (const p of paths) {
            pathCounts[p] = (pathCounts[p] || 0) + 1;
        }
        const sortedPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        for (const [path, count] of sortedPaths) {
            console.log(`    ${pad(path, 50)} (${count}×)`);
        }
    }

    console.log("");
}

/* ------------------------------------------------------------------ */
/*  Google Search Console                                              */
/* ------------------------------------------------------------------ */

async function getGscClient() {
    if (!GSC_KEY_FILE || !GSC_SITE_URL) {
        console.log("⚠️  GSC_KEY_FILE and GSC_SITE_URL required for Search Console data.");
        return null;
    }

    const keyPath = resolve(root, GSC_KEY_FILE);
    let keyData;
    try {
        keyData = JSON.parse(readFileSync(keyPath, "utf-8"));
    } catch {
        console.log(`⚠️  Cannot read GSC key file at ${keyPath}`);
        return null;
    }

    const { google } = await import("googleapis");
    const auth = new google.auth.GoogleAuth({
        credentials: keyData,
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    return google.searchconsole({ version: "v1", auth });
}

async function gscQuery(dimensions, startDate, endDate, rowLimit = 25, filters = null) {
    const client = await getGscClient();
    if (!client) return null;

    const requestBody = {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        dataState: "all",
    };

    if (filters) {
        requestBody.dimensionFilterGroups = [{ filters }];
    }

    try {
        const res = await client.searchanalytics.query({
            siteUrl: GSC_SITE_URL,
            requestBody,
        });
        return res.data.rows || [];
    } catch (err) {
        console.error("GSC API error:", err.message);
        return null;
    }
}

async function cmdGscQueries() {
    console.log(`\n🔎 GSC Top Queries — Last ${days} Days\n${"=".repeat(65)}`);
    const rows = await gscQuery(["query"], dateStr(since), dateStr(now), 25);
    if (!rows) return;
    if (rows.length === 0) {
        console.log("  No search query data yet.");
        return;
    }

    console.log(`  ${pad("Query", 40)} ${rpad("Clicks", 7)} ${rpad("Impr", 7)} ${rpad("CTR", 7)} ${rpad("Pos", 5)}`);
    console.log(`  ${"-".repeat(40)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(5)}`);
    for (const row of rows) {
        const query = row.keys[0];
        console.log(
            `  ${pad(query.length > 40 ? query.slice(0, 37) + "..." : query, 40)} ` +
            `${rpad(row.clicks, 7)} ` +
            `${rpad(row.impressions, 7)} ` +
            `${rpad((row.ctr * 100).toFixed(1) + "%", 7)} ` +
            `${rpad(row.position.toFixed(1), 5)}`
        );
    }
    console.log("");
}

async function cmdGscPages() {
    console.log(`\n📄 GSC Top Pages — Last ${days} Days\n${"=".repeat(70)}`);
    const rows = await gscQuery(["page"], dateStr(since), dateStr(now), 25);
    if (!rows) return;
    if (rows.length === 0) {
        console.log("  No page data yet.");
        return;
    }

    console.log(`  ${pad("Page", 45)} ${rpad("Clicks", 7)} ${rpad("Impr", 7)} ${rpad("CTR", 7)} ${rpad("Pos", 5)}`);
    console.log(`  ${"-".repeat(45)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(5)}`);
    for (const row of rows) {
        const page = row.keys[0].replace(/^https?:\/\/(www\.)?shelf\.nu/, "") || "/";
        console.log(
            `  ${pad(page.length > 45 ? page.slice(0, 42) + "..." : page, 45)} ` +
            `${rpad(row.clicks, 7)} ` +
            `${rpad(row.impressions, 7)} ` +
            `${rpad((row.ctr * 100).toFixed(1) + "%", 7)} ` +
            `${rpad(row.position.toFixed(1), 5)}`
        );
    }
    console.log("");
}

async function cmdGscSummary() {
    console.log(`\n🌐 GSC Summary — Last ${days} Days\n${"=".repeat(65)}`);

    // Overall totals
    const rows = await gscQuery(["date"], dateStr(since), dateStr(now), 1000);
    if (!rows) return;

    let totalClicks = 0, totalImpressions = 0, totalCtr = 0, totalPos = 0;
    for (const row of rows) {
        totalClicks += row.clicks;
        totalImpressions += row.impressions;
    }
    if (rows.length > 0) {
        totalCtr = totalClicks / totalImpressions;
        totalPos = rows.reduce((sum, r) => sum + r.position, 0) / rows.length;
    }

    // Previous period for comparison
    const prevRows = await gscQuery(["date"], dateStr(prevSince), dateStr(since), 1000);
    let prevClicks = 0, prevImpressions = 0;
    if (prevRows) {
        for (const row of prevRows) {
            prevClicks += row.clicks;
            prevImpressions += row.impressions;
        }
    }

    console.log("\n  OVERVIEW");
    console.log(`  Clicks:       ${rpad(totalClicks.toLocaleString(), 10)}${delta(totalClicks, prevClicks)}`);
    console.log(`  Impressions:  ${rpad(totalImpressions.toLocaleString(), 10)}${delta(totalImpressions, prevImpressions)}`);
    console.log(`  Avg CTR:      ${(totalCtr * 100).toFixed(1)}%`);
    console.log(`  Avg Position: ${totalPos.toFixed(1)}`);

    // Top 10 queries
    const topQueries = await gscQuery(["query"], dateStr(since), dateStr(now), 10);
    if (topQueries?.length) {
        console.log("\n  TOP QUERIES");
        for (const row of topQueries) {
            console.log(
                `    ${pad(row.keys[0].length > 35 ? row.keys[0].slice(0, 32) + "..." : row.keys[0], 35)} ` +
                `${rpad(row.clicks, 5)} clicks  ${rpad(row.impressions, 6)} impr  pos ${row.position.toFixed(1)}`
            );
        }
    }

    // Top 10 pages
    const topPages = await gscQuery(["page"], dateStr(since), dateStr(now), 10);
    if (topPages?.length) {
        console.log("\n  TOP PAGES");
        for (const row of topPages) {
            const page = row.keys[0].replace(/^https?:\/\/(www\.)?shelf\.nu/, "") || "/";
            console.log(
                `    ${pad(page.length > 35 ? page.slice(0, 32) + "..." : page, 35)} ` +
                `${rpad(row.clicks, 5)} clicks  ${rpad(row.impressions, 6)} impr  pos ${row.position.toFixed(1)}`
            );
        }
    }

    // Quick wins: high impressions, low CTR, position 5-20
    const opportunities = await gscQuery(["query"], dateStr(since), dateStr(now), 100);
    if (opportunities?.length) {
        const quickWins = opportunities
            .filter(r => r.impressions >= 10 && r.ctr < 0.05 && r.position >= 5 && r.position <= 20)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 10);

        if (quickWins.length > 0) {
            console.log("\n  🎯 QUICK WINS (high impressions, low CTR, pos 5-20)");
            for (const row of quickWins) {
                console.log(
                    `    ${pad(row.keys[0].length > 35 ? row.keys[0].slice(0, 32) + "..." : row.keys[0], 35)} ` +
                    `pos ${rpad(row.position.toFixed(1), 5)}  ${rpad(row.impressions, 5)} impr  CTR ${(row.ctr * 100).toFixed(1)}%`
                );
            }
        }
    }

    console.log("");
}

/* ------------------------------------------------------------------ */
/*  SEO Experiments                                                    */
/* ------------------------------------------------------------------ */

const EXPERIMENTS_FILE = resolve(root, "data", "seo-experiments.json");

function loadExperiments() {
    try {
        return JSON.parse(readFileSync(EXPERIMENTS_FILE, "utf-8"));
    } catch {
        console.error("⚠️  Could not read data/seo-experiments.json");
        return { experiments: [] };
    }
}

function saveExperiments(data) {
    writeFileSync(EXPERIMENTS_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function gscPageMetrics(pagePath, startDate, endDate) {
    const pageUrl = pagePath.startsWith("http")
        ? pagePath
        : `https://www.shelf.nu${pagePath}`;

    const rows = await gscQuery(
        ["page"],
        startDate,
        endDate,
        1,
        [{ dimension: "page", operator: "equals", expression: pageUrl }],
    );

    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
    };
}

async function cmdExperiments() {
    const subcmd = args[1];

    if (subcmd === "capture-baseline") {
        const expId = args[2];
        if (!expId) {
            console.error("Usage: experiments capture-baseline <exp-id>");
            process.exit(1);
        }
        const data = loadExperiments();
        const exp = data.experiments.find(e => e.id === expId);
        if (!exp) {
            console.error(`Experiment "${expId}" not found.`);
            process.exit(1);
        }
        console.log(`\n📐 Capturing baseline for ${exp.id} (${exp.page})...`);
        const [start, end] = exp.baseline.dateRange;
        const metrics = await gscPageMetrics(exp.page, start, end);
        if (metrics) {
            exp.baseline.clicks = metrics.clicks;
            exp.baseline.impressions = metrics.impressions;
            exp.baseline.ctr = metrics.ctr;
            exp.baseline.position = metrics.position;
            exp.baseline.capturedAt = new Date().toISOString();
            saveExperiments(data);
            console.log(`  ✅ Baseline saved: ${metrics.clicks} clicks | ${metrics.impressions.toLocaleString()} impr | ${metrics.ctr}% CTR | pos ${metrics.position}`);
        } else {
            console.log("  ⚠️  No GSC data found for this page/date range.");
        }
        return;
    }

    if (subcmd === "deploy") {
        const expId = args[2];
        if (!expId) {
            console.error("Usage: experiments deploy <exp-id>");
            process.exit(1);
        }
        const data = loadExperiments();
        const exp = data.experiments.find(e => e.id === expId);
        if (!exp) {
            console.error(`Experiment "${expId}" not found.`);
            process.exit(1);
        }
        exp.status = "active";
        exp.deployedAt = dateStr(new Date());
        saveExperiments(data);
        console.log(`\n🚀 ${exp.id} marked as deployed (${exp.deployedAt}). Will evaluate after ${exp.evaluateAfterDays} days.`);
        return;
    }

    // Default: show all experiments
    const data = loadExperiments();
    const experiments = data.experiments;

    if (experiments.length === 0) {
        console.log("\n📋 No experiments found in data/seo-experiments.json");
        return;
    }

    console.log(`\n🧪 SEO Experiments\n${"=".repeat(70)}`);

    let updated = false;

    for (const exp of experiments) {
        const statusIcon = {
            planned: "📝",
            active: "🔬",
            evaluating: "📊",
            completed: "✅",
            abandoned: "❌",
        }[exp.status] || "❓";

        const daysSinceDeploy = exp.deployedAt
            ? Math.floor((Date.now() - new Date(exp.deployedAt).getTime()) / (1000 * 60 * 60 * 24))
            : null;

        console.log(`\n${statusIcon} [${exp.id.toUpperCase()}] ${exp.page}  [${exp.field}]  STATUS: ${exp.status}${daysSinceDeploy !== null ? ` (day ${daysSinceDeploy} of ${exp.evaluateAfterDays})` : ""}`);
        console.log(`  Hypothesis: ${exp.hypothesis}`);
        console.log(`  Before: "${exp.before}"`);
        console.log(`  After:  "${exp.after}"`);

        // Show baseline if captured
        if (exp.baseline.capturedAt) {
            const b = exp.baseline;
            console.log(`  BASELINE (${b.dateRange[0]} → ${b.dateRange[1]}):  ${b.clicks} clicks  |  ${b.impressions?.toLocaleString()} impr  |  ${b.ctr}% CTR  |  pos ${b.position}`);
        }

        // Auto-pull results for active experiments past their evaluation window
        if (exp.status === "active" && exp.deployedAt && daysSinceDeploy >= exp.evaluateAfterDays) {
            const resultStart = exp.deployedAt;
            const resultEnd = dateStr(new Date());
            console.log(`  ⏳ Auto-pulling results (${resultStart} → ${resultEnd})...`);

            const metrics = await gscPageMetrics(exp.page, resultStart, resultEnd);
            if (metrics) {
                exp.result.clicks = metrics.clicks;
                exp.result.impressions = metrics.impressions;
                exp.result.ctr = metrics.ctr;
                exp.result.position = metrics.position;
                exp.result.dateRange = [resultStart, resultEnd];
                exp.result.capturedAt = new Date().toISOString();
                exp.status = "evaluating";
                updated = true;
            }
        }

        // Show results comparison if available
        if (exp.result.capturedAt) {
            const r = exp.result;
            console.log(`  RESULT   (${r.dateRange[0]} → ${r.dateRange[1]}):  ${r.clicks} clicks  |  ${r.impressions?.toLocaleString()} impr  |  ${r.ctr}% CTR  |  pos ${r.position}`);

            if (exp.baseline.capturedAt) {
                const b = exp.baseline;
                const clicksDelta = b.clicks ? `${((r.clicks - b.clicks) / b.clicks * 100).toFixed(0)}%` : "n/a";
                const imprDelta = b.impressions ? `${((r.impressions - b.impressions) / b.impressions * 100).toFixed(0)}%` : "n/a";
                const ctrDelta = b.ctr ? `${((r.ctr - b.ctr) / b.ctr * 100).toFixed(0)}%` : "n/a";
                const posDelta = b.position ? (r.position - b.position).toFixed(1) : "n/a";
                console.log(`  CHANGE:  ${clicksDelta} clicks  |  ${imprDelta} impr  |  ${ctrDelta} CTR  |  ${posDelta > 0 ? "+" : ""}${posDelta} pos`);
            }
        } else if (exp.status === "active" && exp.deployedAt) {
            const evalDate = new Date(new Date(exp.deployedAt).getTime() + exp.evaluateAfterDays * 24 * 60 * 60 * 1000);
            console.log(`  RESULT:  pending — evaluates ${dateStr(evalDate)}`);
        }

        if (exp.learnings) {
            console.log(`  💡 Learnings: ${exp.learnings}`);
        }
    }

    if (updated) {
        saveExperiments(data);
        console.log("\n💾 Updated experiment results saved to data/seo-experiments.json");
    }

    // Summary stats
    const planned = experiments.filter(e => e.status === "planned").length;
    const active = experiments.filter(e => e.status === "active").length;
    const evaluating = experiments.filter(e => e.status === "evaluating").length;
    const completed = experiments.filter(e => e.status === "completed").length;
    console.log(`\n📈 Summary: ${planned} planned | ${active} active | ${evaluating} evaluating | ${completed} completed\n`);
}

/* ------------------------------------------------------------------ */
/*  Router                                                             */
/* ------------------------------------------------------------------ */

const COMMANDS = {
    summary: cmdSummary,
    traffic: cmdTraffic,
    "top-pages": cmdTopPages,
    conversions: cmdConversions,
    searches: cmdSearches,
    referrers: cmdReferrers,
    "content-changes": cmdContentChanges,
    attribution: cmdAttribution,
    "gsc-queries": cmdGscQueries,
    "gsc-pages": cmdGscPages,
    "gsc-summary": cmdGscSummary,
    experiments: cmdExperiments,
};

const fn = COMMANDS[command];
if (!fn) {
    console.error(`Unknown command: "${command}"`);
    console.error(`Available: ${Object.keys(COMMANDS).join(", ")}`);
    process.exit(1);
}

fn().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
