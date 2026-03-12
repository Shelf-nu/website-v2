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
import { TrackedLink } from "@/components/analytics/tracked-link";

/* ------------------------------------------------------------------ */
/*  Cross-linking: competitor groups for "Also Compare" section        */
/* ------------------------------------------------------------------ */

type CompetitorGroup = "open-source" | "simple" | "enterprise" | "cmms" | "niche";

const COMPETITOR_GROUPS: Record<string, { group: CompetitorGroup; label: string }> = {
    "snipe-it":          { group: "open-source", label: "Snipe-IT" },
    hector:              { group: "open-source", label: "Hector" },
    sortly:              { group: "simple",      label: "Sortly" },
    "asset-tiger":       { group: "simple",      label: "Asset Tiger" },
    "blue-tally":        { group: "simple",      label: "BlueTally" },
    itemit:              { group: "simple",      label: "Itemit" },
    gocodes:             { group: "simple",      label: "GoCodes" },
    "asset-panda":       { group: "enterprise",  label: "Asset Panda" },
    ezofficeinventory:   { group: "enterprise",  label: "EZOfficeInventory" },
    "asset-infinity":    { group: "enterprise",  label: "Asset Infinity" },
    hardcat:             { group: "enterprise",  label: "Hardcat" },
    "asset-guru":        { group: "enterprise",  label: "Asset Guru" },
    timly:               { group: "enterprise",  label: "Timly" },
    upkeep:              { group: "cmms",        label: "UpKeep" },
    limble:              { group: "cmms",        label: "Limble" },
    "brite-check":       { group: "cmms",        label: "BriteCheck" },
    cheqroom:            { group: "niche",       label: "Cheqroom" },
    webcheckout:         { group: "niche",       label: "WebCheckout" },
    "share-my-toolbox":  { group: "niche",       label: "ShareMyToolbox" },
    wasp:                { group: "niche",       label: "Wasp Barcode" },
};

/** Adjacent groups that share buyer intent */
const ADJACENT_GROUPS: Record<CompetitorGroup, CompetitorGroup[]> = {
    "open-source": ["simple", "enterprise"],
    simple:        ["open-source", "niche"],
    enterprise:    ["cmms", "open-source"],
    cmms:          ["enterprise", "simple"],
    niche:         ["simple", "cmms"],
};

/** Pick up to `count` related competitors for cross-linking */
function getRelatedCompetitors(currentSlug: string, count = 5): { slug: string; label: string }[] {
    const current = COMPETITOR_GROUPS[currentSlug];
    if (!current) return [];

    const sameGroup = Object.entries(COMPETITOR_GROUPS)
        .filter(([slug, c]) => slug !== currentSlug && c.group === current.group)
        .map(([slug, c]) => ({ slug, label: c.label }));

    const adjacentGroupIds = ADJACENT_GROUPS[current.group] || [];
    const adjacent = Object.entries(COMPETITOR_GROUPS)
        .filter(([slug, c]) => slug !== currentSlug && adjacentGroupIds.includes(c.group))
        .map(([slug, c]) => ({ slug, label: c.label }));

    // Prioritize same group first, then fill with adjacent
    return [...sameGroup, ...adjacent].slice(0, count);
}

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
    reftab: "/logos/reftab_darkfont.png",
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

const DEFAULT_COMPARISON_ROWS = [
    { feature: "Free plan with unlimited assets", shelf: true as const, competitor: "varies" as const },
    { feature: "Open source & self-hostable", shelf: true as const, competitor: false as const },
    { feature: "QR codes with custom branded labels", shelf: true as const, competitor: "varies" as const },
    { feature: "Custody tracking with PDF agreements", shelf: true as const, competitor: "varies" as const },
    { feature: "Equipment bookings & reservations", shelf: true as const, competitor: "varies" as const },
    { feature: "Kit-aware check-in/check-out", shelf: true as const, competitor: "varies" as const },
    { feature: "Location hierarchy (up to 12 levels)", shelf: true as const, competitor: "varies" as const },
    { feature: "CSV import from any tool", shelf: true as const, competitor: "varies" as const },
    { feature: "Works on any device (PWA)", shelf: true as const, competitor: "varies" as const },
    { feature: "No credit card to start", shelf: true as const, competitor: "varies" as const },
];

