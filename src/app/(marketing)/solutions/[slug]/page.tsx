import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { Frontmatter } from "@/lib/content/schema";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("solutions");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("solutions", slug);
        return buildContentMetadata(slug, frontmatter, "solutions");
    } catch {
        return { title: "Solution Not Found" };
    }
}

export default async function SolutionPage({ params }: PageProps) {
    const { slug } = await params;

    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("solutions", slug));
    } catch {
        notFound();
    }

    const Layout = resolveLayout(frontmatter.layout);

    const jsonLd = breadcrumbJsonLd([
        { name: "Home", href: "/" },
        { name: "Solutions", href: "/solutions" },
        { name: frontmatter.title, href: `/solutions/${slug}` },
    ]);

    return (
        <PagefindWrapper type="Solution" title={frontmatter.title}>
            <StructuredData data={jsonLd} />
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Layout frontmatter={frontmatter}>
                <MDXContent source={content} />
            </Layout>
        </PagefindWrapper>
    );
}
