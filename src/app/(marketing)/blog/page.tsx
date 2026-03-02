import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";
import { BlogFeed } from "@/components/blog/blog-feed";

export const metadata: Metadata = {
    title: "Blog - Shelf Asset Management",
    description: "Insights, guides, and product updates from the Shelf team.",
};

export default function BlogIndexPage() {
    const allPosts = getAllContent("blog");

    return (
        <div className="flex min-h-screen flex-col relative">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <BlogFeed allPosts={allPosts} />
        </div>
    );
}
