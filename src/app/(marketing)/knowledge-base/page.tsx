import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { KnowledgeBaseFeed } from "@/components/knowledge-base/kb-feed";

export const metadata: Metadata = {
    title: "Knowledge Base - Shelf Asset Management",
    description:
        "Guides, tutorials, and how-to articles to help you get the most out of Shelf.",
};

export default function KnowledgeBasePage() {
    const articles = getAllContent("knowledge-base");

    // Extract unique categories and count articles per category
    const categoryMap = new Map<string, number>();
    articles.forEach((article) => {
        const cat = article.frontmatter.category || "General";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const categories = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    // Serialize articles for client component
    const serializedArticles = articles.map((a) => ({
        slug: a.slug,
        title: a.frontmatter.title,
        description: a.frontmatter.description || "",
        category: a.frontmatter.category || "General",
    }));

    return (
        <div className="flex min-h-screen flex-col">
            {/* Hero */}
            <section className="border-b border-border/40 bg-muted/20">
                <Container className="pt-28 pb-14 md:pt-36 md:pb-20 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                        Knowledge Base
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about using Shelf — from
                        getting started to advanced features.
                    </p>
                </Container>
            </section>

            {/* Feed with filtering */}
            <section className="py-16 md:py-20">
                <Container>
                    <KnowledgeBaseFeed
                        articles={serializedArticles}
                        categories={categories}
                    />
                </Container>
            </section>
        </div>
    );
}
