import { Frontmatter } from "@/lib/content/schema";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ChevronRight, ArrowRight, CheckCircle2, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

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

                {/* Content + Sidebar */}
                <main className="flex-1">
                    <Container className="py-12 md:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-16">
                            {/* Main Content */}
                            <div>
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
                            </div>

                            {/* Sticky Sidebar */}
                            <aside className="hidden lg:block">
                                <div className="sticky top-28 space-y-5">
                                    {/* Get Started CTA */}
                                    <div className="rounded-2xl border border-orange-200/60 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/30 p-6">
                                        <h3 className="font-bold text-lg text-foreground mb-2">
                                            Try Shelf for free
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                                            Put what you&apos;re learning into practice. Start tracking assets in minutes.
                                        </p>
                                        <div className="space-y-3">
                                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                                <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=kb_sidebar_signup">
                                                    Get started free
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=kb_sidebar_demo">
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Talk to sales
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Why Shelf */}
                                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                                        <h4 className="font-semibold text-sm text-foreground mb-4">Why teams choose Shelf</h4>
                                        <ul className="space-y-3">
                                            {[
                                                "Free plan with unlimited assets",
                                                "QR codes & labels built in",
                                                "Set up in minutes, not weeks",
                                                "Open source & transparent",
                                                "Rated 5.0/5 on G2",
                                            ].map((item) => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Need Help */}
                                    <Link
                                        href="/contact"
                                        className="block rounded-2xl border border-border/50 bg-card p-6 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-sm transition-all group"
                                    >
                                        <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-orange-600 transition-colors">
                                            Need help? →
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Our team responds within the same business day. No question is too small.
                                        </p>
                                    </Link>

                                    {/* Browse More */}
                                    <Link
                                        href="/knowledge-base"
                                        className="block rounded-2xl border border-border/50 bg-card p-6 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-sm transition-all group"
                                    >
                                        <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" /> Browse all guides
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Explore the full knowledge base for tutorials and how-to articles.
                                        </p>
                                    </Link>
                                </div>
                            </aside>
                        </div>

                        {/* Mobile CTA (shown below content on small screens) */}
                        <div className="lg:hidden mt-12 rounded-2xl border border-orange-200/60 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/30 p-8 text-center">
                            <h3 className="font-bold text-xl text-foreground mb-2">
                                Ready to try Shelf?
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                Put what you&apos;re learning into practice. Free plan available — no credit card required.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                    <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=kb_mobile_signup">
                                        Get started free <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=kb_mobile_demo">
                                        Book a demo
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Container>
                </main>
            </div>
        </>
    );
}
