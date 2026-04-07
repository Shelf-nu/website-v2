"use client";

import { useEffect, useState } from "react";

/**
 * Lazy PostHog provider — defers both the posthog-js import (175KB) and
 * initialization until the browser is idle, keeping them off the critical path.
 * Children render immediately; analytics context becomes available once loaded.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const [Provider, setProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

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
            Promise.all([
                import("posthog-js"),
                import("posthog-js/react"),
            ]).then(([{ default: posthog }, { PostHogProvider: PHProvider }]) => {
                posthog.init(key, {
                    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
                    capture_pageview: true,
                    capture_pageleave: true,
                    autocapture: true,
                });
                // Wrap in a component that passes the initialized client
                setProvider(() => function Wrapper({ children }: { children: React.ReactNode }) {
                    return <PHProvider client={posthog}>{children}</PHProvider>;
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

    // Render children immediately — PostHog wraps them once loaded
    if (Provider) {
        return <Provider>{children}</Provider>;
    }
    return <>{children}</>;
}
