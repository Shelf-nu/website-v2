"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * A native <details> row. The answer is in the static HTML whether or not it
 * is open, and `name` makes the group exclusive without any JavaScript. The
 * only script here is the tracking: which question a visitor opens tells us
 * what they are worried about.
 */
export function QuestionItem({ id, defaultOpen, summary, children }: { id: string; defaultOpen?: boolean; summary: ReactNode; children: ReactNode }) {
    return (
        <details
            name="home-questions"
            open={defaultOpen}
            className="group border-b border-border-subtle first:border-t"
            onToggle={(event) => {
                if (event.currentTarget.open) trackEvent("home_question_open", { question: id });
            }}
        >
            {summary}
            {children}
        </details>
    );
}

/** Opens the Crisp chat when it is loaded; otherwise falls back to the contact page. */
export function AskTheTeamButton({ className }: { className?: string }) {
    return (
        <button
            type="button"
            className={className}
            onClick={() => {
                trackEvent("home_interact", { element: "ask_the_team", value: "questions" });
                // Declared in src/lib/crisp.ts; undefined until the chat widget has been scheduled.
                if (Array.isArray(window.$crisp)) {
                    window.$crisp.push(["do", "chat:open"]);
                } else {
                    window.location.href = "/contact";
                }
            }}
        >
            Ask the team
        </button>
    );
}
