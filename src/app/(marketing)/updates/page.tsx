import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";
import { UpdatesFeed } from "@/components/updates/updates-feed";

export const metadata: Metadata = {
    title: "Product Updates - Shelf Asset Management",
    description:
        "See what's new in Shelf. A timeline of every product improvement, new feature, and platform update since day one.",
    alternates: {
        canonical: "https://shelf.nu/updates",
    },
};

export default function UpdatesPage() {
    const allUpdates = getAllContent("updates");

    return <UpdatesFeed updates={allUpdates} />;
}
