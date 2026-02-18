import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("industries");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("industries", slug);
        return buildContentMetadata(slug, frontmatter, "industries");
    } catch {
        return { title: "Industry Not Found" };
    }
}

export default async function IndustryPage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("industries", slug);
        const Layout = resolveLayout(frontmatter.layout);

        const jsonLd = breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Industries", href: "/industries" },
            { name: frontmatter.title, href: `/industries/${slug}` },
        ]);

        return (
            <PagefindWrapper type="Industry" title={frontmatter.title}>
                <StructuredData data={jsonLd} />
                <Layout frontmatter={frontmatter}>
                    <MDXContent source={content} />
                </Layout>
            </PagefindWrapper>
        );
    } catch {
        notFound();
    }
}
