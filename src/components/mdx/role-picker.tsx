"use client";

/**
 * RolePicker — an interactive "set up a person in 10 seconds" helper for the
 * User Roles & Permissions KB article.
 *
 * Two yes/no questions collapse the role + visibility-toggle decision into a
 * single instant answer, so a reader doesn't have to parse the full permissions
 * matrix or hop to the visibility-settings article to find out how to restrict
 * access. Renders inside MDX (registered in mdx-content.tsx).
 */

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

type YesNo = "yes" | "no" | null;

/** Resolves the two answers into a role + visibility recommendation. */
function getRecommendation(selfCheckout: YesNo, seeOthers: YesNo) {
    const role = selfCheckout === "yes" ? "Self-service" : "Base";
    const roleWhy =
        selfCheckout === "yes"
            ? "they check equipment out and back in on their own"
            : "they submit booking requests and an admin approves and hands over the gear";
    const toggle = seeOthers === "yes" ? "on" : "off";
    const toggleWhy =
        seeOthers === "yes"
            ? "they can see who has what across the workspace"
            : "they only see the equipment involved in their own custody and bookings";
    return { role, roleWhy, toggle, toggleWhy };
}

function QuestionRow({
    label,
    value,
    onChange,
}: {
    label: string;
    value: YesNo;
    onChange: (v: "yes" | "no") => void;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[0.95rem] font-medium text-foreground">{label}</span>
            <div className="flex shrink-0 gap-2">
                {(["yes", "no"] as const).map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        aria-pressed={value === opt}
                        className={cn(
                            "min-w-[64px] rounded-lg border px-4 py-1.5 text-sm font-semibold capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                            value === opt
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-border bg-background text-muted-foreground hover:border-orange-400 hover:text-foreground",
                        )}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function RolePicker() {
    const [selfCheckout, setSelfCheckout] = useState<YesNo>(null);
    const [seeOthers, setSeeOthers] = useState<YesNo>(null);

    const answered = selfCheckout !== null && seeOthers !== null;
    const rec = answered ? getRecommendation(selfCheckout, seeOthers) : null;

    /** Fire a single completion event once both answers are in. */
    function handleAnswer(
        which: "self_checkout" | "see_others",
        v: "yes" | "no",
    ) {
        const nextSelf = which === "self_checkout" ? v : selfCheckout;
        const nextSee = which === "see_others" ? v : seeOthers;
        if (which === "self_checkout") setSelfCheckout(v);
        else setSeeOthers(v);

        if (nextSelf !== null && nextSee !== null) {
            const r = getRecommendation(nextSelf, nextSee);
            trackEvent("role_picker_completed", {
                self_checkout: nextSelf,
                see_others: nextSee,
                role: r.role,
                custody_visibility: r.toggle,
            });
        }
    }

    function reset() {
        setSelfCheckout(null);
        setSeeOthers(null);
    }

    return (
        <div className="not-prose my-8 overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="border-b border-border/60 bg-muted/40 px-5 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                    Set up a person in 10 seconds
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Answer two questions and we&apos;ll tell you the exact role and setting to use.
                </p>
            </div>

            <div className="flex flex-col gap-4 px-5 py-4">
                <QuestionRow
                    label="Should they check gear out and back in themselves?"
                    value={selfCheckout}
                    onChange={(v) => handleAnswer("self_checkout", v)}
                />
                <div className="h-px bg-border/50" />
                <QuestionRow
                    label="Should they see equipment other people are using?"
                    value={seeOthers}
                    onChange={(v) => handleAnswer("see_others", v)}
                />
            </div>

            {rec && (
                <div className="border-t border-border/60 bg-orange-50/50 px-5 py-4 dark:bg-orange-950/20">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
                            <Check className="h-3.5 w-3.5" />
                        </span>
                        <div className="text-[0.95rem] leading-relaxed text-foreground">
                            Use the{" "}
                            <strong className="text-orange-700 dark:text-orange-400">
                                {rec.role}
                            </strong>{" "}
                            role — {rec.roleWhy}. Turn custody &amp; booking visibility{" "}
                            <strong>{rec.toggle}</strong> so {rec.toggleWhy}.
                            <span className="mt-1 block text-xs text-muted-foreground">
                                Set the toggles in <strong>Settings ▸ Workspace ▸ Permissions</strong>. Need someone to manage inventory, people, or settings? That&apos;s an{" "}
                                <strong>Administrator</strong>.
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={reset}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Start over
                    </button>
                </div>
            )}
        </div>
    );
}
