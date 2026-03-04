/**
 * Lightweight analytics — sends custom events to a Supabase Edge Function.
 *
 * - Uses `navigator.sendBeacon()` (fire-and-forget, non-blocking)
 * - Generates a random session ID per page load (no cookies, no fingerprinting)
 * - Silently no-ops if the endpoint is unavailable or in dev mode
 */

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "";

/* One random session ID per page load (not persisted across navigations) */
let sessionId: string | undefined;
function getSessionId(): string {
    if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    return sessionId;
}

/* Session-level state for attribution */
let landingPage: string | undefined;
const pagesViewed: string[] = [];

export function getLandingPage(): string {
    return landingPage || "";
}

export function getPagesViewed(): string[] {
    return pagesViewed;
}

/**
 * Track a custom analytics event.
 *
 * @param name  - Event name (e.g. "signup_click", "demo_form_submit")
 * @param props - Optional key-value properties to attach
 */
export function trackEvent(
    name: string,
    props?: Record<string, string>,
): void {
    if (typeof window === "undefined") return;
    if (!ANALYTICS_ENDPOINT) return;

    // Capture landing page on first event
    if (!landingPage) {
        landingPage = window.location.pathname;
    }

    // Track pages visited in this session
    const currentPath = window.location.pathname;
    if (!pagesViewed.includes(currentPath)) {
        pagesViewed.push(currentPath);
    }

    const payload = {
        event_name: name,
        page_path: currentPath,
        properties: props || {},
        session_id: getSessionId(),
        referrer: document.referrer || "",
    };

    try {
        const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
        });
        navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    } catch {
        // Silently fail — analytics should never break the site
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
