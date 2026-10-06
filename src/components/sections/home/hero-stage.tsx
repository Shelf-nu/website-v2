"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { VideoLightbox } from "@/components/ui/video-lightbox";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { COMPANION, HERO_VIEWS } from "@/data/home";
import { HERO_SIZES } from "./hero-sizes";
import { Shot } from "./shot";

/**
 * The product, operable: three real views of the web app behind a segmented
 * control, with the Companion app beside it on large screens.
 *
 * All three images are in the static HTML (the first one eager, as the LCP
 * element; the others lazy), so nothing here depends on JavaScript to be
 * seen or indexed. The stage is deliberately cut by the fold.
 */
export function HeroStage() {
    const [active, setActive] = useState(HERO_VIEWS[0].id);

    return (
        <div className="relative mx-auto mt-10 max-w-7xl sm:mt-12">
            <div className="flex justify-center">
                <div role="tablist" aria-label="Product views" className="inline-flex items-center gap-1 rounded-full bg-muted/70 p-1 ring-1 ring-border/70">
                    {HERO_VIEWS.map((view) => {
                        const selected = view.id === active;
                        return (
                            <button
                                key={view.id}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                aria-controls={`hero-view-${view.id}`}
                                onClick={() => {
                                    if (selected) return;
                                    setActive(view.id);
                                    trackEvent("home_interact", { element: "hero_tab", value: view.id });
                                }}
                                className={cn(
                                    "h-9 rounded-full px-3.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96] sm:px-4",
                                    selected ? "bg-background text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground",
                                    view.phoneOnly && "lg:hidden",
                                )}
                            >
                                {view.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 grid h-[240px] grid-cols-1 gap-6 overflow-hidden sm:h-[340px] md:h-[400px] lg:h-[460px] lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
                {/* Web app */}
                <div className="relative overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
                    {HERO_VIEWS.map((view, i) => (
                        <div
                            key={view.id}
                            id={`hero-view-${view.id}`}
                            role="tabpanel"
                            aria-hidden={view.id !== active}
                            className={cn("absolute inset-0 transition-opacity duration-300 ease-out", view.id === active ? "opacity-100" : "pointer-events-none opacity-0", view.phoneOnly && "bg-neutral-900")}
                        >
                            {/* The phone screen is portrait: show the part with the scanner, not the status bar. */}
                            <Shot shot={view.shot} eager={i === 0} sizes={view.phoneOnly ? "100vw" : HERO_SIZES} className={view.phoneOnly ? "h-full w-full object-cover object-[50%_30%]" : "h-full w-full object-cover object-left-top dark:brightness-90"} />
                        </div>
                    ))}

                    <span className="absolute left-4 top-4 z-10 hidden lg:inline-flex items-center gap-2 rounded-full bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Web app
                    </span>

                    {/* The video is of the web app; on the phone-only app view the pill would sit on the phone screen. */}
                    <div className={cn("absolute right-4 top-4 z-10", HERO_VIEWS.find((v) => v.id === active)?.phoneOnly && "hidden")}>
                        <VideoLightbox videoId="RHs9nBpXuuE">
                            <div role="button" tabIndex={0} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 shadow-lg shadow-black/10 backdrop-blur-sm transition-transform duration-150 hover:scale-[1.03] active:scale-[0.96]">
                                <Play className="ml-0.5 h-3.5 w-3.5 fill-orange-600 text-orange-600" />
                                <span className="text-xs font-semibold text-body">See it in action</span>
                            </div>
                        </VideoLightbox>
                    </div>
                </div>

                {/* Companion app */}
                <div className="relative hidden overflow-hidden rounded-t-[28px] border border-b-0 border-border bg-neutral-900 shadow-2xl shadow-black/10 lg:block dark:shadow-black/40">
                    <Image
                        src={COMPANION.scan.src}
                        alt={COMPANION.scan.alt}
                        width={COMPANION.scan.width}
                        height={COMPANION.scan.height}
                        sizes="320px"
                        className="h-full w-full object-cover object-top"
                    />
                    <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Companion app
                    </span>
                </div>
            </div>
        </div>
    );
}
