"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Box, Boxes, Layers, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

/**
 * Interactive version of the "How should you track it in Shelf?" decision
 * chart. Walks the same four questions as the static flowchart and ends in
 * one of three recommendations: individual assets, Asset Models, or
 * quantity tracking. Copy mirrors the CTO-approved chart; keep the two in
 * sync when the product changes.
 */

type MethodId = "individual" | "models" | "quantity";
type QuestionId = "q1" | "q2" | "q3" | "q4";
type NodeId = QuestionId | MethodId;

interface QuizQuestion {
    question: string;
    hint: string;
    yes: NodeId;
    no: NodeId;
}

const QUESTIONS: Record<QuestionId, QuizQuestion> = {
    q1: {
        question: "Do you have several identical ones of this item?",
        hint: "one projector vs a bin of 200 cables",
        yes: "q2",
        no: "individual",
    },
    q2: {
        question: "Do you need to know which exact unit each person has?",
        hint: "serial numbers, per-unit condition or history",
        yes: "models",
        no: "q3",
    },
    q3: {
        question: "Are the items used up over time?",
        hint: "tape, gels, batteries: things you do not expect to get back",
        yes: "quantity",
        no: "q4",
    },
    q4: {
        question: "Does each unit carry its own QR label?",
        hint: "a printed code stuck on every piece",
        yes: "models",
        no: "quantity",
    },
};

interface QuizResult {
    name: string;
    tagline: string;
    icon: typeof Box;
    barClass: string;
    dotClass: string;
    bullets: string[];
    greatFor: string;
    note: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
}

const RESULTS: Record<MethodId, QuizResult> = {
    individual: {
        name: "Individual assets",
        tagline: "The default: one record per item",
        icon: Box,
        barClass: "bg-slate-500",
        dotClass: "bg-slate-500",
        bullets: [
            "One item, one record, one QR label",
            "Book it, assign custody, audit it",
            "Full history for that exact item",
        ],
        greatFor: "Unique gear: the projector, the drone, the van.",
        note: "You choose individual or quantity tracking when you create an item; that choice cannot be switched later.",
        primaryHref: "/features/asset-pages",
        primaryLabel: "See how asset records work",
        secondaryHref: "/features/custody",
        secondaryLabel: "How custody works",
    },
    models: {
        name: "Asset Models",
        tagline: "Individual units, grouped by model",
        icon: Layers,
        barClass: "bg-orange-600",
        dotClass: "bg-orange-600",
        bullets: [
            "Every unit is its own record with its own QR label and history",
            "Identical units grouped under one model",
            'Book by model: reserve "4x HDMI cable", scan any 4 at pickup',
            "Always know exactly who has which unit",
            "Maintenance reminders and audit trail per unit",
        ],
        greatFor:
            "Fleets of cameras, lenses, laptops, audio gear: anything with a serial number or a life of its own.",
        note: "Grouping items under an Asset Model can be done or undone at any time.",
        primaryHref: "/features/bookings#book-by-model",
        primaryLabel: "See book-by-model bookings",
        secondaryHref: "/glossary/asset-models",
        secondaryLabel: "What is an Asset Model?",
    },
    quantity: {
        name: "Quantity tracking",
        tagline: "One record with a count",
        icon: Boxes,
        barClass: "bg-zinc-900 dark:bg-zinc-100",
        dotClass: "bg-zinc-900 dark:bg-zinc-100",
        bullets: [
            'One entry for the whole stock, e.g. "Gaffer tape, 200 pcs"',
            "Book or check out part of the stock: 4 out of 200",
            "Low-stock alerts when you drop below your threshold",
            "One-way mode for consumables, two-way for returnables",
            "Split the count across multiple locations",
        ],
        greatFor:
            "Cables, adapters, tape, batteries, expendables: interchangeable stock where only the count matters.",
        note: "You choose individual or quantity tracking when you create an item; that choice cannot be switched later.",
        primaryHref: "/features/consumables-tracking",
        primaryLabel: "Explore consumables tracking",
        secondaryHref: "/glossary/quantity-tracked-assets",
        secondaryLabel: "What are quantity-tracked assets?",
    },
};

type Step = { id: QuestionId; answer: "yes" | "no" };

