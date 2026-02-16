import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("case-studies");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export default async function CaseStudyPage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("case-studies", slug);
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

        return (
            <Layout frontmatter={enrichedFrontmatter}>
                <MDXContent source={content} />
            </Layout>
        );
    } catch {
        notFound();
    }
}
