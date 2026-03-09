#!/usr/bin/env node

/**
 * Analytics CLI — query PostHog + Supabase content changelog + Google Search Console.
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
 *   POSTHOG_PERSONAL_API_KEY — PostHog personal API key (for querying)
 *   POSTHOG_PROJECT_ID       — PostHog project ID (default: 336438)
 *   SUPABASE_URL             — Supabase project URL (for content changelog only)
 *   SUPABASE_SERVICE_KEY     — Supabase service role key (for content changelog only)
 *   GSC_KEY_FILE             — Path to Google Search Console service account JSON key
 *   GSC_SITE_URL             — GSC property URL (e.g. sc-domain:shelf.nu)
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

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || "336438";
const POSTHOG_HOST = "https://us.posthog.com";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GSC_KEY_FILE = process.env.GSC_KEY_FILE;
const GSC_SITE_URL = process.env.GSC_SITE_URL;

const args = process.argv.slice(2);
const command = args[0] || "summary";
const daysIdx = args.indexOf("--days");
const days = daysIdx >= 0 ? parseInt(args[daysIdx + 1], 10) || 7 : 7;

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);

function dateStr(d) {
    return d.toISOString().split("T")[0];
}

/* ------------------------------------------------------------------ */
/*  PostHog HogQL API                                                  */
/* ------------------------------------------------------------------ */

async function phQuery(hogql) {
    if (!POSTHOG_API_KEY) {
        console.log("⚠️  POSTHOG_PERSONAL_API_KEY required for PostHog data.");
        return null;
    }

    const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${POSTHOG_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: { kind: "HogQLQuery", query: hogql },
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("PostHog API error:", res.status, text.slice(0, 500));
        return null;
    }

    const json = await res.json();
    return json.results || [];
}

async function getTraffic(sinceDate, untilDate) {
    const rows = await phQuery(`
        SELECT
            count() as pageviews,
            count(DISTINCT "$session_id") as sessions
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= '${sinceDate}'
          AND timestamp < '${untilDate}'
          AND properties.$host IN ('shelf.nu', 'www.shelf.nu')
    `);
    if (!rows || rows.length === 0) return { pageviews: 0, sessions: 0 };
    return { pageviews: rows[0][0] || 0, sessions: rows[0][1] || 0 };
}

async function getTopPages(sinceDate, untilDate, limit = 15) {
    const rows = await phQuery(`
        SELECT
            properties.$pathname as path,
            count() as views
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= '${sinceDate}'
          AND timestamp < '${untilDate}'
          AND properties.$host IN ('shelf.nu', 'www.shelf.nu')
        GROUP BY path
        ORDER BY views DESC
        LIMIT ${limit}
    `);
    return rows || [];
}

async function getReferrers(sinceDate, untilDate, limit = 10) {
    const rows = await phQuery(`
        SELECT
            if(properties.$referring_domain = '', '(direct)', properties.$referring_domain) as referrer,
            count() as views
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= '${sinceDate}'
          AND timestamp < '${untilDate}'
          AND properties.$host IN ('shelf.nu', 'www.shelf.nu')
        GROUP BY referrer
        ORDER BY views DESC
        LIMIT ${limit}
    `);
    return rows || [];
}

async function getEventCounts(sinceDate, untilDate) {
    const rows = await phQuery(`
        SELECT event, count() as cnt
        FROM events
        WHERE timestamp >= '${sinceDate}'
          AND timestamp < '${untilDate}'
          AND event NOT LIKE '$%'
        GROUP BY event
        ORDER BY cnt DESC
    `);
    if (!rows) return {};
    const counts = {};
    for (const [name, cnt] of rows) {
        counts[name] = cnt;
    }
    return counts;
}

async function getCustomEvents(eventName, sinceDate, untilDate) {
    const rows = await phQuery(`
        SELECT
            properties,
            timestamp
        FROM events
        WHERE event = '${eventName}'
          AND timestamp >= '${sinceDate}'
          AND timestamp < '${untilDate}'
        ORDER BY timestamp DESC
        LIMIT 1000
    `);
    return rows || [];
}

