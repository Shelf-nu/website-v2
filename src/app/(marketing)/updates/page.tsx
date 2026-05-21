import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";
import { UpdatesFeed } from "@/components/updates/updates-feed";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { collectionPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Product Updates - Shelf Asset Management",
    description:
        "See what's new in Shelf. A timeline of every product improvement, new feature, and platform update since day one.",
    alternates: {
        canonical: "https://www.shelf.nu/updates",
    },
};

export default function UpdatesPage() {
    const allUpdates = getAllContent("updates");

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
