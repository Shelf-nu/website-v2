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
    const slugs = getContentSlugs("use-cases");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("use-cases", slug);
        return buildContentMetadata(slug, frontmatter, "use-cases");
    } catch {
        return { title: "Use Case Not Found" };
    }
}

export default async function UseCasePage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("use-cases", slug);
        const Layout = resolveLayout(frontmatter.layout);

        const jsonLd = breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Use Cases", href: "/use-cases" },
            { name: frontmatter.title, href: `/use-cases/${slug}` },
        ]);

        return (
            <PagefindWrapper type="Use Case" title={frontmatter.title}>
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