/* ------------------------------------------------------------------ */
/*  Supabase REST (content changelog only)                             */
/* ------------------------------------------------------------------ */

async function supabaseQuery(table, params = "") {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.log("⚠️  SUPABASE_URL and SUPABASE_SERVICE_KEY required for content data.");
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

    // Traffic from PostHog
    const traffic = await getTraffic(dateStr(since), dateStr(tomorrow));
    const prevTraffic = await getTraffic(dateStr(prevSince), dateStr(since));

    console.log("\nTRAFFIC");
    console.log(`  Page views:  ${rpad(traffic.pageviews.toLocaleString(), 10)}${delta(traffic.pageviews, prevTraffic.pageviews)}`);
    console.log(`  Sessions:    ${rpad(traffic.sessions.toLocaleString(), 10)}${delta(traffic.sessions, prevTraffic.sessions)}`);

    // Conversions from PostHog
    const counts = await getEventCounts(dateStr(since), dateStr(tomorrow));
    const prevCounts = await getEventCounts(dateStr(prevSince), dateStr(since));

    console.log("\nCONVERSIONS");
    const events = ["signup_click", "demo_form_submit", "pricing_cta"];
    for (const e of events) {
        const c = counts[e] || 0;
        const p = prevCounts[e] || 0;
        console.log(`  ${pad(e, 22)} ${rpad(c, 6)}${delta(c, p)}`);
    }

    // Top pages from PostHog
    const topPages = await getTopPages(dateStr(since), dateStr(tomorrow), 10);
    if (topPages.length > 0) {
        console.log("\nTOP PAGES BY VIEWS");
        for (const [path, views] of topPages) {
            console.log(`  ${pad(path || "/", 45)} ${rpad(views.toLocaleString(), 8)}`);
        }
    }

    // Search queries from PostHog
    const searches = await getCustomEvents("search_query", dateStr(since), dateStr(tomorrow));
    if (searches.length > 0) {
        const queryCounts = {};
        for (const [props] of searches) {
            const q = props?.query || "";
            if (q) queryCounts[q] = (queryCounts[q] || 0) + 1;
        }
        const sorted = Object.entries(queryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length > 0) {
            console.log("\nSEARCH QUERIES (content gap opportunities)");
            console.log("  " + sorted.map(([q, c]) => `"${q}" (${c}×)`).join(", "));
        }
    }

    // Scroll depth from PostHog
    const scrollRows = await phQuery(`
        SELECT
            properties.page_path as path,
            toInt(properties.depth) as depth,
            count() as cnt
        FROM events
        WHERE event = 'scroll_depth'
          AND timestamp >= '${dateStr(since)}'
          AND timestamp < '${dateStr(tomorrow)}'
        GROUP BY path, depth
        ORDER BY path, depth
    `);
    if (scrollRows && scrollRows.length > 0) {
        // Aggregate: for each path, count 100% scrolls vs total pageviews
        const pathComplete = {};
        for (const [path, depth, cnt] of scrollRows) {
            if (depth === 100) pathComplete[path] = (pathComplete[path] || 0) + cnt;
        }

        // Get pageview counts per path
        const pvRows = await phQuery(`
            SELECT properties.$pathname as path, count() as views
            FROM events
            WHERE event = '$pageview'
              AND timestamp >= '${dateStr(since)}'
              AND timestamp < '${dateStr(tomorrow)}'
              AND properties.$host IN ('shelf.nu', 'www.shelf.nu')
            GROUP BY path
        `);
        const pageViews = {};
        if (pvRows) {
            for (const [path, views] of pvRows) pageViews[path] = views;
        }

        const engagement = Object.entries(pathComplete)
            .map(([path, completes]) => ({
                path,
                completionRate: pageViews[path] ? completes / pageViews[path] : 0,
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
    const traffic = await getTraffic(dateStr(since), dateStr(tomorrow));
    const prev = await getTraffic(dateStr(prevSince), dateStr(since));

    console.log(`  Page views:  ${traffic.pageviews.toLocaleString()}${delta(traffic.pageviews, prev.pageviews)}`);
    console.log(`  Sessions:    ${traffic.sessions.toLocaleString()}${delta(traffic.sessions, prev.sessions)}`);
    console.log("");
}

async function cmdTopPages() {
    console.log(`\n📄 Top Pages — Last ${days} Days\n${"=".repeat(50)}`);
    const pages = await getTopPages(dateStr(since), dateStr(tomorrow));
    for (const [path, views] of pages) {
        console.log(`  ${pad(path || "/", 50)} ${rpad(views.toLocaleString(), 8)}`);
    }
    console.log("");
}

async function cmdConversions() {
    console.log(`\n🎯 Conversions — Last ${days} Days\n${"=".repeat(40)}`);
    const counts = await getEventCounts(dateStr(since), dateStr(tomorrow));
    const prevCounts = await getEventCounts(dateStr(prevSince), dateStr(since));

    const events = ["signup_click", "demo_form_submit", "pricing_cta", "search_query", "404_hit", "scroll_depth", "chat_opened"];
    for (const e of events) {
        const c = counts[e] || 0;
        const p = prevCounts[e] || 0;
        console.log(`  ${pad(e, 22)} ${rpad(c, 6)}${delta(c, p)}`);
    }
    console.log("");
}

async function cmdSearches() {
    console.log(`\n🔍 Search Queries — Last ${days} Days\n${"=".repeat(50)}`);
    const rows = await getCustomEvents("search_query", dateStr(since), dateStr(tomorrow));
    if (rows.length === 0) {
        console.log("  No search data yet.");
        return;
    }

    const queryCounts = {};
    for (const [props] of rows) {
        const q = props?.query || "";
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
    const refs = await getReferrers(dateStr(since), dateStr(tomorrow));
    for (const [referrer, views] of refs) {
        console.log(`  ${pad(referrer, 35)} ${rpad(views.toLocaleString(), 8)}`);
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
    const rows = await getCustomEvents("demo_form_submit", dateStr(since), dateStr(tomorrow));
    if (rows.length === 0) {
        console.log("  No demo submissions in this period.");
        return;
    }

    console.log(`  Total submissions: ${rows.length}\n`);

    const landingPages = {};
    const referrers = {};
    const heardAbout = {};
    for (const [props] of rows) {
        const lp = props?.landing_page || "(unknown)";
        const ref = props?.utm_source || props?.referrer || "(direct)";
        const ha = props?.heard_about || "(not specified)";
        landingPages[lp] = (landingPages[lp] || 0) + 1;
        referrers[ref] = (referrers[ref] || 0) + 1;
        heardAbout[ha] = (heardAbout[ha] || 0) + 1;
    }

    console.log("  TOP LANDING PAGES → DEMO");
    const sortedLP = Object.entries(landingPages).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [page, count] of sortedLP) {
        console.log(`    ${pad(page, 45)} ${count} (${pct(count, rows.length)})`);
    }

    console.log("\n  TOP REFERRERS → DEMO");
    const sortedRef = Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [ref, count] of sortedRef) {
        console.log(`    ${pad(ref, 45)} ${count} (${pct(count, rows.length)})`);
    }

    console.log("\n  HOW THEY HEARD ABOUT US");
    const sortedHA = Object.entries(heardAbout).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [source, count] of sortedHA) {
        console.log(`    ${pad(source, 45)} ${count} (${pct(count, rows.length)})`);
    }

    // Journey paths
    const paths = rows
        .map(([props]) => props?.pages_viewed)
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
    const rows = await gscQuery(["query"], dateStr(since), dateStr(tomorrow), 25);
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
    const rows = await gscQuery(["page"], dateStr(since), dateStr(tomorrow), 25);
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
    const rows = await gscQuery(["date"], dateStr(since), dateStr(tomorrow), 1000);
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
    const topQueries = await gscQuery(["query"], dateStr(since), dateStr(tomorrow), 10);
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
    const topPages = await gscQuery(["page"], dateStr(since), dateStr(tomorrow), 10);
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
    const opportunities = await gscQuery(["query"], dateStr(since), dateStr(tomorrow), 100);
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
