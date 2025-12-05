import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";

interface PageProps {
    params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("glossary");
    return slugs.map((slug) => ({
        term: slug.replace(/\.mdx$/, ""),
    }));
}

export default async function GlossaryPage({ params }: PageProps) {
    const { term } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("glossary", term);
        const Layout = resolveLayout(frontmatter.layout);

        return (
            <Layout frontmatter={frontmatter}>
                <MDXContent source={content} />
            </Layout>
        );
    } catch {
        notFound();
    }
}
