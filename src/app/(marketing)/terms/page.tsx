
import { getContentBySlug } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Container } from "@/components/ui/container";
import { Frontmatter } from "@/lib/content/schema";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata = {
    title: "Terms and Conditions",
    description: "Terms of service for Shelf Asset Management — the agreement covering use of the platform, plans, billing, acceptable use, and account responsibilities.",
    alternates: { canonical: "https://www.shelf.nu/terms" },
};

export default async function TermsPage() {
    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("pages", "terms"));
    } catch {
        notFound();
    }

    return (
        <PagefindWrapper
            type="Page"
            title="Terms and Conditions — Shelf Asset Management"
            keywords="terms terms of service terms and conditions user agreement acceptable use service agreement legal"
        >
            <Container className="pt-36 sm:pt-44 pb-20 max-w-4xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">{frontmatter.title}</h1>
                    <p className="text-xl text-muted-foreground">{frontmatter.description}</p>
                </div>
                <article className="prose prose-zinc prose-lg dark:prose-invert max-w-none">
                    <MDXContent source={content} />
                </article>
            </Container>
        </PagefindWrapper>
    );
}
