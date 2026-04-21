"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackEvent } from "@/lib/analytics";

/**
 * PostHog bootstrap — lazy-initializes posthog-js after the browser is
 * idle, keeping the 175KB client off the critical path.
 *
 * No React-tree wrapping. The previous implementation switched between
 * `<>{children}</>` and `<PHProvider>{children}</PHProvider>` once the
 * lazy import resolved, which changed the parent component type at the
 * root of the app and caused React to unmount-and-remount *every* client
 * component below. That wiped local state (search dialog open, mobile
 * menu open, anything in-flight) ~1s after first paint — visible as a
 * "glitch" on fast interactions.
 *
 * Instead:
 *  - Init posthog-js in a useEffect on mount. Identity of this component
 *    never changes, so no remount.
 *  - Fire `$pageview` on every `pathname` change (replaces the auto-
 *    pageview behavior that PHProvider used to do).
 *  - `trackEvent()` in lib/analytics talks to the posthog-js module
 *    global directly — no React context needed, and nothing in the
 *    repo uses `usePostHog()`.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!key) {
            console.warn("[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY — analytics disabled");
            return;
        }

        const schedule = typeof requestIdleCallback === "function"
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 3000);

        // Delegate the lazy load + init to lib/analytics so both this
        // provider and any `trackEvent` caller share one init path with
        // matching config — first-init-wins, same result either way.
        const id = schedule(() => {
            initAnalytics();
        });

        return () => {
            if (typeof requestIdleCallback === "function") {
                cancelIdleCallback(id as number);
            } else {
                clearTimeout(id as ReturnType<typeof setTimeout>);
            }
        };
    }, []);

    // Fire a $pageview on every pathname change, including the initial
    // mount. `{ load: false }` queues the event without triggering the
    // posthog-js import — the idle-scheduled `initAnalytics()` above is
    // what loads it, so the critical-path optimization is preserved.
    // Skipped entirely if the key is missing so the queue doesn't grow
    // unbounded.
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
        trackEvent("$pageview", undefined, { load: false });
    }, [pathname]);

    return <>{children}</>;
}
