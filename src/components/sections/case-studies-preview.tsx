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
        headline: "Recovered a lost drone kit using Shelf's QR labels — preventing weeks of project delays.",
        industry: "Utility Infrastructure",
    },
    {
        slug: "bullstv",
        company: "Chicago Bulls",
        logo: "/logos/chicago-bulls.png",
        stat: "Hours saved",
        statLabel: "every single week",
        headline: "BullsTV eliminated gear chaos and double bookings across their in-house production team.",
        industry: "Professional Sports",
    },
    {
        slug: "haarp",
        company: "HAARP",
        logo: "/logos/haarp.png",
        stat: "7 universities",
        statLabel: "under one system",
        headline: "Unified multi-university research assets across one of the most extreme environments on Earth.",
        industry: "Scientific Research",
    },
    {
        slug: "eastern-michigan-university",
        company: "Eastern Michigan University",
        logo: "/logos/eastern-michigan-university.png",
        stat: "Streamlined",
        statLabel: "student workflows",
        headline: "Improved equipment accountability and scheduling across theatre and media departments.",
        industry: "Higher Education",
    },
    {
        slug: "fabel-film-double-bookings",
        company: "Fabel Film",
        logo: "/logos/fabel-film.jpg",
        stat: "Zero",
        statLabel: "double bookings",
        headline: "Went from managing gear in one person's head to a system the whole team trusts.",
        industry: "Video Production",
    },
];

export function CaseStudiesPreview() {
    return (
        <section className="relative overflow-hidden">
            {/* Full-width background — dark on light pages, elevated on dark pages */}
            <div className="absolute inset-0 bg-zinc-950 dark:bg-zinc-800/40" />
            {/* Subtle radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-500/8 dark:bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />
            {/* Top/bottom border lines for dark mode separation */}
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
                            From professional sports to scientific research — teams across every industry trust Shelf to manage their assets.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Featured case study — full width hero card */}
                <ScrollReveal width="100%">
                    <Link
                        href={`/case-studies/${CASE_STUDIES[0].slug}`}
                        className="group block mb-8"
                    >
                        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-12 overflow-hidden transition-all hover:border-orange-500/30 hover:bg-white/[0.07]">
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />

                            <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 p-1.5">
                                            <Image
                                                src={CASE_STUDIES[0].logo}
                                                alt={CASE_STUDIES[0].company}
                                                width={40}
                                                height={40}
                                                className="h-full w-auto object-contain rounded"
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300">
                                            {CASE_STUDIES[0].company}
                                        </span>
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 font-medium">
                                            {CASE_STUDIES[0].industry}
                                        </span>
                                    </div>
                                    <p className="text-xl md:text-2xl font-semibold text-white leading-snug mb-5">
                                        {CASE_STUDIES[0].headline}
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                                        Read the full story
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                                <div className="flex-shrink-0 text-center md:text-right">
                                    <div className="text-5xl md:text-7xl font-extrabold text-orange-500 tracking-tight leading-none">
                                        {CASE_STUDIES[0].stat}
                                    </div>
                                    <div className="text-sm font-medium text-zinc-400 mt-2">
                                        {CASE_STUDIES[0].statLabel}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </ScrollReveal>

                {/* Grid of remaining case studies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {CASE_STUDIES.slice(1).map((study, i) => (
                        <motion.div
                            key={study.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                href={`/case-studies/${study.slug}`}
                                className="group block h-full rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-orange-500/30 hover:bg-white/[0.07]"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 p-1.5 flex-shrink-0">
                                        <Image
                                            src={study.logo}
                                            alt={study.company}
                                            width={32}
                                            height={32}
                                            className="h-full w-auto object-contain rounded"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-white truncate">{study.company}</div>
                                        <div className="text-xs text-zinc-500">{study.industry}</div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <span className="text-2xl font-bold text-orange-500">{study.stat}</span>
                                    <span className="text-xs text-zinc-500 ml-2">{study.statLabel}</span>
                                </div>

                                <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                                    {study.headline}
                                </p>

                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                                    Read story
                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View all CTA */}
                <div className="text-center">
                    <Button variant="outline" size="lg" className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 h-12 px-8" asChild>
                        <Link href="/case-studies">
                            View all case studies
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </Container>
        </section>
    );
}
