"use client";

import { useRef, useEffect, useState, memo, startTransition } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import {
    Box,
    Users,
    History,
    CalendarCheck,
    Smartphone,
    BellRing,
    FileCheck2,
} from "lucide-react";

// =============================================================================
// LAYOUT & DATA
// =============================================================================

type CardId = "assets" | "custody" | "history" | "people" | "bookings" | "reminders" | "audits";

interface FlowStep {
    id: string;
    eyebrow: string;
    headline: string;
    body: string;
    activeCards: CardId[];
    testimonial?: {
        quote: string;
        author: string;
        role: string;
    };
}

const STEPS: FlowStep[] = [
    {
        id: "overview",
        eyebrow: "The Ecosystem",
        headline: "A fully integrated suite",
        body: "Reduce costs and run your operations more efficiently on a single, connected platform. Every part of Shelf communicates with the core.",
        activeCards: ["assets", "custody", "history", "people", "bookings", "reminders", "audits"]
    },
    {
        id: "bookings",
        eyebrow: "Input",
        headline: "Bookings & Reservations",
        body: "Plan ahead. Reserve equipment for shoots, jobs, or classes. Shelf checks availability instantly so you never double-book.",
        activeCards: ["bookings", "custody"],
        testimonial: {
            quote: "We can realistically assess future project capacity now. I can answer quickly if a piece of equipment can be used.",
            author: "Katharina W.",
            role: "Managing Director"
        }
    },
    {
        id: "custody",
        eyebrow: "Core State",
        headline: "Custody Management",
        body: "Know exactly who has what. Check-outs are linked to real people, enforcing accountability for every single item.",
        activeCards: ["custody", "people", "assets"],
        testimonial: {
            quote: "If an asset has no return date, we use custody. It ensures there is never a gap in ownership.",
            author: "Marcus C.",
            role: "Head of Production"
        }
    },
    {
        id: "reminders",
        eyebrow: "Automation",
        headline: "Automated Reminders",
        body: "The system chases people for you. Automated nudges verify possession and prompt returns before they become overdue.",
        activeCards: ["reminders", "custody"],
    },
    {
        id: "audits",
        eyebrow: "Compliance",
        headline: "Audits & Verification",
        body: "Proof over memory. Perform spot checks, scan locations, and resolve disputes with hard data.",
        activeCards: ["audits", "custody", "history"],
        testimonial: {
            quote: "Audit times were cut by 90%. What took days now takes hours.",
            author: "Sarah J.",
            role: "Inventory Manager"
        }
    },
    {
        id: "history",
        eyebrow: "Intelligence",
        headline: "Full History",
        body: "Every scan, checkout, and comment is logged forever. Build a complete lifecycle story for every asset.",
        activeCards: ["history", "assets", "custody", "audits"]
    }
];

// =============================================================================
// COMPONENT
// =============================================================================

