"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface GlobeConfig {
    devicePixelRatio?: number;
    width?: number;
    height?: number;
    phi?: number;
    theta?: number;
    dark?: number;
    diffuse?: number;
    mapSamples?: number;
    mapBrightness?: number;
    baseColor?: [number, number, number];
    markerColor?: [number, number, number];
    glowColor?: [number, number, number];
    markers?: { location: [number, number]; size: number }[];
    context?: WebGLContextAttributes;
    onRender?: (state: Record<string, unknown>) => void;
}

interface GlobeProps {
    className?: string;
    config?: GlobeConfig;
}

/**
 * The globe is a fragment shader that runs over every canvas pixel on
 * every frame, so its cost is the pixel count. At the full Retina 2x an
 * ~800px globe was a 1600x1600 canvas: 2.6 million pixels a frame. 1.5x
 * looks the same for diffuse-shaded dots and is 44% less work.
 */
const MAX_PIXEL_RATIO = 1.5;

/** Auto-rotation speed: the old 0.003 radians per frame, at 60 frames a second. */
const RADIANS_PER_MS = 0.00018;

/**
 * Interactive rotating globe (cobe + WebGL) with performance gates so it
 * doesn't block the main thread or stutter:
 *
 *   1. IntersectionObserver — cobe only initializes once the canvas is
 *      within 200px of the viewport. On the homepage the globe lives in
 *      ScaleBlock below the fold, so during initial load + hydration it
 *      never starts animating. Previously the cobe render loop fired
 *      on every rAF from mount, contributing ~39s of TBT on slow CI
 *      hardware (measured in docs/perf-audit/baseline-2026-04-10.md).
 *      Once built, the globe is paused and resumed with cobe's own
 *      toggle. It used to be destroyed and rebuilt (12,000 map samples,
 *      a shader compile) every time it scrolled back into view, which
 *      showed as a hitch at exactly the moment people looked at it.
 *
 *   2. prefers-reduced-motion — when set, auto-rotation is disabled. The
 *      globe still renders (interactable via drag) but doesn't animate
 *      continuously. Honors OS-level accessibility preference.
 *
 *   3. The rotation advances by elapsed time, not by frame, so a dropped
 *      frame no longer shows as a stutter in the spin.
 */
