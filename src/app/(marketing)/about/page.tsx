import { getContentBySlug } from "@/lib/mdx";
import { MDXContent } from "@/components/mdx-content";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Shelf",
    description: "Learn more about our mission and team.",
};

export default function AboutPage() {
    const { content, frontmatter } = getContentBySlug("pages", "about");

    return (
        <Container className="py-20">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    {frontmatter.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-10">
                    {frontmatter.description}
                </p>
                <MDXContent source={content} />
            </div>
        </Container>
    );
}
