import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs, getAllContent } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("blog");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("blog", slug);

        return {
            title: frontmatter.seo?.title || frontmatter.title,
            description: frontmatter.seo?.description || frontmatter.description,
            alternates: {
                canonical: frontmatter.canonicalUrl,
            },
            openGraph: {
                title: frontmatter.seo?.title || frontmatter.title,
                description: frontmatter.seo?.description || frontmatter.description,
                type: "article",
                publishedTime: frontmatter.date,
                authors: [frontmatter.author],
            },
            twitter: {
                card: "summary_large_image",
                title: frontmatter.seo?.title || frontmatter.title,
                description: frontmatter.seo?.description || frontmatter.description,
            },
        };
    } catch {
        return {
            title: "Blog Not Found",
        };
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

        return (
            // @ts-ignore - Dynamic layout props are tricky to type strictly
            <Layout frontmatter={frontmatter} relatedPosts={relatedPosts}>
                <MDXContent source={content} />
            </Layout>
        );
    } catch {
        notFound();
    }
}
