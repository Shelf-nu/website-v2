import Link from "next/link";
import Image from "next/image";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { CTA } from "@/components/sections/cta";

export const metadata: Metadata = {
    title: "Shelf Alternatives & Comparisons | Shelf",
    description:
        "Compare Shelf to other asset management solutions. See feature-by-feature breakdowns of why teams switch to Shelf.",
};

// Map competitor slugs to their logo files
const competitorLogos: Record<string, string> = {
    "asset-panda": "/logos/asset-panda.svg",
    "snipe-it": "/logos/snipe-it.png",
    cheqroom: "/logos/cheqroom.svg",
    sortly: "/logos/sortly.svg",
    upkeep: "/logos/upkeep.svg",
    "asset-guru": "/logos/asset-guru.webp",
    "asset-infinity": "/logos/asset-infinity.webp",
    "asset-tiger": "/logos/asset-tiger.svg",
    "blue-tally": "/logos/blue-tally.jpeg",
    "brite-check": "/logos/brite-check.svg",
    ezofficeinventory: "/logos/ezofficeinventory.webp",
    gocodes: "/logos/gocodes.png",
    hardcat: "/logos/hardcat.svg",
    hector: "/logos/hector.svg",
    itemit: "/logos/itemit.png",
    "share-my-toolbox": "/logos/share-my-toolbox.jpeg",
    timly: "/logos/timly.svg",
    wasp: "/logos/wasp.jpeg",
    webcheckout: "/logos/webcheckout.jpeg",
};

export default function AlternativesIndexPage() {
    const alternatives = getAllContent("alternatives");

    return (
        <div className="flex min-h-screen flex-col">
            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <Container className="text-center relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-8">
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        Compare
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                        Switch to <span className="text-orange-600">Shelf</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                        See how Shelf compares to other asset management solutions. Feature-by-feature breakdowns to help you make the right choice.
                    </p>
                </Container>
            </section>

            {/* Alternatives grid */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {alternatives.map((alt, index) => {
                            const logo = competitorLogos[alt.slug];
                            return (
                                <ScrollReveal key={alt.slug} delay={index * 0.04}>
                                    <Link
                                        href={`/alternatives/${alt.slug}`}
                                        className="group block h-full"
                                    >
                                        <div className="h-full rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/20">
                                            {/* Competitor logo or name */}
                                            <div className="flex items-center gap-3 mb-4">
                                                {logo && (
                                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted/50 p-1 flex-shrink-0">
                                                        <Image
                                                            src={logo}
                                                            alt={alt.frontmatter.competitor || alt.frontmatter.title}
                                                            width={24}
                                                            height={24}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        {alt.frontmatter.competitor || alt.frontmatter.title.replace(" Alternative", "")}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3 text-orange-500" />
                                                    <span className="font-medium text-orange-600">
                                                        Shelf
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-bold group-hover:text-orange-600 transition-colors mb-2">
                                                {alt.frontmatter.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                                                {alt.frontmatter.description}
                                            </p>

                                            <div className="mt-4 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Read comparison{" "}
                                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    </Link>
                                </ScrollReveal>
                            );
                        })}
                    </div>

                    {/* Fallback for unlisted tools */}
                    <div className="mt-16 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 md:p-12">
                        <h3 className="text-xl font-bold mb-2">
                            Using a tool not listed here?
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                            Shelf supports CSV imports from any asset management tool. Migrate your data in minutes.
                        </p>
                        <Link
                            href="/migrate"
                            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                            See migration guide <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </div>
                </Container>
            </section>

            <CTA />
        </div>
    );
}
