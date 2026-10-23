import { getAllContentMeta } from "@/lib/mdx";
import { Metadata } from "next";
import { UpdatesFeed } from "@/components/updates/updates-feed";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { collectionPageJsonLd } from "@/lib/seo";
import { FEED_TITLE, JSON_FEED_URL, RSS_FEED_URL } from "@/lib/updates-feed";

export const metadata: Metadata = {
    title: "Product Updates",
    description:
        "See what's new in Shelf. A timeline of every product improvement, new feature, and platform update since day one.",
    alternates: {
        canonical: "https://www.shelf.nu/updates",
        types: {
            "application/rss+xml": [{ url: RSS_FEED_URL, title: FEED_TITLE }],
            "application/feed+json": [{ url: JSON_FEED_URL, title: FEED_TITLE }],
        },
    },
};

/** /updates: the timeline of every entry, advertising the JSON and RSS feeds. */
export default function UpdatesPage() {
    const allUpdates = getAllContentMeta("updates");

    const collectionSchema = collectionPageJsonLd({
        name: "Shelf Product Updates",
        description:
            "See what's new in Shelf. A timeline of every product improvement, new feature, and platform update since day one.",
        url: "/updates",
        items: allUpdates.slice(0, 30).map((u) => ({
            name: u.frontmatter.title,
            url: `/updates/${u.slug}`,
            description: u.frontmatter.description,
        })),
    });

    return (
        <PagefindWrapper type="Page" title="Product Updates — Shelf" keywords="updates changelog new features product improvements">
            <StructuredData data={collectionSchema} />
            <UpdatesFeed updates={allUpdates} />
        </PagefindWrapper>
    );
}
