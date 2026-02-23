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
    params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("glossary");
    return slugs.map((slug) => ({
        term: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { term } = await params;
    try {
        const { frontmatter } = getContentBySlug("glossary", term);
        return buildContentMetadata(term, frontmatter, "glossary");
    } catch {
        return { title: "Term Not Found" };
    }
}

export default async function GlossaryPage({ params }: PageProps) {
    const { term } = await params;

    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("glossary", term));
    } catch {
        notFound();
    }

    const Layout = resolveLayout(frontmatter.layout);

    const jsonLd = breadcrumbJsonLd([
        { name: "Home", href: "/" },
        { name: "Glossary", href: "/glossary" },
        { name: frontmatter.title, href: `/glossary/${term}` },
    ]);

    return (
        <PagefindWrapper type="Glossary" title={frontmatter.title}>
            <StructuredData data={jsonLd} />
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Layout frontmatter={frontmatter}>
                <MDXContent source={content} />
            </Layout>
        </PagefindWrapper>
    );
}