export function Globe({ className, config }: GlobeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);
    const r = useMotionValue(0);
    const springR = useSpring(r, { stiffness: 280, damping: 40 });
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [isVisible, setIsVisible] = useState(false);
    const isVisibleRef = useRef(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Honor OS-level reduced-motion preference. Matches the MotionConfig
    // reducedMotion="user" wiring in src/app/layout.tsx for framer-motion.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mq.matches);
        const onChange = () => setPrefersReducedMotion(mq.matches);

        // MediaQueryList.addEventListener is Safari 14+ (Sept 2020). Older
        // Safari versions expose the deprecated addListener/removeListener
        // API. Falling back keeps Safari 13 and earlier from throwing on
        // mount and breaking the whole Globe component — which matters
        // specifically for this codebase because our Safari-first audit
        // explicitly targets Safari users.
        if (typeof mq.addEventListener === "function") {
            mq.addEventListener("change", onChange);
            return () => mq.removeEventListener("change", onChange);
        }
        // Legacy Safari <14 path — addListener/removeListener are deprecated
        // but still present on pre-14 MediaQueryList implementations.
        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
    }, []);

    // Only animate when the canvas is (close to) visible. 200px rootMargin
    // so the globe is already rendering by the time the user scrolls to it
    // — avoids a "pop in" without paying the TBT cost when it's offscreen.
    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            // Degrade gracefully on very old browsers
            isVisibleRef.current = true;
            setIsVisible(true);
            setHasBeenVisible(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    isVisibleRef.current = entry.isIntersecting;
                    setIsVisible(entry.isIntersecting);
                    if (entry.isIntersecting) setHasBeenVisible(true);
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Gate 1: don't build the globe until it is about to be visible.
        // This is the big TBT win for pages where the globe lives below
        // the fold (homepage ScaleBlock).
        if (!hasBeenVisible) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        let phi = 0;
        let width = 0;
        let lastFrame = 0;
        const pixelRatio = Math.min(config?.devicePixelRatio ?? (window.devicePixelRatio || 1), MAX_PIXEL_RATIO);

        const onResize = () => {
            if (width !== canvas.offsetWidth) {
                width = canvas.offsetWidth;
            }
        };
        window.addEventListener("resize", onResize);
        onResize();

        // Theme-aware defaults
        const themeDefaults = isDark
            ? { dark: 1, baseColor: [0.15, 0.15, 0.18] as [number, number, number], mapBrightness: 2, glowColor: [0.3, 0.15, 0.05] as [number, number, number] }
            : { dark: 0, baseColor: [0.93, 0.93, 0.93] as [number, number, number], mapBrightness: 6, glowColor: [1, 0.8, 0.6] as [number, number, number] };

        // Default configuration
        const globeConfig = {
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0.3,
            diffuse: 1.2,
            mapSamples: 24000,
            markerColor: [1, 0.5, 0.2] as [number, number, number],
            ...themeDefaults,
            markers: [
                { location: [37.7595, -122.4367] as [number, number], size: 0.05 },
                { location: [40.7128, -74.006] as [number, number], size: 0.05 },
                { location: [51.5074, -0.1278] as [number, number], size: 0.05 },
                { location: [52.52, 13.405] as [number, number], size: 0.05 },
                { location: [35.6762, 139.6503] as [number, number], size: 0.05 },
                { location: [1.3521, 103.8198] as [number, number], size: 0.05 },
                { location: [-33.8688, 151.2093] as [number, number], size: 0.05 },
            ],
            ...config,
            // After the caller's config, so the caps win over anything passed in.
            devicePixelRatio: pixelRatio,
            // The globe is one full-canvas quad drawn by a fragment shader. There
            // are no geometry edges for multisampling to smooth, so MSAA was pure cost.
            context: { antialias: false, ...config?.context },
            onRender: (state: Record<string, unknown>) => {
                const now = performance.now();
                // Capped, so a tab coming back from the background doesn't jump ahead.
                const elapsed = lastFrame ? Math.min(now - lastFrame, 50) : 16.7;
                lastFrame = now;
                // Gate 2: only auto-rotate when the user hasn't opted out
                // of motion. Manual drag interaction still works either way.
                if (!prefersReducedMotion && !pointerInteracting.current) {
                    phi += RADIANS_PER_MS * elapsed;
                }
                state.phi = phi + springR.get();
                state.width = width * pixelRatio;
                state.height = width * pixelRatio;
                config?.onRender?.(state);
            },
        };

        const globe = createGlobe(canvas, globeConfig);
        globeRef.current = globe;
        // cobe starts drawing on creation; if the globe was built while
        // off screen (a theme change, say), wait until it is back.
        globe.toggle(isVisibleRef.current);

        // Bind opacity transition after mount
        canvas.style.opacity = "1";

        return () => {
            globe.destroy();
            globeRef.current = null;
            window.removeEventListener("resize", onResize);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- springR is a stable MotionValue ref, read imperatively in onRender
    }, [config, isDark, hasBeenVisible, prefersReducedMotion]);

    // Pause the render loop while the globe is off screen, resume when it is back.
    useEffect(() => {
        globeRef.current?.toggle(isVisible);
    }, [isVisible]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative flex h-full w-full items-center justify-center overflow-hidden",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", maxWidth: "100%", aspectRatio: 1 }}
                className="size-full opacity-0 transition-opacity duration-1000 [contain:layout_paint_size]"
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        // Map pixel delta to rotation (sensitivity)
                        r.set(delta / 200);
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        r.set(delta / 100);
                    }
                }}
            />
        </div>
    );
}
