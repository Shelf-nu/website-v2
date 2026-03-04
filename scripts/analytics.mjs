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
 * Env vars required:
 *   CF_API_TOKEN       — Cloudflare API token with Analytics:Read scope
 *   CF_SITE_TAG        — Cloudflare Web Analytics site tag
 *   SUPABASE_URL       — Supabase project URL
 *   SUPABASE_SERVICE_KEY — Supabase service role key
 */

import "dotenv/config";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_SITE_TAG = process.env.CF_SITE_TAG;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

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
        query ($siteTag: string!, $since: string!, $until: string!) {
            viewer {
                accounts(filter: {}) {
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
    return cfQuery(query, { siteTag: CF_SITE_TAG, since: startDate, until: endDate });
}

async function getTopPages(startDate, endDate, limit = 15) {
    const query = `
        query ($siteTag: string!, $since: string!, $until: string!) {
            viewer {
                accounts(filter: {}) {
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
                        dimensions { path }
                    }
                }
            }
        }
    `;
    return cfQuery(query, { siteTag: CF_SITE_TAG, since: startDate, until: endDate });
}

async function getReferrers(startDate, endDate, limit = 10) {
    const query = `
        query ($siteTag: string!, $since: string!, $until: string!) {
            viewer {
                accounts(filter: {}) {
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
    return cfQuery(query, { siteTag: CF_SITE_TAG, since: startDate, until: endDate });
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
                console.log(`  ${pad(p.dimensions?.path || "(unknown)", 45)} ${rpad(p.count.toLocaleString(), 8)}`);
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
        console.log(`  ${pad(p.dimensions?.path || "(unknown)", 50)} ${rpad(p.count.toLocaleString(), 8)}`);
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
        console.log(`  ${pad(r.dimensions?.refererHost || "(direct)", 35)} ${rpad(r.count.toLocaleString(), 8)}`);
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
