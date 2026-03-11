import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileSpreadsheet, MoveRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { FAQSection } from "@/components/sections/faq";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";

export const metadata = {
    title: "Migrate to Shelf - Switch from Any Tool or Spreadsheet",
    description: "Switch from spreadsheets, Asset Panda, Snipe-IT, Cheqroom, or any asset management tool. Import your data to Shelf in minutes with CSV.",
};

/* ------------------------------------------------------------------ */
/*  Migration sources — grouped by category                            */
/* ------------------------------------------------------------------ */

const spreadsheetSource = {
    name: "Excel & Spreadsheets",
    description: "Most teams start here. Export your spreadsheet as CSV and import directly into Shelf — categories, locations, custom fields and all.",
    href: "/knowledge-base/importing-assets-to-shelf-csv-guide",
    cta: "See CSV import guide",
};

const competitors = [
    { name: "Asset Panda", logo: "/logos/asset-panda.svg", slug: "asset-panda", description: "Simpler setup, flat pricing, no per-user fees." },
    { name: "Snipe-IT", logo: "/logos/snipe-it.webp", slug: "snipe-it", description: "Modern UX with built-in bookings and kit tracking." },
    { name: "Cheqroom", logo: "/logos/cheqroom.webp", slug: "cheqroom", description: "Transparent pricing with unlimited users." },
    { name: "Sortly", logo: "/logos/sortly.svg", slug: "sortly", description: "Full booking system and open-source flexibility." },
    { name: "UpKeep", logo: "/logos/upkeep.svg", slug: "upkeep", description: "Dedicated asset tracking without CMMS overhead." },
    { name: "EZOfficeInventory", logo: "/logos/ezofficeinventory.webp", slug: "ezofficeinventory", description: "Flat pricing with unlimited users and assets." },
    { name: "Asset Tiger", logo: "/logos/asset-tiger.svg", slug: "asset-tiger", description: "Built-in bookings and kit tracking included." },
    { name: "AssetGuru", logo: "/logos/asset-guru.webp", slug: "asset-guru", description: "Transparent pricing with faster setup." },
    { name: "Asset Infinity", logo: "/logos/asset-infinity.webp", slug: "asset-infinity", description: "Modern QR-first approach without RFID overhead." },
    { name: "BlueTally", logo: "/logos/blue-tally.webp", slug: "blue-tally", description: "Open source with kit tracking and bookings." },
    { name: "BriteCheck", logo: "/logos/brite-check.svg", slug: "brite-check", description: "Bookings and kit tracking out of the box." },
    { name: "GoCodes", logo: "/logos/gocodes.webp", slug: "gocodes", description: "Flat pricing with built-in booking system." },
    { name: "Hardcat", logo: "/logos/hardcat.svg", slug: "hardcat", description: "Faster setup with a modern, intuitive interface." },
    { name: "Hector", logo: "/logos/hector.svg", slug: "hector", description: "Flat pricing with open-source transparency." },
    { name: "Itemit", logo: "/logos/itemit.webp", slug: "itemit", description: "Lower cost, no proprietary hardware required." },
    { name: "ShareMyToolbox", logo: "/logos/share-my-toolbox.webp", slug: "share-my-toolbox", description: "Open source with kit tracking for field teams." },
    { name: "Timly", logo: "/logos/timly.svg", slug: "timly", description: "Lower cost, no specialized hardware needed." },
    { name: "Wasp", logo: "/logos/wasp.webp", slug: "wasp", description: "Modern UX with faster cloud-based setup." },
    { name: "WebCheckout", logo: "/logos/webcheckout.webp", slug: "webcheckout", description: "Modern QR-first approach with open source." },
    { name: "Limble CMMS", slug: "limble", description: "Dedicated asset tracking without CMMS complexity." },
];

