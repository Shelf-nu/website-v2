"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CASE_STUDIES = [
    {
        slug: "ces-70k-recovery",
        company: "CES Utility Solutions",
        logo: "/logos/ces-utility.jpeg",
        stat: "$70K",
        statLabel: "in equipment recovered",
        headline:
            "Recovered a lost drone kit using Shelf's QR labels — preventing weeks of project delays.",
        industry: "Utility Infrastructure",
    },
    {
        slug: "bullstv",
        company: "Chicago Bulls",
        logo: "/logos/chicago-bulls.png",
        stat: "Hours saved",
        statLabel: "every single week",
        headline:
            "BullsTV eliminated gear chaos and double bookings across their in-house production team.",
        industry: "Professional Sports",
    },
    {
        slug: "haarp",
        company: "HAARP",
        logo: "/logos/haarp.png",
        stat: "7 universities",
        statLabel: "under one system",
        headline:
            "Unified multi-university research assets across one of the most extreme environments on Earth.",
        industry: "Scientific Research",
    },
    {
        slug: "eastern-michigan-university",
        company: "Eastern Michigan University",
        logo: "/logos/eastern-michigan-university.png",
        stat: "Streamlined",
        statLabel: "student workflows",
        headline:
            "Improved equipment accountability and scheduling across theatre and media departments.",
        industry: "Higher Education",
    },
    {
        slug: "fabel-film-double-bookings",
        company: "Fabel Film",
        logo: "/logos/fabel-film.jpg",
        stat: "Zero",
        statLabel: "double bookings",
        headline:
            "Went from managing gear in one person's head to a system the whole team trusts.",
        industry: "Video Production",
    },
];

function CaseStudyCard({
    study,
    index,
}: {
    study: (typeof CASE_STUDIES)[number];
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
            className={`lg:col-span-2 ${index === 3 ? "lg:col-start-2" : ""}`}
        >
            <Link
                href={`/case-studies/${study.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 transition-all duration-300 hover:border-orange-500/25 hover:bg-white/[0.06]"
            >
                {/* Company */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 p-1.5 flex-shrink-0">
                        <Image
                            src={study.logo}
                            alt={study.company}
                            width={36}
                            height={36}
                            className="h-full w-auto object-contain rounded-md"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                            {study.company}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {study.industry}
                        </div>
                    </div>
                </div>

                {/* Stat */}
                <div className="mb-4">
                    <div className="text-3xl font-bold text-orange-500 tracking-tight leading-none">
                        {study.stat}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1.5">
                        {study.statLabel}
                    </div>
                </div>

                {/* Headline */}
                <p className="text-sm text-zinc-400 leading-relaxed flex-1 mb-6">
                    {study.headline}
                </p>

                {/* CTA */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                    Read story
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
            </Link>
        </motion.div>
    );
}

export function CaseStudiesPreview() {
    return (
        <section className="relative overflow-hidden">
            {/* Background — dark on light pages, elevated on dark pages */}
            <div className="absolute inset-0 bg-zinc-950 dark:bg-zinc-800/40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/[0.06] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06] hidden dark:block" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06] hidden dark:block" />

            <Container className="relative py-24 sm:py-32">
                <ScrollReveal width="100%">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-4">
                            Case Studies
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
                            See how teams use Shelf
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            From professional sports to scientific research —
                            teams across every industry trust Shelf to manage
                            their assets.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Uniform grid: 3 top + 2 bottom centered */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 mb-14">
                    {CASE_STUDIES.map((study, i) => (
                        <CaseStudyCard key={study.slug} study={study} index={i} />
                    ))}
                </div>

                {/* CTA */}
                <ScrollReveal width="100%">
                    <div className="text-center">
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 h-12 px-8"
                            asChild
                        >
                            <Link href="/case-studies">
                                View all case studies
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
