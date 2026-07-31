#!/usr/bin/env node

/**
 * verify-content-render.mjs
 * -------------------------
 * Post-build assertion: ensures no raw markdown leaked into rendered pages.
 *
 * Why this exists:
 *  In July 2026 a reader found `![Implementation And Best Practices...](https://...`
 *  printed as literal body text on a blog post, with a truncated link that 404'd.
 *  The cause: image URLs containing literal spaces are not valid markdown link
 *  destinations, so the parser gives up and emits the whole `![alt](url)` as text.
 *  It had been live on 20 pages. `npm run build` passed the entire time — nothing
 *  in the pipeline looks at what the pages actually say.
 *
 *  Source-level regex is NOT a substitute for this check. Scanning content/*.mdx
 *  produces false positives on URLs with balanced parentheses — e.g.
 *  `HAARP-FN(22)O-A-B-C.jpg` and a mailto containing "(VPAT, Section 508, WCAG 2.1)"
 *  both look broken to a regex but render perfectly, because CommonMark handles
 *  balanced parens. Only the built HTML tells the truth.
 *
 * Checks (over every page in the build output):
 *  1. Raw image markdown   — `![alt]` surviving into visible text
 *  2. Raw link markdown    — `](https://…` / `](/…` / `](mailto:…` in visible text
 *  3. Bare storage URLs    — a supabase asset URL rendered as text, not an attribute
 *  4. Stray emphasis       — `**bold **`, where a space before the closing
 *                            delimiter disables it and prints literal asterisks
 *  5. Unrendered JSX       — an MDX component name that never got mapped
 *  6. Unrendered tables    — a `| a | b |` row that stayed markdown
 *
 * `<script>`, `<style>`, `<head>`, `<pre>` and `<code>` are stripped before
 * scanning: the RSC payload legitimately contains raw content, and code blocks
 * legitimately contain markdown-looking text (`**kwargs`, ``![alt](url)`` in docs).
 *
 * With --images, additionally HTTP-checks every <img src> the site ships,
 * including frontmatter `image:` fields that feed OG/social previews. Three
 * such images were dead and nobody noticed. Network errors warn; only a
 * definitive 4xx/5xx after retries fails the build.
 *
 * Exit code 1 on failure → breaks `npm run build` in CI.
 *
 * Usage:
 *   node scripts/verify-content-render.mjs [output-dir] [--images]
 *   Defaults to out/ if no directory is given.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const args = process.argv.slice(2);
const CHECK_IMAGES = args.includes("--images");
const outputDir = args.find((a) => !a.startsWith("--")) || "out";
const ROOT = resolve(process.cwd(), outputDir);

const MIN_PAGES_SCANNED = 150; // guards against silently scanning an empty dir

if (!existsSync(ROOT)) {
    console.error(
        `\n❌  Content render verification FAILED\n` +
        `   Build output not found at: ${ROOT}\n` +
        `   Run \`next build\` first, or pass the correct output directory.\n`,
    );
    process.exit(1);
}

/* ── Collect pages ─────────────────────────────────────────── */

function collectHtml(dir) {
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            // pagefind ships its own fixture HTML; _next is compiled assets
            if (entry.name === "pagefind" || entry.name === "_next") continue;
            found.push(...collectHtml(full));
        } else if (entry.name.endsWith(".html")) {
            found.push(full);
        }
    }
    return found;
}

const pages = collectHtml(ROOT);

if (pages.length < MIN_PAGES_SCANNED) {
    console.error(
        `\n❌  Content render verification FAILED\n` +
        `   Only ${pages.length} HTML pages found in ${ROOT} (minimum ${MIN_PAGES_SCANNED}).\n` +
        `   The build output looks incomplete — refusing to report a clean scan.\n`,
    );
    process.exit(1);
}

/* ── Extract visible text ──────────────────────────────────── */

function visibleText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<head[\s\S]*?<\/head>/gi, " ")
        .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
        .replace(/<code[\s\S]*?<\/code>/gi, " ")
        // Preserve block boundaries as newlines. Without this every page
        // collapses onto a single line and the line-anchored checks (e.g.
        // unrendered table rows) can never match.
        .replace(/<(?:br|hr)\s*\/?>/gi, "\n")
        .replace(/<\/(?:p|div|li|ul|ol|h[1-6]|td|tr|table|blockquote|section|article|figure|figcaption)>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
}

const CHECKS = [
    {
        id: "raw-image-markdown",
        re: /!\[[^\]]{0,120}\]/g,
        hint: "An image URL is probably unencoded. Spaces must be %20 — see content/blog/*.mdx.",
    },
    {
        id: "raw-link-markdown",
        re: /\]\((?:https?:|\/|mailto:)[^)\s]{0,120}/g,
        hint: "A link destination is malformed, so the whole [text](url) printed as text.",
    },
    {
        id: "bare-storage-url",
        re: /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/\S{0,120}/g,
        hint: "A storage URL rendered as body text instead of a src/href attribute.",
    },
    {
        id: "stray-emphasis",
        re: /\*\*[^*\n]{0,80}\*\*/g,
        hint: 'Likely "**bold **" — a space before the closing ** disables it. Write "**bold** ".',
    },
    {
        id: "unrendered-jsx",
        re: /<(?:Callout|StatBlock|PullQuote|SummaryBox|ComparisonTable|RolePicker|InlineVideo|TrackingMethodQuiz|TrackingDecisionChart)\b/g,
        hint: "An MDX component is not registered in src/components/mdx-content.tsx.",
    },
    {
        id: "unrendered-table-row",
        re: /^[ \t]*\|[^\n|]+\|[^\n]*\|[ \t]*$/gm,
        hint: "A markdown table did not render — check for a malformed header separator.",
    },
];

