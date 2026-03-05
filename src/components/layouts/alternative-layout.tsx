import Link from "next/link";
import Image from "next/image";
import { Frontmatter } from "@/lib/content/schema";
import { PageHeader } from "./shared/page-header";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import { CTA } from "@/components/sections/cta";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, MessageSquare, Check, Minus } from "lucide-react";
import { CompatibilityChecker } from "@/components/ui/compatibility-checker";

/** Maps competitor slug → logo file in public/logos/ */
const COMPETITOR_LOGOS: Record<string, string> = {
    cheqroom: "/logos/cheqroom.webp",
    sortly: "/logos/sortly.svg",
    "snipe-it": "/logos/snipe-it.webp",
    "asset-panda": "/logos/asset-panda.svg",
    "asset-tiger": "/logos/asset-tiger.svg",
    "asset-guru": "/logos/asset-guru.webp",
    "asset-infinity": "/logos/asset-infinity.webp",
    "blue-tally": "/logos/blue-tally.webp",
    "brite-check": "/logos/brite-check.svg",
    ezofficeinventory: "/logos/ezofficeinventory.webp",
    gocodes: "/logos/gocodes.webp",
    hardcat: "/logos/hardcat.svg",
    hector: "/logos/hector.svg",
    itemit: "/logos/itemit.webp",
    "share-my-toolbox": "/logos/share-my-toolbox.webp",
    timly: "/logos/timly.svg",
    upkeep: "/logos/upkeep.svg",
    wasp: "/logos/wasp.webp",
    webcheckout: "/logos/webcheckout.webp",
};

function CompetitorVsShelf({ competitor, slug }: { competitor: string; slug: string }) {
    const competitorLogo = COMPETITOR_LOGOS[slug];

    return (
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 sm:p-10 shadow-lg">
            <div className="flex items-center justify-center gap-6 sm:gap-10">
                {/* Competitor logo */}
                <div className="flex flex-col items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-16 w-28 sm:h-20 sm:w-36 rounded-xl bg-white border border-border/30 p-3 shadow-sm">
                        {competitorLogo ? (
                            <Image
                                src={competitorLogo}
                                alt={competitor}
                                width={120}
                                height={60}
                                className="h-full w-auto object-contain max-w-full"
                            />
                        ) : (
                            <span className="text-sm font-bold text-foreground truncate">{competitor}</span>
                        )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{competitor}</span>
                </div>

                {/* VS divider */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-muted-foreground/60 italic">
                        vs.
                    </span>
                </div>

                {/* Shelf logo */}
                <div className="flex flex-col items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-16 w-28 sm:h-20 sm:w-36 rounded-xl bg-white border-2 border-orange-200 p-3 shadow-sm shadow-orange-500/10">
                        <Image
                            src="/logo-light.png"
                            alt="Shelf"
                            width={120}
                            height={60}
                            className="h-full w-auto object-contain max-w-full"
                        />
                    </div>
                    <span className="text-xs font-semibold text-orange-600">Shelf</span>
                </div>
            </div>
        </div>
    );
}

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function AlternativeLayout({ frontmatter, children }: LayoutProps) {
    const competitor = frontmatter.competitor || frontmatter.title.replace(/^(?:The #\d+\s+)?(.+?)\s+Alternative.*$/, "$1");
    const slugifiedCompetitor = competitor.toLowerCase().replace(/\s+/g, "_");
    const competitorSlug = frontmatter.canonicalUrl?.replace("/alternatives/", "") || slugifiedCompetitor.replace(/_/g, "-");

    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <PageHeader
                    title={frontmatter.title}
                    description={frontmatter.description}
                    heroTagline={`Shelf vs ${competitor}`}
                    heroContent={<CompetitorVsShelf competitor={competitor} slug={competitorSlug} />}
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

                        {/* Quick Comparison Table */}
                        <div className="mt-16 max-w-3xl">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Quick comparison</h2>
                            <div className="overflow-x-auto rounded-xl border border-border/50">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/50 bg-muted/30">
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                                            <th className="text-center py-3 px-4 font-semibold text-orange-600">Shelf</th>
                                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">{competitor}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { feature: "Free plan with unlimited assets", shelf: true, competitor: "varies" },
                                            { feature: "Open source codebase", shelf: true, competitor: false },
                                            { feature: "QR codes & labels built in", shelf: true, competitor: "varies" },
                                            { feature: "CSV import from any tool", shelf: true, competitor: "varies" },
                                            { feature: "Bookings & reservations", shelf: true, competitor: "varies" },
                                            { feature: "Custody tracking", shelf: true, competitor: "varies" },
                                            { feature: "No credit card to start", shelf: true, competitor: "varies" },
                                        ].map((row) => (
                                            <tr key={row.feature} className="border-b border-border/30 last:border-0">
                                                <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                                                <td className="py-3 px-4 text-center">
                                                    {row.shelf ? (
                                                        <Check className="h-4 w-4 text-orange-600 mx-auto" />
                                                    ) : (
                                                        <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {row.competitor === true ? (
                                                        <Check className="h-4 w-4 text-muted-foreground mx-auto" />
                                                    ) : row.competitor === false ? (
                                                        <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60">Varies</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-3">
                                Feature availability for {competitor} may vary by plan. We encourage you to verify on their website.
                            </p>
                        </div>

                        {/* Compatibility Checker */}
                        <div className="mt-16 max-w-xl">
                            <CompatibilityChecker competitor={competitor} />
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
