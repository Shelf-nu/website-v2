"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CASE_STUDY_LINKS = [
    { label: "CES — $70K Equipment Recovery", href: "/case-studies/ces-70k-recovery" },
    { label: "Fabel Film — Zero Double Bookings", href: "/case-studies/fabel-film-double-bookings" },
    { label: "ResQ — 4,000+ Devices Tracked", href: "/case-studies/resq-contact-center" },
    { label: "HAARP — 7 Universities, 1 System", href: "/case-studies/haarp" },
    { label: "Eastern Michigan University", href: "/case-studies/eastern-michigan-university" },
    { label: "Arellano Associates", href: "/case-studies/arellano-associates" },
    { label: "Kansas City Art Institute", href: "/case-studies/kcai" },
];

export function FeatureNavigationCTA() {
    return (
        <section className="py-24 sm:py-32 bg-background border-t border-border/40 relative overflow-hidden">
            {/* Background decorators */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <Container className="relative text-center">
                <ScrollReveal width="100%">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        See how teams use <span className="text-orange-600">Shelf</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                        From recovering $70K in lost equipment to eliminating double bookings — real stories from real teams.
                    </p>

                    <div className="flex justify-center mb-16">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 text-white transition-all hover:scale-105" asChild>
                            <Link href="/pricing">
                                Start managing your assets now
                            </Link>
                        </Button>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
                            {CASE_STUDY_LINKS.map((study, i) => (
                                <motion.div
                                    key={study.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={study.href}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border hover:border-orange-200 hover:bg-orange-50/50 transition-colors text-sm font-medium text-muted-foreground hover:text-orange-700"
                                    >
                                        <ArrowRight className="h-4 w-4 text-orange-500" />
                                        {study.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <Link
                            href="/case-studies"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            View all case studies
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
