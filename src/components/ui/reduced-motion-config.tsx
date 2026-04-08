"use client";

import { useEffect, useState } from "react";

/**
 * Lazy MotionConfig wrapper — loads framer-motion's MotionConfig after idle
 * to set reducedMotion="user" without adding framer-motion to the initial bundle.
 * This tells framer-motion to respect the OS prefers-reduced-motion setting.
 */
export function ReducedMotionConfig({ children }: { children: React.ReactNode }) {
    const [Wrapper, setWrapper] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

    useEffect(() => {
        const schedule = typeof requestIdleCallback === "function"
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 2000);

        const id = schedule(() => {
            import("framer-motion").then(({ MotionConfig }) => {
                setWrapper(() => function MotionConfigWrapper({ children }: { children: React.ReactNode }) {
                    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
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

    if (Wrapper) return <Wrapper>{children}</Wrapper>;
    return <>{children}</>;
}
