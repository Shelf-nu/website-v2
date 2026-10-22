"use client";

import { useState } from "react";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export interface TrustSegment {
    id: string;
    label: string;
    logos: { id: string; name: string; logo: string }[];
    quote?: { text: string; by: string };
}

/**
 * Logos and one quote, filtered by the visitor's own kind of team. Every
 * segment is rendered into the HTML; the tabs only toggle visibility. The
 * tab a visitor picks is a segment signal, so it is tracked.
 */
export function TrustTabs({ segments }: { segments: TrustSegment[] }) {
    const [active, setActive] = useState(segments[0].id);

    return (
        <>
            {/* Four tabs don't fit one row on a phone; two even rows read as deliberate, a 3 + 1 wrap doesn't. */}
            <div role="tablist" aria-label="Show customers by segment" className="mt-5 grid max-w-full grid-cols-2 gap-1 rounded-3xl bg-muted/70 p-1 ring-1 ring-border/70 sm:inline-flex sm:flex-wrap sm:items-center sm:justify-center sm:rounded-full">
                {segments.map((segment) => {
                    const selected = segment.id === active;
                    return (
                        <button
                            key={segment.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={`trust-${segment.id}`}
                            onClick={() => {
                                if (selected) return;
                                setActive(segment.id);
                                trackEvent("home_interact", { element: "trust_segment", value: segment.id });
                            }}
                            className={cn(
                                "h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96]",
                                selected ? "bg-background text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {segment.label}
                        </button>
                    );
                })}
            </div>

            {segments.map((segment) => (
                <div key={segment.id} id={`trust-${segment.id}`} role="tabpanel" hidden={segment.id !== active} className="w-full">
                    {/* Three per row on phones, one row from md up; the seventh logo only where it fits. */}
                    <ul className="mt-8 grid grid-cols-3 items-center justify-items-center gap-x-6 gap-y-6 md:flex md:justify-center md:gap-x-8 lg:gap-x-10 xl:gap-x-14">
                        {segment.logos.map((logo, i) => (
                            <li key={logo.id} className={cn("relative h-9 w-24 md:w-[88px] lg:w-24 xl:w-28", i >= 6 && "hidden lg:block")}>
                                <Image src={logo.logo} alt={logo.name} fill sizes="112px" className="object-contain opacity-60 grayscale dark:invert dark:brightness-200" />
                            </li>
                        ))}
                    </ul>
                    {segment.quote && (
                        <figure className="mx-auto mt-8 max-w-3xl text-center">
                            <blockquote className="text-lg leading-relaxed text-heading text-pretty">&ldquo;{segment.quote.text}&rdquo;</blockquote>
                            <figcaption className="mt-3 text-sm text-caption">{segment.quote.by}</figcaption>
                        </figure>
                    )}
                </div>
            ))}
        </>
    );
}