export function TrackingMethodQuiz() {
    const [trail, setTrail] = useState<Step[]>([]);
    const startedRef = useRef(false);

    const current: NodeId = trail.reduce<NodeId>(
        (node, step) => QUESTIONS[step.id][step.answer],
        "q1"
    );

    const answer = (choice: "yes" | "no") => {
        const questionId = current as QuestionId;
        const nextTrail = [...trail, { id: questionId, answer: choice }];
        if (!startedRef.current) {
            startedRef.current = true;
            trackEvent("tracking_quiz_started");
        }
        const next = QUESTIONS[questionId][choice];
        if (next === "individual" || next === "models" || next === "quantity") {
            trackEvent("tracking_quiz_completed", {
                result: next,
                path: nextTrail.map((s) => `${s.id}:${s.answer}`).join(" "),
            });
        }
        setTrail(nextTrail);
    };

    const goBack = () => setTrail(trail.slice(0, -1));
    const restart = () => {
        startedRef.current = false;
        setTrail([]);
    };

    const isResult = current === "individual" || current === "models" || current === "quantity";

    return (
        <div className="not-prose my-8 rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="text-center px-6 pt-8 pb-2">
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">
                    Decision helper
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                    How should you track it in Shelf?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Answer up to four questions to find the right method for one item type.
                </p>
            </div>

            <div className="px-6 py-6" aria-live="polite">
                {!isResult ? (
                    <QuestionCard
                        step={trail.length + 1}
                        question={QUESTIONS[current as QuestionId]}
                        onAnswer={answer}
                        onBack={trail.length > 0 ? goBack : undefined}
                    />
                ) : (
                    <ResultCard result={RESULTS[current as MethodId]} onBack={goBack} onRestart={restart} />
                )}
            </div>

            <div className="border-t border-border/30 px-6 py-4 bg-muted/20">
                <p className="text-xs text-muted-foreground text-center">
                    Answer per item type: most workspaces mix all three methods freely.
                </p>
            </div>
        </div>
    );
}

function QuestionCard({
    step,
    question,
    onAnswer,
    onBack,
}: {
    step: number;
    question: QuizQuestion;
    onAnswer: (choice: "yes" | "no") => void;
    onBack?: () => void;
}) {
    return (
        <div className="rounded-xl border border-border/40 bg-muted/30 p-5 sm:p-8 text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Question {step} of up to 4
            </p>
            <p className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
                {question.question}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{question.hint}</p>
            <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                    onClick={() => onAnswer("yes")}
                    className="min-w-28 bg-orange-600 hover:bg-orange-700 text-white"
                >
                    Yes
                </Button>
                <Button onClick={() => onAnswer("no")} variant="outline" className="min-w-28">
                    No
                </Button>
            </div>
            {onBack && (
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-5"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                </button>
            )}
        </div>
    );
}

function ResultCard({
    result,
    onBack,
    onRestart,
}: {
    result: QuizResult;
    onBack: () => void;
    onRestart: () => void;
}) {
    const Icon = result.icon;
    return (
        <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className={`h-1.5 ${result.barClass}`} />
            <div className="p-5 sm:p-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Our recommendation
                </p>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-foreground leading-tight">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.tagline}</p>
                    </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                    {result.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5 text-sm text-foreground/80">
                            <span
                                className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${result.dotClass}`}
                            />
                            {bullet}
                        </li>
                    ))}
                </ul>
                <div className="mt-5 border-t border-border/40 pt-4">
                    <p className="text-sm">
                        <span className="font-semibold text-foreground">Great for: </span>
                        <span className="text-muted-foreground">{result.greatFor}</span>
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-2">{result.note}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-6">
                    <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Link href={result.primaryHref}>{result.primaryLabel}</Link>
                    </Button>
                    <Link
                        href={result.secondaryHref}
                        className="text-sm font-medium text-foreground underline decoration-orange-500/30 decoration-2 underline-offset-4 hover:decoration-orange-500 transition-all"
                    >
                        {result.secondaryLabel}
                    </Link>
                </div>
                <div className="flex items-center gap-4 mt-5">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                    </button>
                    <button
                        onClick={onRestart}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Start over
                    </button>
                </div>
            </div>
        </div>
    );
}
