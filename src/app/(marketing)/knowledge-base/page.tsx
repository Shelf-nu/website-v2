import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { KnowledgeBaseFeed } from "@/components/knowledge-base/kb-feed";
import Image from "next/image";

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
        <div className="flex min-h-screen flex-col relative">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            {/* Hero */}
            <section className="border-b border-border/40">
                <Container className="pt-28 pb-14 md:pt-36 md:pb-20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        {/* Text */}
                        <div className="max-w-xl text-center md:text-left">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                                Knowledge Base
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Everything you need to know about using Shelf
                                — from getting started to advanced features.
                            </p>
                        </div>

                        {/* Label images composition */}
                        <div className="relative w-64 h-56 md:w-80 md:h-64 flex-shrink-0 hidden sm:block">
                            {/* Square branded label — back, tilted left */}
                            <div className="absolute top-0 left-0 w-36 md:w-44 drop-shadow-lg -rotate-6">
                                <Image
                                    src="/images/labels/custom-rectangle.png"
                                    alt="Shelf custom branded QR label"
                                    width={400}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            </div>
                            {/* Horizontal branded label — front, tilted right */}
                            <div className="absolute bottom-2 right-0 w-48 md:w-56 drop-shadow-xl rotate-3">
                                <Image
                                    src="/images/labels/custom-label.png"
                                    alt="Shelf asset label with QR code"
                                    width={321}
                                    height={216}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
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