export default function MigratePage() {
    return (
        <PagefindWrapper type="Page" title="Migrate to Shelf - Switch from any tool" keywords="migrate migration switch import csv excel spreadsheet">
            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <Container className="text-center relative z-10">
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100/50 mb-8">
                        Migration Center
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                        Switch to <span className="text-orange-600">Shelf</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-8">
                        Import your data in minutes — from spreadsheets, legacy tools, or any asset management system. Join 3,000+ teams who already made the switch.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20" asChild>
                            <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=migrate_hero_signup">
                                Create a free account
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=migrate_hero_demo">
                                Book a demo
                            </Link>
                        </Button>
                    </div>
                </Container>
            </section>

            {/* Spreadsheet migration — featured card */}
            <section className="py-16 md:py-24">
                <Container>
                    <ScrollReveal width="100%">
                        <div className="text-center mb-12 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Where are you migrating from?</h2>
                            <p className="text-lg text-muted-foreground">
                                Whether you&apos;re on spreadsheets or another tool, we have a path for you.
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Excel/Spreadsheets — primary card */}
                    <ScrollReveal width="100%" delay={0.05}>
                        <Link href={spreadsheetSource.href} className="group block mb-10">
                            <div className="rounded-2xl border-2 border-orange-200/60 bg-gradient-to-br from-orange-50/50 to-background p-8 md:p-10 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-orange-300/60">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40 flex-shrink-0">
                                        <FileSpreadsheet className="h-7 w-7 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-foreground">
                                                Migrate from {spreadsheetSource.name}
                                            </h3>
                                            <Badge className="bg-orange-100 text-orange-700 border-orange-200/50 text-xs">Most popular</Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                            {spreadsheetSource.description}
                                        </p>
                                    </div>
                                    <div className="text-orange-600 font-medium text-sm flex items-center gap-1 flex-shrink-0 group-hover:underline">
                                        {spreadsheetSource.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </ScrollReveal>

                    {/* All competitor cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {competitors.map((comp, index) => (
                            <ScrollReveal key={comp.slug} delay={index * 0.03}>
                                <Link href={`/alternatives/${comp.slug}`} className="group block h-full">
                                    <Card className="h-full hover:shadow-md transition-all border-border/40 hover:border-orange-200 group-hover:-translate-y-0.5">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3 mb-2">
                                                {comp.logo ? (
                                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted/50 p-1 flex-shrink-0">
                                                        <Image src={comp.logo} alt={comp.name} width={24} height={24} className="object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted/50 flex-shrink-0">
                                                        <span className="text-xs font-bold text-muted-foreground">{comp.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-sm font-semibold leading-tight">
                                                    {comp.name}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 pb-3">
                                            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                                                {comp.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <div className="text-orange-600 font-medium text-xs flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                See comparison <MoveRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Any other tool fallback */}
                    <div className="mt-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 md:p-10">
                        <h3 className="text-xl font-bold mb-2">Using a different tool?</h3>
                        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                            Shelf supports CSV imports from any system. Export your data, map columns, and you&apos;ll be running in minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                            <Link href="/knowledge-base/importing-assets-to-shelf-csv-guide">
                                <Button variant="secondary" size="sm">
                                    CSV import guide <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                </Button>
                            </Link>
                            <Link href="/alternatives" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                View all comparisons <ArrowRight className="ml-1 h-3.5 w-3.5 inline" />
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* FAQ */}
            <section className="py-16 md:py-24">
                <Container>
                    <FAQSection
                        title="Migration FAQ"
                        description=""
                        className="bg-transparent border-none py-0 sm:py-0"
                        items={[
                            {
                                question: "How long does a migration to Shelf take?",
                                answer: "Most migrations take a few hours of focused work. Even larger inventories or multi-workspace setups are typically completed within a day."
                            },
                            {
                                question: "What data can I migrate into Shelf?",
                                answer: (
                                    <>
                                        You can migrate assets, categories, locations, custom fields, tags, users, and availability data.
                                        Most teams migrate from Excel or other spreadsheets, or from existing asset systems like <Link href="/alternatives/asset-panda" className="text-orange-600 hover:underline">Asset Panda</Link>, <Link href="/alternatives/snipe-it" className="text-orange-600 hover:underline">Snipe-IT</Link>, <Link href="/alternatives/cheqroom" className="text-orange-600 hover:underline">Cheqroom</Link>, or <Link href="/alternatives/sortly" className="text-orange-600 hover:underline">Sortly</Link>.
                                    </>
                                )
                            },
                            {
                                question: "Will I lose my asset history?",
                                answer: "Your historical activity generally remains with your previous system. In Shelf, you start with a clean operational history going forward. If there are important legacy details you want to keep, many teams store them as custom fields on the asset (for example: previous IDs, notes, or last service dates)."
                            },
                            {
                                question: "Can you help migrate complex setups or multiple workspaces?",
                                answer: (
                                    <>
                                        Yes. If you&apos;re managing multiple departments, studios, or locations, we can help you think through <Link href="/features/workspaces" className="text-orange-600 hover:underline">workspace</Link> structure and setup when needed.
                                    </>
                                )
                            },
                            {
                                question: "Will there be downtime during migration?",
                                answer: "No. You can run your existing system and Shelf in parallel while migrating. Once everything looks right, you can switch over without disrupting daily operations."
                            },
                            {
                                question: "Can I try Shelf before fully migrating?",
                                answer: "Absolutely. You can import a subset of your assets, test workflows, and confirm Shelf fits your needs before completing a full migration."
                            },
                            {
                                question: "Does Shelf integrate with my existing tools?",
                                answer: (
                                    <>
                                        Shelf supports common authentication and operational workflows used by teams managing physical assets. We integrate with SSO providers and support flexible import/export options. Check our <Link href="https://docs.shelf.nu" className="text-orange-600 hover:underline">documentation</Link> for details.
                                    </>
                                )
                            },
                            {
                                question: "Who helps if I get stuck during migration?",
                                answer: (
                                    <>
                                        Our team is available to answer questions. Check out our <Link href="/resources" className="text-orange-600 hover:underline">Help Center</Link> for guides, or <Link href="/contact" className="text-orange-600 hover:underline">contact support</Link> for hands-on assistance.
                                    </>
                                )
                            },
                            {
                                question: "Will checkouts, bookings, and labels work right away?",
                                answer: (
                                    <>
                                        Yes. Once your assets are in Shelf, you can immediately use <Link href="/features/bookings" className="text-orange-600 hover:underline">bookings</Link>, <Link href="/features/custody" className="text-orange-600 hover:underline">check-in/out flows</Link>, and <Link href="/solutions/asset-tracking" className="text-orange-600 hover:underline">QR or barcode labels</Link>.
                                    </>
                                )
                            }
                        ]}
                    />
                </Container>
            </section>

            <CTA />
        </PagefindWrapper>
    );
}
