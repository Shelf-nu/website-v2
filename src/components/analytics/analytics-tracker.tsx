"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

/**
 * Analytics tracker — drop into the marketing layout.
 *
 * PostHog autocaptures pageviews and pageleaves (with time on page).
 * This component tracks scroll depth milestones as custom events.
 */
export function AnalyticsTracker() {
    const pathname = usePathname();
    const scrollMilestones = useRef(new Set<number>());

    /* ---- scroll_depth (25/50/75/100%) ---- */
    useEffect(() => {
        scrollMilestones.current = new Set();

        function onScroll() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;

            const pct = Math.round((scrollTop / docHeight) * 100);
            const milestones = [25, 50, 75, 100];

            for (const m of milestones) {
                if (pct >= m && !scrollMilestones.current.has(m)) {
                    scrollMilestones.current.add(m);
                    trackEvent("scroll_depth", {
                        depth: String(m),
                    });
                }
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [pathname]);

    return null;
}
