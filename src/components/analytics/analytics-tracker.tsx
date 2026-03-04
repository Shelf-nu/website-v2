"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, getUtmParams, getLandingPage } from "@/lib/analytics";

/**
 * Analytics tracker — drop into the marketing layout.
 *
 * Tracks:
 * - session_start (once per page load, with UTM params + landing page)
 * - page_view (on every route change, with referrer + UTM)
 * - scroll_depth (25 / 50 / 75 / 100% milestones)
 * - time_on_page (on navigation away or tab close)
 */
export function AnalyticsTracker() {
    const pathname = usePathname();
    const sessionStarted = useRef(false);
    const pageLoadTime = useRef(0);
    const scrollMilestones = useRef(new Set<number>());

    /* ---- session_start (once per page load) ---- */
    useEffect(() => {
        if (sessionStarted.current) return;
        sessionStarted.current = true;

        const utm = getUtmParams();
        trackEvent("session_start", {
            landing_page: window.location.pathname,
            referrer: document.referrer || "",
            ...utm,
        });
    }, []);

    /* ---- page_view (on every route change) ---- */
    useEffect(() => {
        pageLoadTime.current = Date.now();
        scrollMilestones.current = new Set();

        const utm = getUtmParams();
        trackEvent("page_view", {
            referrer: document.referrer || "",
            landing_page: getLandingPage(),
            ...utm,
        });
    }, [pathname]);

    /* ---- scroll_depth (25/50/75/100%) ---- */
    useEffect(() => {
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

    /* ---- time_on_page (on navigation away) ---- */
    useEffect(() => {
        function onBeforeUnload() {
            const seconds = Math.round((Date.now() - pageLoadTime.current) / 1000);
            if (seconds < 2) return; // Skip near-instant bounces
            trackEvent("time_on_page", {
                seconds: String(seconds),
            });
        }

        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [pathname]);

    return null;
}
