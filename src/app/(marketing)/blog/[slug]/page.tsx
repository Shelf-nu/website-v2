import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs, getAllContent } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd, blogPostingJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { Frontmatter } from "@/lib/content/schema";

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

    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("blog", slug));
    } catch {
        notFound();
    }

    const Layout = resolveLayout(frontmatter.layout);

    // Deterministic shuffle based on slug
    const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const allPosts = getAllContent("blog");
    const relatedPosts = allPosts
        .filter(post => post.slug !== slug)
        .sort((a, b) => {
            const ha = a.slug.charCodeAt(0) ^ hash;
            const hb = b.slug.charCodeAt(0) ^ hash;
            return ha - hb;
        })
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
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Layout frontmatter={frontmatter} relatedPosts={relatedPosts}>
                <MDXContent source={content} />
            </Layout>
        </PagefindWrapper>
    );
}