/* ── Scan ──────────────────────────────────────────────────── */

const failures = [];
const imgSrcs = new Set();

for (const file of pages) {
    const html = readFileSync(file, "utf-8");

    for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) imgSrcs.add(m[1]);

    const text = visibleText(html);
    const page = relative(ROOT, file);

    for (const check of CHECKS) {
        for (const match of text.matchAll(check.re)) {
            failures.push({
                page,
                id: check.id,
                hint: check.hint,
                sample: match[0].replace(/\s+/g, " ").slice(0, 90),
            });
        }
    }
}

console.log(`   Content render: scanned ${pages.length} pages, ${imgSrcs.size} unique <img> sources`);

if (failures.length) {
    const byCheck = new Map();
    for (const f of failures) {
        if (!byCheck.has(f.id)) byCheck.set(f.id, []);
        byCheck.get(f.id).push(f);
    }

    console.error(`\n❌  Content render verification FAILED`);
    console.error(`   ${failures.length} leak(s) of raw markup into rendered pages.\n`);

    for (const [id, items] of byCheck) {
        const pagesAffected = new Set(items.map((i) => i.page));
        console.error(`   ${id} — ${items.length} occurrence(s) across ${pagesAffected.size} page(s)`);
        console.error(`     ${items[0].hint}`);
        for (const item of items.slice(0, 10)) {
            console.error(`       ${item.page}  ::  ${item.sample}`);
        }
        if (items.length > 10) console.error(`       …and ${items.length - 10} more`);
        console.error("");
    }

    console.error(
        `   These strings are visible to readers and to Google. Fix the source in\n` +
        `   content/ and rebuild. Do not silence this check by editing the regexes\n` +
        `   unless you have confirmed in a browser that the page renders correctly.\n`,
    );
    process.exit(1);
}

/* ── Optional: image reachability ──────────────────────────── */

if (CHECK_IMAGES) {
    const remote = [...imgSrcs].filter((s) => /^https?:\/\//.test(s));
    const local = [...imgSrcs].filter((s) => s.startsWith("/"));

    const missingLocal = local.filter((u) => {
        const p = join(ROOT, decodeURIComponent(u.split("?")[0]));
        return !existsSync(p) || !statSync(p).isFile();
    });

    async function probe(url, attempt = 0) {
        try {
            const res = await fetch(encodeURI(decodeURI(url)), {
                method: "GET",
                headers: { Range: "bytes=0-0" },
                signal: AbortSignal.timeout(15000),
            });
            if (res.status >= 400 && attempt < 2) return probe(url, attempt + 1);
            return { url, status: res.status };
        } catch (err) {
            if (attempt < 2) return probe(url, attempt + 1);
            return { url, status: "NETWORK", detail: err.message };
        }
    }

    const queue = [...remote];
    const results = [];
    await Promise.all(
        Array.from({ length: 12 }, async () => {
            while (queue.length) results.push(await probe(queue.shift()));
        }),
    );

    const dead = results.filter((r) => typeof r.status === "number" && r.status >= 400);
    const unreachable = results.filter((r) => r.status === "NETWORK");

    console.log(`   Content render: checked ${remote.length} remote + ${local.length} local images`);

    if (unreachable.length) {
        console.warn(
            `\n⚠️   ${unreachable.length} image(s) could not be reached (network, not a 404) — not failing the build:`,
        );
        for (const u of unreachable.slice(0, 5)) console.warn(`     ${u.url}`);
    }

    if (dead.length || missingLocal.length) {
        console.error(`\n❌  Content render verification FAILED`);
        if (dead.length) {
            console.error(`   ${dead.length} remote image(s) returning an error status:`);
            for (const d of dead) console.error(`     [${d.status}] ${d.url}`);
        }
        if (missingLocal.length) {
            console.error(`   ${missingLocal.length} local image(s) missing from the build output:`);
            for (const u of missingLocal) console.error(`     ${u}`);
        }
        console.error(
            `\n   Broken images appear as empty boxes to readers. Frontmatter \`image:\`\n` +
            `   fields also feed OG/social previews, so a dead one breaks link cards.\n`,
        );
        process.exit(1);
    }
}

/* ── Done ──────────────────────────────────────────────────── */

console.log(
    `\n✅  Content render verification passed ` +
    `(${pages.length} pages clean${CHECK_IMAGES ? `, ${imgSrcs.size} images reachable` : ""})\n`,
);