export function SystemGraphic() {
    const [activeStepIdx, setActiveStepIdx] = useState(0);

    return (
        <section className="relative bg-white border-y border-zinc-200">
            <Container>
                <div className="lg:grid lg:grid-cols-12 gap-12 relative">

                    {/* STICKY GRAPHIC (Right Side / Bottom on Mobile) */}
                    <div className="hidden lg:flex lg:col-span-7 lg:col-start-6 lg:order-2 h-[calc(100vh-4rem)] sticky top-20 items-center justify-center pointer-events-none select-none z-10">
                        <BentoGrid activeCards={STEPS[activeStepIdx].activeCards} />
                    </div>

                    {/* SCROLL NARRATIVE (Left Side) */}
                    <div className="lg:col-span-5 lg:col-start-1 lg:order-1 relative z-20 pb-24 pt-24">
                        {STEPS.map((step, index) => (
                            <NarrativeStep
                                key={step.id}
                                step={step}
                                index={index}
                                setActiveStep={setActiveStepIdx}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const NarrativeStep = memo(function NarrativeStep({ step, index, setActiveStep }: { step: FlowStep; index: number; setActiveStep: (i: number) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) startTransition(() => setActiveStep(index)); }),
            { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
        );
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [index, setActiveStep]);

    return (
        <div ref={ref} className="min-h-[60vh] flex flex-col justify-center py-20 lg:py-0 px-4 lg:px-0">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true }}
                className="space-y-6 max-w-md"
            >
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 ring-4 ring-white">
                        {index + 1}
                    </span>
                    <p className="text-orange-600 font-medium text-sm tracking-wider uppercase">{step.eyebrow}</p>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">{step.headline}</h3>
                <p className="text-lg text-zinc-600 leading-relaxed text-pretty">{step.body}</p>

                {step.testimonial && (
                    <div className="mt-6 pt-6 border-t border-zinc-200">
                        <blockquote className="text-base text-zinc-500 italic mb-3">&quot;{step.testimonial.quote}&quot;</blockquote>
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                {step.testimonial.author.charAt(0)}
                            </div>
                            <div className="text-xs text-zinc-400 font-medium">
                                <span className="text-zinc-900">{step.testimonial.author}</span> — {step.testimonial.role}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
});

function BentoGrid({ activeCards }: { activeCards: CardId[] }) {
    // Helper to check if a card is active
    const isActive = (id: CardId) => activeCards.includes(id);

    return (
        <div className="relative w-full max-w-[640px] aspect-square p-8">
            {/* CSS GRID LAYOUT */}
            <div className="grid grid-cols-3 grid-rows-3 gap-6 w-full h-full relative z-10">

                {/* 1. INPUTS (Left Column) */}
                <BentoCard
                    id="bookings"
                    label="Bookings"
                    icon={CalendarCheck}
                    isActive={isActive("bookings")}
                    className="col-start-1 row-start-1"
                />

                <BentoCard
                    id="people"
                    label="People"
                    icon={Users}
                    isActive={isActive("people")}
                    className="col-start-1 row-start-2"
                />

                {/* 2. CORE SPINE (Center Column) */}
                <BentoCard
                    id="assets"
                    label="Assets"
                    icon={Box}
                    isActive={isActive("assets")}
                    className="col-start-2 row-start-1 bg-gradient-to-b from-white to-zinc-50"
                    variant="primary"
                />

                <BentoCard
                    id="custody"
                    label="Custody"
                    icon={Smartphone}
                    isActive={isActive("custody")}
                    className="col-start-2 row-start-2"
                    variant="primary"
                />

                <BentoCard
                    id="history"
                    label="History"
                    icon={History}
                    isActive={isActive("history")}
                    className="col-start-2 row-start-3"
                />

                {/* 3. OUTPUTS & MECHANISMS (Right Column) */}
                <BentoCard
                    id="reminders"
                    label="Reminders"
                    icon={BellRing}
                    isActive={isActive("reminders")}
                    className="col-start-3 row-start-2"
                />

                <BentoCard
                    id="audits"
                    label="Audits"
                    icon={FileCheck2}
                    isActive={isActive("audits")}
                    className="col-start-3 row-start-3"
                />

            </div>

            {/* Background Glow for Active State */}
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100/50 via-transparent to-transparent opacity-50 rounded-full blur-3xl -z-10" />
        </div>
    );
}

interface BentoCardProps {
    id: string;
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    className?: string;
    variant?: "default" | "primary";
}

const BentoCard = memo(function BentoCard({ label, icon: Icon, isActive, className }: BentoCardProps) {
    return (
        <motion.div
            initial={false}
            animate={{
                opacity: isActive ? 1 : 0.3,
                scale: isActive ? 1 : 0.95,
                borderColor: isActive ? "#f97316" : "transparent",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border border-transparent bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all",
                isActive && "shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] bg-white",
                className
            )}
        >
            <div className={cn(
                "p-3 rounded-full mb-3",
                isActive ? "bg-orange-50 text-orange-600" : "bg-zinc-100 text-zinc-400"
            )}>
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
            </div>
            <span className={cn(
                "text-sm font-semibold tracking-tight",
                isActive ? "text-zinc-900" : "text-zinc-400"
            )}>
                {label}
            </span>

            {/* Active Indictor Dot */}
            {isActive && (
                <motion.div
                    className="absolute top-3 right-3 w-1.5 h-1.5 bg-green-500 rounded-full"
                />
            )}
        </motion.div>
    );
});
