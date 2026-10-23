/**
 * /updates/feed.json — JSON Feed 1.1 of every product update. The Shelf app
 * reads it for the in-app Updates panel; see src/lib/updates-feed.ts.
 */
import {
    FEED_DESCRIPTION,
    FEED_TITLE,
    JSON_FEED_URL,
    UPDATES_URL,
    getFeedItems,
} from "@/lib/updates-feed";
import { BASE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export function GET() {
    const feed = {
        version: "https://jsonfeed.org/version/1.1",
        title: FEED_TITLE,
        description: FEED_DESCRIPTION,
        home_page_url: UPDATES_URL,
        feed_url: JSON_FEED_URL,
        icon: `${BASE_URL}/apple-icon.png`,
        favicon: `${BASE_URL}/icon.png`,
        language: "en",
        items: getFeedItems().map((item) => ({
            id: item.id,
            url: item.url,
            ...(item.readMoreUrl && { external_url: item.readMoreUrl }),
            title: item.title,
            summary: item.summary,
            content_html: item.html,
            ...(item.image && { image: item.image }),
            date_published: item.datePublished,
            // JSON Feed's content_text means plain text, so the Markdown the
            // app renders travels in the extension object instead.
            _shelf: {
                inApp: item.inApp,
                appRoles: item.appRoles,
                markdown: item.markdown,
            },
        })),
    };

    return new Response(JSON.stringify(feed, null, 2), {
        headers: { "Content-Type": "application/feed+json; charset=utf-8" },
    });
}
