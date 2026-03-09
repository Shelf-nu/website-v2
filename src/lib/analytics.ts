/**
 * Analytics — thin wrapper around PostHog for custom event tracking.
 *
 * PostHog autocaptures pageviews, pageleaves, and clicks.
 * This module is for explicit custom events (demo form, pricing CTA, etc.)
 */

import posthog from "posthog-js";

/* Session-level state for attribution (used by demo form) */
let landingPage: string | undefined;
const pagesViewed: string[] = [];

export function getLandingPage(): string {
    return landingPage || "";
}

export function getPagesViewed(): string[] {
    return pagesViewed;
}

/**
 * Track a custom analytics event via PostHog.
 *
 * @param name  - Event name (e.g. "signup_click", "demo_form_submit")
 * @param props - Optional key-value properties to attach
 */
export function trackEvent(
    name: string,
    props?: Record<string, string>,
): void {
    if (typeof window === "undefined") return;

    // Capture landing page on first event
    if (!landingPage) {
        landingPage = window.location.pathname;
    }

    // Track pages visited in this session
    const currentPath = window.location.pathname;
    if (!pagesViewed.includes(currentPath)) {
        pagesViewed.push(currentPath);
    }

    posthog.capture(name, {
        page_path: currentPath,
        referrer: document.referrer || "",
        ...props,
    });
}

/**
 * Extract UTM parameters from the current URL.
 */
export function getUtmParams(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
        const val = params.get(key);
        if (val) utm[key] = val;
    }
    return utm;
}
