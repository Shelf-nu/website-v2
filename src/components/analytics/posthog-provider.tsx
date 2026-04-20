"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

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

        const id = schedule(() => {
            import("posthog-js").then(({ default: posthog }) => {
                posthog.init(key, {
                    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
                    capture_pageview: false, // handled manually via pathname effect
                    capture_pageleave: true,
                    autocapture: true,
                });
            });
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
    // mount. `trackEvent` queues events until posthog-js finishes loading,
    // so the first pageview survives the idle-deferred init.
    useEffect(() => {
        trackEvent("$pageview");
    }, [pathname]);

    return <>{children}</>;
}
