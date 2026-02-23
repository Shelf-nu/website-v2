import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Metadata } from "next";
import { buildContentMetadata, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { Frontmatter } from "@/lib/content/schema";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("case-studies");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("case-studies", slug);
        return buildContentMetadata(slug, frontmatter, "case-studies");
    } catch {
        return { title: "Case Study Not Found" };
    }
}

export default async function CaseStudyPage({ params }: PageProps) {
    const { slug } = await params;

    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("case-studies", slug));
    } catch {
        notFound();
    }

    const Layout = resolveLayout(frontmatter.layout);

    // Calculate Next Case Study (Circular)
    const allStudies = getContentSlugs("case-studies");
    const currentIndex = allStudies.indexOf(`${slug}.mdx`);
    const nextIndex = (currentIndex + 1) % allStudies.length;
    const nextSlug = allStudies[nextIndex].replace('.mdx', '');
    const nextStudyContent = getContentBySlug("case-studies", nextSlug);

    // Inject nextStudy into frontmatter
    const enrichedFrontmatter = {
        ...frontmatter,
        nextStudy: {
            title: nextStudyContent.frontmatter.title,
            slug: nextSlug,
            organization: nextStudyContent.frontmatter.organization,
            description: nextStudyContent.frontmatter.description,
        }
    };

    const jsonLd = [
        breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Case Studies", href: "/case-studies" },
            { name: frontmatter.title, href: `/case-studies/${slug}` },
        ]),
        articleJsonLd(`/case-studies/${slug}`, frontmatter),
    ];

    return (
        <PagefindWrapper type="Case Study" title={frontmatter.title}>
            <StructuredData data={jsonLd} />
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Layout frontmatter={enrichedFrontmatter}>
                <MDXContent source={content} />
            </Layout>
        </PagefindWrapper>
    );
}
