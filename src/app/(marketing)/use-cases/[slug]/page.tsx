import { resolveLayout } from "@/components/layouts/resolve-layout";
import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getContentSlugs("use-cases");
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ""),
    }));
}

export default async function UseCasePage({ params }: PageProps) {
    const { slug } = await params;

    let pageData;
    try {
        pageData = getContentBySlug("use-cases", slug);
    } catch {
        notFound();
    }

    const { content, frontmatter } = pageData;
    const Layout = resolveLayout(frontmatter.layout);

    return (
        <Layout frontmatter={frontmatter}>
            <MDXContent source={content} />
        </Layout>
    );
}
