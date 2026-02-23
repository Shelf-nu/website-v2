import { PageHeader } from "@/components/layouts/shared/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoveRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { FAQSection } from "@/components/sections/faq";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata = {
    title: "Migrate to Shelf - Modern Asset Management",
    description: "Switch from legacy asset management tools to Shelf. Import your data in minutes.",
};

const competitors = [
    {
        name: "Asset Panda",
        logo: "/logos/asset-panda.svg",
        description: "Moving from a configuration-heavy tool? Shelf works out of the box.",
        slug: "asset-panda"
    },
    {
        name: "Snipe-IT",
        logo: "/logos/snipe-it.svg",
        description: "Want something more modern than open source legacy software?",
        slug: "snipe-it"
    },
    {
        name: "Cheqroom",
        logo: "/logos/cheqroom.svg",
        description: "Looking for a cleaner UI and faster booking workflows?",
        slug: "cheqroom"
    },
    {
        name: "Sortly",
        logo: "/logos/sortly.svg",
        description: "Need more than just visual inventory lists?",
        slug: "sortly"
    },
    {
        name: "UpKeep",
        logo: "/logos/upkeep.svg",
        description: "Focusing on asset tracking rather than just work orders?",
        slug: "upkeep"
    },
    {
        name: "Hippo CMMS",
        logo: "/logos/hippo-cmms.svg",
        description: "Switching from complex maintenance systems to easy tracking?",
        slug: "hippo-cmms"
    }
];

export default function MigratePage() {
    return (
        <PagefindWrapper type="Page" title="Migrate to Shelf - Switch from legacy tools" keywords="migrate migration switch migrate page">
            <PageHeader
                title="Switch to Shelf"
                description="Import your data in minutes. Join hundreds of teams upgrading their asset management stack."
                heroTagline="Migration Center"
                image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop"
            >
                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                    <Link href="https://app.shelf.nu/register?utm_source=shelf_website&utm_medium=cta&utm_content=migrate_hero_signup">
                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                            Start Free Migration
                        </Button>
                    </Link>
                    <Link href="/contact?utm_source=shelf_website&utm_medium=cta&utm_content=migrate_hero_demo">
                        <Button size="lg" variant="outline" className="bg-background/50 border-input">
                            Book Migration Call
                        </Button>
                    </Link>
                </div>
            </PageHeader>

            <Container className="py-24">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Where are you migrating from?</h2>
                    <p className="text-lg text-muted-foreground">
                        We have dedicated guides and comparison pages to help you understand the differences and move your data.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {competitors.map((comp) => (
                        <Link key={comp.slug} href={`/alternatives/${comp.slug}`} className="group">
                            <Card className="h-full hover:shadow-lg transition-all border-border hover:border-orange-200 group-hover:-translate-y-1">
                                <CardHeader>
                                    <div className="relative h-10 w-10 mb-4">
                                        <Image src={comp.logo} alt={comp.name} fill className="object-contain" />
                                    </div>
                                    <CardTitle className="flex items-center gap-2">
                                        Migrate from {comp.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-muted-foreground">
                                        {comp.description}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-orange-600 font-medium text-sm flex items-center group-hover:underline">
                                        See comparison <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-24 p-8 sm:p-12 bg-muted/50 rounded-lg border border-border flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-bold mb-4">Don&apos;t see your current tool?</h3>
                        <p className="text-lg text-muted-foreground">
                            We support CSV imports from any system. Download our template and you&apos;ll be running in minutes.
                        </p>
                    </div>
                    <Link href="https://docs.shelf.nu/importing-data">
                        <Button variant="secondary" size="lg" className="shrink-0">
                            View Import Guides <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="mt-24">
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
                                        Yes. If you’re managing multiple departments, studios, or locations, we can help you think through <Link href="/features/workspaces" className="text-orange-600 hover:underline">workspace</Link> structure and setup when needed.
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
                </div>
            </Container>
        </PagefindWrapper>
    );
}
