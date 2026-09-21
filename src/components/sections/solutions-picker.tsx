import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { solutionIcons } from "@/data/solutions";

const PICKS = [
    {
        slug: "asset-tracking",
        title: "Track every asset",
        description: "Asset tracking software that keeps a live asset inventory: who has what, and where it is.",
    },
    {
        slug: "it-asset-management",
        title: "Track IT hardware",
        description: "IT asset management software for laptops, monitors and loaner devices, with a custody trail per device.",
    },
    {
        slug: "tool-tracking",
        title: "Keep tools from walking off",
        description: "Tool tracking across crews, vans and job sites, so you always know who took what.",
    },
    {
        slug: "equipment-check-in",
        title: "Check gear out and back in",
        description: "Equipment checkout software: scan a QR code to hand an item over, scan again on return.",
    },
    {
        slug: "equipment-reservations",
        title: "Let people book gear ahead",
        description: "An equipment reservation system with a calendar that stops double bookings. On the Team plan.",
    },
    {
        slug: "equipment-management",
        title: "Manage shared equipment",
        description: "Equipment management software for the cameras, laptops, tools and lab gear your team shares.",
    },
] as const;

export function SolutionsPicker() {
    return (
        <section className="py-24 bg-background">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-14">
                    <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-4">
                        Solutions
                    </p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-heading mb-5">
                        What do you need to track?
                    </h2>
                    <p className="text-lg text-caption leading-relaxed">
                        Pick the job you have. Each page shows how teams run it in Shelf.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PICKS.map((pick) => {
                        const Icon = solutionIcons[pick.slug];
                        return (
                            <Link key={pick.slug} href={`/solutions/${pick.slug}`} className="group block h-full">
                                <div className="h-full rounded-2xl bg-background border border-border/60 p-6 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100/60 dark:bg-orange-950/30 dark:border-orange-900/40 mb-5">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-orange-600 transition-colors">
                                        {pick.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {pick.description}
                                    </p>
                                    <div className="mt-4 flex items-center text-sm font-medium text-orange-600">
                                        See how it works <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/solutions"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        View all solutions
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
