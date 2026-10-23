/**
 * indexnow.mjs
 * ------------
 * Works out which www.shelf.nu URLs a push changed and sends them to IndexNow
 * (Bing, Copilot, Yandex, Seznam, Naver), used by scripts/indexnow.mjs after
 * every production deploy.
 *
 * Kept as its own module so the file-to-URL mapping can be unit-tested
 * (scripts/lib/indexnow.test.mjs).
 *
 * Mapping (git paths → URLs):
 *  - content/<section>/<slug>.mdx → /<section>/<slug>, plus the /<section>
 *    index, which lists the item.
 *  - content/pages/<slug>.mdx     → /<slug> (terms, privacy, security).
 *  - content/updates/*            → /updates only; single updates are noindexed.
 *  - src/app/(marketing)/<route>/ → /<route>, for any file in a static route
 *    folder. Dynamic folders ([slug]) are skipped: they render every page of a
 *    section and are covered by the content mapping.
 *
 * Shared components and data files (src/components, src/data) are not mapped:
 * a header tweak touches every page, and IndexNow asks for changed URLs, not
 * the whole site. Search engines still recrawl those on their own schedule.
 *
 * A URL is sent only when the new sitemap lists it, so noindexed and
 * redirect-only pages never go out. A deleted content file is the exception:
 * its old URL is sent so engines recrawl it, see the redirect or the 404, and
 * drop it sooner.
 *
 * Why: Bing Webmaster Tools' top recommendation for shelf.nu (2026-10-23).
 * Without it Bing finds edits on its own schedule, which can take days, and
 * Copilot cites what Bing has indexed.
 */

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
// The key is public by design: IndexNow checks ownership by fetching
// https://<host>/<key>.txt, which must contain the key (public/<key>.txt).
export const INDEXNOW_KEY = "32134b8bb8bf124426786bce8f403a4b";
export const MAX_URLS_PER_REQUEST = 10000;
// A stalled endpoint must not hold the deploy job open; the catch below
// records the timeout like any other failure.
export const REQUEST_TIMEOUT_MS = 30000;

const CONTENT_SECTIONS = new Set([
    "alternatives",
    "blog",
    "case-studies",
    "features",
    "glossary",
    "industries",
    "knowledge-base",
    "solutions",
]);

/**
 * Every <loc> in a sitemap.xml.
 *
 * @param {string} xml
 * @returns {string[]}
 */
export function parseSitemapUrls(xml) {
    return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/**
 * The site paths one changed file affects. Paths have no origin and no
 * trailing slash; the home page is "".
 *
 * @param {string} file - repo-relative path, as git prints it
 * @returns {string[]}
 */
export function pathsForFile(file) {
    const content = file.match(/^content\/([^/]+)\/([^/]+)\.mdx?$/);
    if (content) {
        const [, section, slug] = content;
        if (section === "pages") return [`/${slug}`];
        if (section === "updates") return ["/updates"];
        if (CONTENT_SECTIONS.has(section)) return [`/${section}/${slug}`, `/${section}`];
        return [];
    }

    const route = file.match(/^src\/app\/\(marketing\)\/(.*\/)?[^/]+$/);
    if (route) {
        const dir = (route[1] ?? "").replace(/\/$/, "");
        const segments = dir ? dir.split("/") : [];
        if (segments.some((s) => s.startsWith("["))) return [];
        const visible = segments.filter((s) => !(s.startsWith("(") && s.endsWith(")")));
        return [visible.length ? `/${visible.join("/")}` : ""];
    }

    return [];
}

/**
 * Parses `git diff --name-status -M` output.
 *
 * @param {string} output
 * @returns {{ status: string, path: string, oldPath?: string }[]}
 */
export function parseNameStatus(output) {
    return output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
            const [status, a, b] = line.split("\t");
            // Renames and copies (R100, C075) list the old path, then the new one.
            if (b !== undefined) return { status: status[0], path: b, oldPath: a };
            return { status: status[0], path: a };
        });
}

/**
 * The full URLs to submit for a set of changed files.
 *
 * @param {{ status: string, path: string, oldPath?: string }[]} changes
 * @param {string[]} sitemapUrls - every URL in the new sitemap
 * @param {string} origin - e.g. "https://www.shelf.nu"
 * @returns {string[]} unique, sorted
 */
export function urlsForChanges(changes, sitemapUrls, origin) {
    const listed = new Set(sitemapUrls);
    const out = new Set();

    for (const change of changes) {
        // A renamed page has a new URL to announce and an old one to retire.
        const gone = change.status === "D" ? change.path : change.status === "R" ? change.oldPath : null;
        if (gone) {
            const [own, ...rest] = pathsForFile(gone);
            // The page itself is no longer listed, so send it regardless; only
            // a content file or a route's page.tsx is a page of its own.
            if (own !== undefined && /\.mdx?$|\/page\.tsx$/.test(gone)) out.add(`${origin}${own}`);
            for (const p of rest) if (listed.has(`${origin}${p}`)) out.add(`${origin}${p}`);
        }
        if (change.status === "D") continue;
        for (const p of pathsForFile(change.path)) {
            const url = `${origin}${p}`;
            if (listed.has(url)) out.add(url);
        }
    }

    return [...out].sort();
}

/**
 * Sends URLs to IndexNow in batches. Never throws: a failed ping must not fail
 * a deploy that already went out.
 *
 * @param {string[]} urls
 * @param {{ origin: string, fetch?: typeof fetch, log?: (msg: string) => void }} opts
 * @returns {Promise<{ sent: number, failed: number }>}
 */
export async function submitToIndexNow(urls, { origin, fetch: doFetch = fetch, log = console.log }) {
    const host = new URL(origin).host;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
        const batch = urls.slice(i, i + MAX_URLS_PER_REQUEST);
        try {
            const res = await doFetch(INDEXNOW_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({
                    host,
                    key: INDEXNOW_KEY,
                    keyLocation: `${origin}/${INDEXNOW_KEY}.txt`,
                    urlList: batch,
                }),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
            // 200 = accepted, 202 = accepted while the key is still being checked.
            if (res.status === 200 || res.status === 202) {
                sent += batch.length;
                log(`IndexNow accepted ${batch.length} URL(s) (HTTP ${res.status})`);
            } else {
                failed += batch.length;
                log(`IndexNow refused ${batch.length} URL(s): HTTP ${res.status} ${await res.text().catch(() => "")}`);
            }
        } catch (err) {
            failed += batch.length;
            log(`IndexNow request failed: ${err.message}`);
        }
    }

    return { sent, failed };
}