export function AlternativeLayout({ frontmatter, children }: LayoutProps) {
    const competitor = frontmatter.competitor || frontmatter.title.replace(/^(?:The #\d+\s+)?(.+?)\s+Alternative.*$/, "$1");
    const slugifiedCompetitor = competitor.toLowerCase().replace(/\s+/g, "_");
    const competitorSlug = frontmatter.canonicalUrl?.replace("/alternatives/", "") || slugifiedCompetitor.replace(/_/g, "-");

    // Use frontmatter comparison data if available, otherwise use defaults
    const comparisonRows = (frontmatter.comparisonTable as { feature: string; shelf: boolean | "varies"; competitor: boolean | "varies" }[] | undefined) || DEFAULT_COMPARISON_ROWS;

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
                            <TrackedLink
                                href={`https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=alt_${slugifiedCompetitor}_hero`}
                                eventName="signup_click"
                                eventProps={{ location: `alt_${slugifiedCompetitor}_hero` }}
                            >
                                Try Shelf free <ArrowRight className="ml-1 h-4 w-4" />
                            </TrackedLink>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <TrackedLink
                                href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=alt_hero_demo"
                                eventName="signup_click"
                                eventProps={{ location: `alt_${slugifiedCompetitor}_hero_demo` }}
                            >
                                Book a demo
                            </TrackedLink>
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
                                                <TrackedLink
                                                    href={`https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=alt_${slugifiedCompetitor}_sidebar`}
                                                    eventName="signup_click"
                                                    eventProps={{ location: `alt_${slugifiedCompetitor}_sidebar` }}
                                                >
                                                    Get started free
                                                </TrackedLink>
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <TrackedLink
                                                    href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=alt_sidebar_demo"
                                                    eventName="signup_click"
                                                    eventProps={{ location: `alt_${slugifiedCompetitor}_sidebar_demo` }}
                                                >
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Talk to us
                                                </TrackedLink>
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
                                        {comparisonRows.map((row) => (
                                            <tr key={row.feature} className="border-b border-border/30 last:border-0">
                                                <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                                                <td className="py-3 px-4 text-center">
                                                    {row.shelf === true ? (
                                                        <Check className="h-4 w-4 text-orange-600 mx-auto" />
                                                    ) : row.shelf === false ? (
                                                        <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60">Varies</span>
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
                                    <TrackedLink
                                        href={`https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=alt_${slugifiedCompetitor}_mobile`}
                                        eventName="signup_click"
                                        eventProps={{ location: `alt_${slugifiedCompetitor}_mobile` }}
                                    >
                                        Get started free <ArrowRight className="ml-1 h-4 w-4" />
                                    </TrackedLink>
                                </Button>
                                <Button variant="outline" asChild>
                                    <TrackedLink
                                        href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=alt_mobile_demo"
                                        eventName="signup_click"
                                        eventProps={{ location: `alt_${slugifiedCompetitor}_mobile_demo` }}
                                    >
                                        Book a demo
                                    </TrackedLink>
                                </Button>
                            </div>
                        </div>
                    </Container>
                </main>

                {/* Also Compare — cross-link to related alternatives */}
                {(() => {
                    const related = getRelatedCompetitors(competitorSlug);
                    if (related.length === 0) return null;
                    return (
                        <section className="border-t bg-muted/20">
                            <Container className="py-16">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Also compare</h2>
                                <p className="text-muted-foreground mb-8">
                                    Evaluating alternatives? See how Shelf stacks up against similar tools.
                                </p>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                    {related.map((r) => {
                                        const logo = COMPETITOR_LOGOS[r.slug];
                                        return (
                                            <Link
                                                key={r.slug}
                                                href={`/alternatives/${r.slug}`}
                                                className="group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-5 hover:border-orange-200 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center justify-center h-10 w-24 rounded-lg bg-white border border-border/30 p-2">
                                                    {logo ? (
                                                        <Image
                                                            src={logo}
                                                            alt={r.label}
                                                            width={80}
                                                            height={32}
                                                            className="h-full w-auto object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-bold text-foreground truncate">{r.label}</span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-foreground group-hover:text-orange-600 transition-colors">
                                                    Shelf vs {r.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 text-center">
                                    <Link
                                        href="/alternatives"
                                        className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                    >
                                        View all comparisons →
                                    </Link>
                                </div>
                            </Container>
                        </section>
                    );
                })()}

                <CTA />

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
