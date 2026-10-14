"use client";

import { useEffect } from "react";
import { recordFirstTouch, withFirstTouch } from "@/lib/first-touch";

/**
 * Signup attribution — drop into the marketing layout.
 *
 * Records the visitor's first page, then rewrites a signup link's href at the
 * moment it is used (click, middle-click, keyboard, or right-click "open in
 * new tab") so the app learns which page the person first came to. Rewriting
 * at use time covers every signup link on the site, including links inside
 * MDX content, without touching each one.
 */
export function SignupAttribution() {
    useEffect(() => {
        recordFirstTouch();

        function decorate(event: Event) {
            const target = event.target as Element | null;
            const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!anchor) return;
            const next = withFirstTouch(anchor.href);
            if (next !== anchor.href) anchor.href = next;
        }

        const events = ["pointerdown", "click", "auxclick", "contextmenu", "keydown"] as const;
        for (const name of events) document.addEventListener(name, decorate, { capture: true });
        return () => {
            for (const name of events) document.removeEventListener(name, decorate, { capture: true });
        };
    }, []);

    return null;
}
