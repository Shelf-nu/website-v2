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
    params: Promise<{ vendor: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("alternatives");
    return slugs.map((slug) => ({
        vendor: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { vendor } = await params;
    try {
        const { frontmatter } = getContentBySlug("alternatives", vendor);
        return buildContentMetadata(vendor, frontmatter, "alternatives");
    } catch {
        return { title: "Alternative Not Found" };
    }
}

export default async function AlternativePage({ params }: PageProps) {
    const { vendor } = await params;

    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("alternatives", vendor));
    } catch {
        notFound();
    }

    const Layout = resolveLayout(frontmatter.layout);

    const jsonLd = breadcrumbJsonLd([
        { name: "Home", href: "/" },
        { name: "Alternatives", href: "/alternatives" },
        { name: frontmatter.title, href: `/alternatives/${vendor}` },
    ]);

    return (
        <PagefindWrapper type="Alternative" title={frontmatter.title}>
            <StructuredData data={jsonLd} />
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Layout frontmatter={frontmatter}>
                <MDXContent source={content} />
            </Layout>
        </PagefindWrapper>
    );
}
