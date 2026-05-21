import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";
import { BlogFeed } from "@/components/blog/blog-feed";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { collectionPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Blog - Shelf Asset Management",
    description: "Insights, guides, and product updates from the Shelf team.",
    alternates: { canonical: "https://www.shelf.nu/blog" },
};

export default function BlogIndexPage() {
    const allPosts = getAllContent("blog");

    const collectionSchema = collectionPageJsonLd({
        name: "Shelf Blog",
        description: "Insights, guides, and product updates from the Shelf team.",
        url: "/blog",
        items: allPosts.slice(0, 30).map((post) => ({
            name: post.frontmatter.title,
            url: `/blog/${post.slug}`,
            description: post.frontmatter.description,
        })),
    });

    return (
        <PagefindWrapper type="Page" title="Blog — Shelf Asset Management" keywords="blog articles guides insights updates">
            <StructuredData data={collectionSchema} />
            <div className="flex min-h-screen flex-col relative">
                {/* Ambient Background */}
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                <BlogFeed allPosts={allPosts} />
            </div>
        </PagefindWrapper>
    );
}
