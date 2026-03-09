"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const FEATURE_LINKS = [
    { label: "Bookings", href: "/features/bookings" },
    { label: "Custody", href: "/features/custody" },
    { label: "Audits", href: "/features/audits" },
    { label: "Location Tracking", href: "/features/location-tracking" },
    { label: "Asset Pages", href: "/features/asset-pages" },
    { label: "Kits", href: "/features/kits" },
    { label: "Calendar", href: "/features/calendar" },
    { label: "Dashboard", href: "/features/dashboard" },
    { label: "Asset Search", href: "/features/asset-search" },
    { label: "Asset Reminders", href: "/features/asset-reminders" },
    { label: "Workspaces", href: "/features/workspaces" },
];

export function FeatureNavigationCTA() {
    return (
        <section className="py-24 sm:py-32 bg-background border-t border-border/40 relative overflow-hidden">
            {/* Background decorators */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <Container className="relative text-center">
                <ScrollReveal width="100%">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Explore <span className="text-orange-600">Shelf</span> features
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                        From bookings and custody to audits and location tracking — everything you need to manage your assets.
                    </p>

                    <div className="flex justify-center mb-16">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 text-white transition-all hover:scale-105" asChild>
                            <Link href="/features">
                                Start managing your assets now
                            </Link>
                        </Button>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
                            {FEATURE_LINKS.map((feature, i) => (
                                <motion.div
                                    key={feature.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={feature.href}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border hover:border-orange-200 hover:bg-orange-50/50 transition-colors text-sm font-medium text-muted-foreground hover:text-orange-700"
                                    >
                                        <ArrowRight className="h-4 w-4 text-orange-500" />
                                        {feature.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <Link
                            href="/features"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            View all features
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
