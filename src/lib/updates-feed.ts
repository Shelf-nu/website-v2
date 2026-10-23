/**
 * Product updates as machine-readable feeds, generated from content/updates at
 * build time so they can never disagree with the /updates page:
 *
 *   - /updates/feed.json → JSON Feed 1.1 (https://jsonfeed.org/version/1.1).
 *     The Shelf app reads this for its in-app Updates panel. Each item carries
 *     a `_shelf` extension object: `inApp` (show it in the app), `appRoles`
 *     (workspace roles that see it; empty = everyone) and `markdown` (the body
 *     as written, which the app renders).
 *   - /updates/rss.xml → RSS 2.0 for feed readers.
 *
 * Both carry the newest FEED_LIMIT entries; the full history stays on /updates.
 * Item ids are the entry's page URL, which never changes once published, so a
 * consumer can use the id to remember what it has already shown.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { getAllContent } from "@/lib/mdx";
import { BASE_URL } from "@/lib/site-url";

export const FEED_TITLE = "Shelf Product Updates";
export const FEED_DESCRIPTION =
    "New features, improvements and platform updates in Shelf.";
export const UPDATES_URL = `${BASE_URL}/updates`;
export const JSON_FEED_URL = `${UPDATES_URL}/feed.json`;
export const RSS_FEED_URL = `${UPDATES_URL}/rss.xml`;
/** All 210 entries made feed.json 680 KB; readers and the app only need recent ones. */
export const FEED_LIMIT = 50;

export interface FeedItem {
    id: string;
    url: string;
    title: string;
    summary: string;
    /** Entry body as written: Markdown, which the app already renders. */
    markdown: string;
    html: string;
    image?: string;
    readMoreUrl?: string;
    /** ISO 8601, midnight UTC of the entry's date. */
    datePublished: string;
    inApp: boolean;
    appRoles: string[];
}

/** Root-relative links and images in frontmatter become absolute URLs. */
function absolute(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//.test(url)) return url;
    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Entry bodies link with root-relative paths ("/knowledge-base/..."), which a
 * feed reader or the app would resolve against the wrong host.
 */
function absoluteLinks(markdown: string): string {
    return markdown
        .replace(/\]\(\//g, `](${BASE_URL}/`) // [text](/path)
        .replace(/^(\s*\[[^\]]+\]:\s*)\//gm, `$1${BASE_URL}/`); // [ref]: /path
}

const markdownToHtml = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify);

export function getFeedItems(): FeedItem[] {
    return getAllContent("updates").slice(0, FEED_LIMIT).map(({ slug, frontmatter, content }) => {
        // A bad date would publish "Invalid Date" into every subscriber's reader.
        // Date also rolls impossible days over ("2025-02-29" → March 1), so the
        // parsed date must round-trip to the same string.
        const published = new Date(`${frontmatter.date}T00:00:00Z`);
        if (
            Number.isNaN(published.getTime()) ||
            published.toISOString().slice(0, 10) !== frontmatter.date
        ) {
            throw new Error(
                `updates feed: content/updates/${slug}.mdx has no valid "date" (got "${frontmatter.date}").`
            );
        }
        const url = `${UPDATES_URL}/${slug}`;
        const markdown = absoluteLinks(content.trim());
        return {
            id: url,
            url,
            title: frontmatter.title,
            summary: frontmatter.description,
            markdown,
            html: String(markdownToHtml.processSync(markdown)),
            image: absolute(frontmatter.image),
            readMoreUrl: absolute(frontmatter.readMoreUrl),
            datePublished: published.toISOString(),
            inApp: frontmatter.inApp === true,
            appRoles: frontmatter.appRoles ?? [],
        };
    });
}
