"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
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
    onRender?: (state: Record<string, unknown>) => void;
}

interface GlobeProps {
    className?: string;
    config?: GlobeConfig;
}

export function Globe({ className, config }: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);
    const r = useMotionValue(0);
    const springR = useSpring(r, { stiffness: 280, damping: 40 });
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
        let phi = 0;
        let width = 0;

        const onResize = () => {
            if (canvasRef.current && (width !== canvasRef.current.offsetWidth)) {
                width = canvasRef.current.offsetWidth;
            }
        }
        window.addEventListener('resize', onResize);
        onResize();

        // Theme-aware defaults
        const themeDefaults = isDark
            ? { dark: 1, baseColor: [0.15, 0.15, 0.18] as [number, number, number], mapBrightness: 2, glowColor: [0.3, 0.15, 0.05] as [number, number, number] }
            : { dark: 0, baseColor: [0.93, 0.93, 0.93] as [number, number, number], mapBrightness: 6, glowColor: [1, 0.8, 0.6] as [number, number, number] };

        // Default configuration
        const globeConfig = {
            devicePixelRatio: 2,
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
            onRender: (state: Record<string, unknown>) => {
                // Interactive rotation
                if (!pointerInteracting.current) {
                    phi += 0.003; // Auto-rotate
                }
                state.phi = phi + springR.get();
                state.width = width * 2;
                state.height = width * 2;
            },
            ...config,
        };

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, globeConfig);

        // Bind opacity transition after mount
        if (canvasRef.current) {
            canvasRef.current.style.opacity = "1";
        }

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, [config, springR, isDark]);

    return (
        <div
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

