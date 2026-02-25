import Link from "next/link";
import { Frontmatter } from "@/lib/content/schema";
import { PageHeader } from "./shared/page-header";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import { CTA } from "@/components/sections/cta";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function AlternativeLayout({ frontmatter, children }: LayoutProps) {
    const competitor = frontmatter.competitor || frontmatter.title.replace(" Alternative", "");
    const slugifiedCompetitor = competitor.toLowerCase().replace(/\s+/g, "_");

    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <PageHeader
                    title={frontmatter.title}
                    description={frontmatter.description}
                    heroTagline={`Shelf vs ${competitor}`}
                >
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                            <Link href={`https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=alt_${slugifiedCompetitor}_hero`}>
                                Try Shelf free <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=alt_hero_demo">
                                Book a demo
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                <main className="flex-1">
                    <Container className="py-16">
                        <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-16">
                            {/* Main Content */}
                            <div className="prose prose-lg dark:prose-invert max-w-3xl">
                                {children}
                            </div>

                            {/* Sticky Sidebar */}
                            <aside className="hidden lg:block">
                                <div className="sticky top-24 space-y-6">
                                    {/* CTA Card */}
                                    <div className="rounded-2xl border border-orange-200/60 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/30 p-6">
                                        <h3 className="font-bold text-lg text-foreground mb-2">
                                            Ready to switch?
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                                            Create a free account and import your {competitor} data in minutes.
                                        </p>
                                        <div className="space-y-3">
                                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                                <Link href={`https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=alt_${slugifiedCompetitor}_sidebar`}>
                                                    Get started free
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=alt_sidebar_demo">
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Talk to us
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Quick Wins */}
                                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                                        <h4 className="font-semibold text-sm text-foreground mb-4">Why teams switch</h4>
                                        <ul className="space-y-3">
                                            {[
                                                "Set up in minutes, not weeks",
                                                "Import via CSV from any tool",
                                                "QR codes + labels built in",
                                                "Free plan with unlimited assets",
                                                "Open source & transparent",
                                            ].map((item) => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Import Guide Link */}
                                    <Link
                                        href="/knowledge-base/importing-assets-to-shelf-csv-guide"
                                        className="block rounded-2xl border border-border/50 bg-card p-6 hover:border-orange-200 hover:shadow-sm transition-all group"
                                    >
                                        <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-orange-600 transition-colors">
                                            Migration guide →
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Step-by-step CSV import guide to move your data from {competitor} to Shelf.
                                        </p>
                                    </Link>
                                </div>
                            </aside>
                        </div>

                        {/* Mobile CTA (shown below content on small screens) */}
                        <div className="lg:hidden mt-12 rounded-2xl border border-orange-200/60 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/30 p-8 text-center">
                            <h3 className="font-bold text-xl text-foreground mb-2">
                                Ready to switch from {competitor}?
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                Create a free account and import your data in minutes. No credit card required.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                    <Link href={`https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=alt_${slugifiedCompetitor}_mobile`}>
                                        Get started free <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=alt_mobile_demo">
                                        Book a demo
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Container>
                </main>

                <CTA />

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
