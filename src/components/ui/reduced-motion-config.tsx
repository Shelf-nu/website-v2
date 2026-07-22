"use client";

import { MotionConfig } from "framer-motion";

/**
 * Sets framer-motion's reducedMotion="user" app-wide so JS-driven animations
 * respect the OS prefers-reduced-motion setting (WCAG 2.3.3).
 *
 * The @media (prefers-reduced-motion) block in globals.css is not a substitute:
 * it clamps CSS animation/transition duration, which does nothing to
 * framer-motion — that animates via WAAPI/rAF and inline styles.
 *
 * MotionConfig is rendered unconditionally, and that is the point. A previous
 * version imported it lazily after requestIdleCallback and rendered a bare
 * fragment until then. Swapping the wrapper's element type mid-load makes
 * React unmount and remount every client component beneath it — measured at
 * ~1.9s into load on throttled mobile, late enough to wipe an open mobile menu
 * or search dialog. Keeping the tree shape stable from the first render is
 * worth more than deferring framer-motion's context module.
 */
export function ReducedMotionConfig({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
