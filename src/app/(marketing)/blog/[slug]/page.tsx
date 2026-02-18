import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs, getAllContent } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd, blogPostingJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("blog");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("blog", slug);
        return buildContentMetadata(slug, frontmatter, "blog");
    } catch {
        return { title: "Blog Not Found" };
    }
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("blog", slug);
        const Layout = resolveLayout(frontmatter.layout);

        // Fetch related posts (3 items as requested)
        const allPosts = getAllContent("blog");
        const relatedPosts = allPosts
            .filter(post => post.slug !== slug)
            .sort(() => 0.5 - Math.random()) // Simple shuffle
            .slice(0, 3);

        const jsonLd = [
            breadcrumbJsonLd([
                { name: "Home", href: "/" },
                { name: "Blog", href: "/blog" },
                { name: frontmatter.title, href: `/blog/${slug}` },
            ]),
            blogPostingJsonLd(slug, frontmatter),
        ];

        return (
            <PagefindWrapper type="Blog" title={frontmatter.title}>
                <StructuredData data={jsonLd} />
                {/* @ts-ignore - Dynamic layout props are tricky to type strictly */}
                <Layout frontmatter={frontmatter} relatedPosts={relatedPosts}>
                    <MDXContent source={content} />
                </Layout>
            </PagefindWrapper>
        );
    } catch {
        notFound();
    }
}
