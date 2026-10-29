import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd, faqJsonLd, extractFaqsFromMdx } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper, frontmatterKeywords } from "@/components/search/pagefind-wrapper";
import { Frontmatter } from "@/lib/content/schema";

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

    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("industries", slug));
    } catch {
        notFound();
    }

    const Layout = resolveLayout(frontmatter.layout);

    const breadcrumbs = breadcrumbJsonLd([
        { name: "Home", href: "/" },
        { name: "Industries", href: "/industries" },
        { name: frontmatter.title, href: `/industries/${slug}` },
    ]);

    // FAQPage schema for pages with a "## Frequently Asked Questions" section,
    // the same way solution and alternative pages emit it.
    const faqs = extractFaqsFromMdx(content);
    const schemas: Record<string, unknown>[] = [breadcrumbs];
    if (faqs.length > 0) {
        schemas.push(faqJsonLd(faqs));
    }

    return (
        <PagefindWrapper type="Industry" title={frontmatter.title} keywords={frontmatterKeywords(frontmatter)}>
            <StructuredData data={schemas} />
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Layout frontmatter={frontmatter}>
                <MDXContent source={content} />
            </Layout>
        </PagefindWrapper>
    );
}
