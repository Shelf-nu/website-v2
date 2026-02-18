import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("updates");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("updates", slug);
        return buildContentMetadata(slug, frontmatter, "updates");
    } catch {
        return { title: "Update Not Found" };
    }
}

export default async function UpdatePage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("updates", slug);
        const Layout = resolveLayout(frontmatter.layout);

        const jsonLd = [
            breadcrumbJsonLd([
                { name: "Home", href: "/" },
                { name: "Updates", href: "/updates" },
                { name: frontmatter.title, href: `/updates/${slug}` },
            ]),
            articleJsonLd(`/updates/${slug}`, frontmatter),
        ];

        return (
            <PagefindWrapper type="Update" title={frontmatter.title}>
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
