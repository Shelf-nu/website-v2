"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const FEATURE_LINKS = [
    { label: "Asset Tracking", href: "/solutions/asset-tracking" },
    { label: "Custody & Checkouts", href: "/features/custody" },
    { label: "Bookings", href: "/features/bookings" },
    { label: "Dashboard", href: "/features/dashboard" },
    { label: "Location Tracking", href: "/features/location-tracking" },
    { label: "Asset Reminders", href: "/features/asset-reminders" },
    { label: "Kits", href: "/features/kits" },
    { label: "Workspaces", href: "/features/workspaces" },
    { label: "Asset Search", href: "/features/asset-search" },
    { label: "Calendar", href: "/features/calendar" },
];

export function FeatureNavigationCTA() {
    return (
        <section className="py-24 sm:py-32 bg-background border-t border-border/40 relative overflow-hidden">
            {/* Background decorators */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <Container className="relative text-center">
                <ScrollReveal width="100%">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
                        Ready to sort out your <span className="text-orange-600">inventory</span>?
                    </h2>

                    <div className="flex justify-center mb-16">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 text-white transition-all hover:scale-105" asChild>
                            <Link href="/pricing">
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
                                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                                        {feature.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <Link
                            href="/features"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            See all features
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
