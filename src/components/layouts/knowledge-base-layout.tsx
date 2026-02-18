import { Frontmatter } from "@/lib/content/schema";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function KnowledgeBaseLayout({ frontmatter, children }: LayoutProps) {
    const category = frontmatter.category || "General";

    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                {/* Breadcrumbs + Header */}
                <div className="border-b border-border/40 bg-muted/20">
                    <Container className="pt-28 pb-10 md:pt-36 md:pb-14">
                        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                            <Link
                                href="/knowledge-base"
                                className="hover:text-foreground transition-colors"
                            >
                                Knowledge Base
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="text-foreground font-medium truncate">
                                {category}
                            </span>
                        </nav>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                            {frontmatter.title}
                        </h1>
                        {frontmatter.description && (
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                {frontmatter.description}
                            </p>
                        )}
                    </Container>
                </div>

                {/* Content */}
                <main className="flex-1">
                    <Container className="py-12 md:py-16">
                        <div className="max-w-3xl">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                {children}
                            </div>
                        </div>

                        {/* Back link */}
                        <div className="mt-16 pt-8 border-t border-border/40">
                            <Link
                                href="/knowledge-base"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                                Back to Knowledge Base
                            </Link>
                        </div>
                    </Container>
                </main>
            </div>
        </>
    );
}
