
import { getContentBySlug } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Container } from "@/components/ui/container";
import { Frontmatter } from "@/lib/content/schema";

export const metadata = {
    title: "Privacy Policy | Shelf Asset Management",
    description: "Understand how Shelf collects, stores and protects your organization's asset information and personal data.",
};

export default function PrivacyPage() {
    let content: string;
    let frontmatter: Frontmatter;
    try {
        ({ content, frontmatter } = getContentBySlug("pages", "privacy"));
    } catch {
        notFound();
    }

    return (
        <Container className="py-20 max-w-4xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">{frontmatter.title}</h1>
                <p className="text-xl text-muted-foreground">{frontmatter.description}</p>
            </div>
            <article className="prose prose-zinc prose-lg dark:prose-invert max-w-none">
                <MDXContent source={content} />
            </article>
        </Container>
    );
}
