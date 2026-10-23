/**
 * /updates/rss.xml — RSS 2.0 of every product update, for feed readers.
 * Built from the same items as /updates/feed.json; see src/lib/updates-feed.ts.
 */
import {
    FEED_DESCRIPTION,
    FEED_TITLE,
    RSS_FEED_URL,
    UPDATES_URL,
    getFeedItems,
} from "@/lib/updates-feed";
import { BASE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

/** Escapes text for use in XML element content and attribute values. */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** CDATA cannot contain "]]>", so split it across two sections. */
function cdata(text: string): string {
    return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** Writes out/updates/rss.xml at build time (force-static). */
export function GET() {
    const items = getFeedItems();

    const body = items
        .map((item) => {
            const image = item.image
                ? `<p><img src="${escapeXml(item.image)}" alt="" /></p>`
                : "";
            const readMore = item.readMoreUrl
                ? `<p><a href="${escapeXml(item.readMoreUrl)}">Read more</a></p>`
                : "";
            return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.id)}</guid>
      <pubDate>${new Date(item.datePublished).toUTCString()}</pubDate>
      <description>${escapeXml(item.summary)}</description>
      <content:encoded>${cdata(image + item.html + readMore)}</content:encoded>
    </item>`;
        })
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${UPDATES_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${RSS_FEED_URL}" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/rss-icon.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${UPDATES_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
${items[0] ? `    <lastBuildDate>${new Date(items[0].datePublished).toUTCString()}</lastBuildDate>\n` : ""}${body}
  </channel>
</rss>
`;

    return new Response(xml, {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
}
