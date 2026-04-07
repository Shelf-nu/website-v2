/**
 * Analytics — thin wrapper around PostHog for custom event tracking.
 *
 * PostHog autocaptures pageviews, pageleaves, and clicks.
 * This module is for explicit custom events (demo form, pricing CTA, etc.)
 *
 * posthog-js is imported lazily on first use so it doesn't end up in the
 * initial bundle (~175KB). Events fired before the library loads are queued.
 */

type PostHogLike = { capture: (name: string, props?: Record<string, string>) => void };

let posthogClient: PostHogLike | null = null;
let loadingPromise: Promise<PostHogLike> | null = null;
const eventQueue: Array<{ name: string; props?: Record<string, string> }> = [];

function getPostHog(): Promise<PostHogLike> {
    if (posthogClient) return Promise.resolve(posthogClient);
    if (!loadingPromise) {
        loadingPromise = import("posthog-js").then(({ default: ph }) => {
            // The npm build does NOT queue capture() calls made before
            // init() (unlike the HTML snippet). If the provider hasn't
            // initialized yet, do a minimal init here so queued events
            // aren't silently lost. PostHog ignores a second init() call
            // with the same token, so no conflict with the provider.
            const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
            if (key) {
                ph.init(key, {
                    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
                    capture_pageview: false, // Provider handles pageviews
                    capture_pageleave: false,
                    autocapture: false,
                });
            }
            posthogClient = ph;
            // Flush queued events
            for (const evt of eventQueue) {
                ph.capture(evt.name, evt.props);
            }
            eventQueue.length = 0;
            return ph;
        });
    }
    return loadingPromise;
}

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

    const eventProps = {
        page_path: currentPath,
        referrer: document.referrer || "",
        ...props,
    };

    if (posthogClient) {
        posthogClient.capture(name, eventProps);
    } else {
        // Queue and trigger lazy load
        eventQueue.push({ name, props: eventProps });
        getPostHog();
    }
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
