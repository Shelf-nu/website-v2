import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";

interface PageProps {
    params: Promise<{ vendor: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("alternatives");
    return slugs.map((slug) => ({
        vendor: slug.replace(/\.mdx$/, ""),
    }));
}

export default async function AlternativePage({ params }: PageProps) {
    const { vendor } = await params;
    try {
        const { content, frontmatter } = getContentBySlug("alternatives", vendor);
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
