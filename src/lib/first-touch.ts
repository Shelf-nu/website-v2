/**
 * First-touch attribution for signups.
 *
 * Remembers the first page a visitor landed on (and the site that sent them)
 * for 90 days, and adds it to signup links as `utm_campaign`, which the app
 * stores with the new account (UserBusinessIntel.utmCampaign). Without it,
 * only ~5% of signups said which website page they came from, so we could
 * count clicks per page but not paying customers per page.
 *
 * Format: `lp:<path>|r:<referrer host>`, kept within the app's 100-character
 * limit for utm values. Existing utm parameters on a link are never replaced.
 *
 * Browser storage can be missing (private mode, blocked site data), so every
 * access is wrapped and the site works the same without it.
 */

const STORAGE_KEY = "shelf_first_touch";
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_UTM_LENGTH = 100;
const SIGNUP_HOST = "app.shelf.nu";

type FirstTouch = { path: string; ref: string; at: number };

function referrerHost(): string {
    try {
        if (!document.referrer) return "direct";
        const host = new URL(document.referrer).hostname.replace(/^www\./, "");
        // Moving between our own pages is not a referral.
        return host.endsWith("shelf.nu") ? "internal" : host;
    } catch {
        return "unknown";
    }
}

function read(): FirstTouch | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as FirstTouch;
        if (!value?.path || typeof value.at !== "number") return null;
        if (Date.now() - value.at > MAX_AGE_MS) return null;
        return value;
    } catch {
        return null;
    }
}

/** Store the current page as the first touch, unless one is already stored. */
export function recordFirstTouch(): void {
    if (typeof window === "undefined") return;
    if (read()) return;
    const value: FirstTouch = { path: window.location.pathname, ref: referrerHost(), at: Date.now() };
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Storage unavailable: the in-page fallback below still covers this visit.
    }
}

/** The `utm_campaign` value for this visitor, or null if nothing is known. */
export function firstTouchCampaign(): string | null {
    if (typeof window === "undefined") return null;
    const touch = read() ?? { path: window.location.pathname, ref: referrerHost(), at: Date.now() };
    const suffix = `|r:${touch.ref}`.slice(0, 40);
    const prefix = "lp:";
    const path = touch.path.slice(0, MAX_UTM_LENGTH - prefix.length - suffix.length);
    return `${prefix}${path}${suffix}`;
}

/** True for links to the app's signup page. */
export function isSignupLink(url: URL): boolean {
    return url.hostname === SIGNUP_HOST && url.pathname.startsWith("/join");
}

/**
 * Add first-touch attribution to a signup URL. Leaves any utm value that is
 * already on the link untouched.
 */
export function withFirstTouch(href: string): string {
    let url: URL;
    try {
        url = new URL(href, window.location.href);
    } catch {
        return href;
    }
    if (!isSignupLink(url)) return href;
    const campaign = firstTouchCampaign();
    if (campaign && !url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", campaign);
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "shelf_website");
    return url.toString();
}
