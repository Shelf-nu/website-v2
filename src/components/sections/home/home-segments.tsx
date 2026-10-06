import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Github, GraduationCap, Laptop, ScanLine, Wrench, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CUSTOMER_LOGOS } from "@/data/customer-logos";
import { HOME_SEGMENTS, MORE_SOLUTIONS, type SegmentIcon } from "@/data/home";
import { LinkRow } from "./link-row";
import { SectionHead } from "./section-head";

const ICONS: Record<SegmentIcon, LucideIcon> = { camera: Camera, graduation: GraduationCap, scan: ScanLine, wrench: Wrench, laptop: Laptop, github: Github };

/**
 * "Is it for me?" Six doors into the solutions pages, each with real proof.
 * Solutions pages convert 2-3x the homepage, and the homepage did not link to
 * them from its body before.
 */
export function HomeSegments() {
    const byId = new Map(CUSTOMER_LOGOS.map((logo) => [logo.id, logo]));

    return (
        <section className="border-y border-border bg-surface py-20 sm:py-24">
            <Container>
                <SectionHead
                    eyebrow="Who uses Shelf"
                    title="Built for the gear you actually manage."
                    lead="A media cage, a campus, an IT closet and a job site do not run the same way. Each one has its own setup guide, and its own customers already on Shelf."
                />

                <div className="mt-12 grid grid-cols-1 overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-2 lg:grid-cols-3 gap-px">
                    {HOME_SEGMENTS.map((segment) => {
                        const Icon = ICONS[segment.icon];
                        return (
                            <Link key={segment.id} href={segment.href} className="group flex flex-col bg-card p-6 transition-colors duration-150 hover:bg-background sm:p-7">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                                </span>
                                <h3 className="mt-5 text-lg font-semibold text-heading">{segment.title}</h3>
                                <p className="mt-2 flex-1 text-sm leading-relaxed text-caption">{segment.text}</p>

                                <div className="mt-5 flex min-h-8 flex-wrap items-center gap-x-2.5 gap-y-2">
                                    {segment.logos?.map((id) => {
                                        const logo = byId.get(id);
                                        if (!logo) return null;
                                        return (
                                            <span key={id} className="relative h-8 w-[76px] overflow-hidden rounded-md bg-white ring-1 ring-border">
                                                <Image src={logo.logo} alt={logo.name} fill sizes="76px" className="object-contain p-1.5" />
                                            </span>
                                        );
                                    })}
                                    {segment.note && <span className="text-xs font-medium text-muted-foreground">{segment.note}</span>}
                                </div>

                                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                                    {segment.link} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* The solutions pages main's picker linked to. Keep them: see src/data/home.ts. */}
                <LinkRow
                    label="More ways teams use Shelf:"
                    items={MORE_SOLUTIONS}
                    trailing={
                        <Link href="/solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                            All solutions <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    }
                />
            </Container>
        </section>
    );
}
