import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { KnowledgeBaseFeed } from "@/components/knowledge-base/kb-feed";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { collectionPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Knowledge Base - Shelf Asset Management",
    description:
        "Guides, tutorials, and how-to articles to help you get the most out of Shelf.",
    alternates: { canonical: "https://www.shelf.nu/knowledge-base" },
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

    // Cap ItemList at 30 entries to keep schema payload bounded. The full
    // article set is still discoverable via the on-page feed + sitemap.
    const collectionSchema = collectionPageJsonLd({
        name: "Shelf Knowledge Base",
        description:
            "Guides, tutorials, and how-to articles to help you get the most out of Shelf.",
        url: "/knowledge-base",
        items: articles.slice(0, 30).map((a) => ({
            name: a.frontmatter.title,
            url: `/knowledge-base/${a.slug}`,
            description: a.frontmatter.description,
        })),
    });

    return (
        <PagefindWrapper type="Page" title="Knowledge Base — Shelf Asset Management" keywords="knowledge base help guides tutorials how-to">
            <StructuredData data={collectionSchema} />
            <div className="flex min-h-screen flex-col relative">
                {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
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
                            <Link
                                href="/knowledge-base/how-to-choose-a-tracking-method"
                                className="group mt-6 inline-flex items-center gap-3 rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20 px-4 py-3 text-left transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200">
                                    <GitBranch className="h-4 w-4" />
                                </span>
                                <span className="text-sm">
                                    <span className="font-semibold text-foreground">Start here: How to Choose a Tracking Method</span>
                                    <span className="block text-xs text-muted-foreground">Individual, models, or quantity? Take the 30-second quiz.</span>
                                </span>
                                <ArrowRight className="h-4 w-4 shrink-0 text-orange-600 transition-transform group-hover:translate-x-0.5" />
                            </Link>
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
        </PagefindWrapper>
    );
}
