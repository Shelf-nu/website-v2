"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export function BlogSidebar() {
    const [toc, setToc] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Find all h2 and h3 elements within the article
        const elements = Array.from(document.querySelectorAll("article h2, article h3"));

        const items = elements.map((element, index) => {
            if (!element.id) {
                const text = element.textContent || "";
                const slug = text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
                element.id = slug || `heading-${index}`;
            }

            return {
                id: element.id,
                text: element.textContent || "",
                level: Number(element.tagName.substring(1)),
            };
        });

        startTransition(() => {
            setToc(items);
        });

        // Scroll spy to highlight active section
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startTransition(() => {
                            setActiveId(entry.target.id);
                        });
                    }
                });
            },
            { rootMargin: "-100px 0px -66%" }
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    // Helper to structure flat list into checking active parent
    const getNestedToc = () => {
        const nested: { h2: TocItem; h3s: TocItem[] }[] = [];
        let currentH2: { h2: TocItem; h3s: TocItem[] } | null = null;

        toc.forEach((item) => {
            if (item.level === 2) {
                if (currentH2) nested.push(currentH2);
                currentH2 = { h2: item, h3s: [] };
            } else if (item.level === 3 && currentH2) {
                currentH2.h3s.push(item);
            }
        });
        if (currentH2) nested.push(currentH2);
        return nested;
    };

    if (toc.length === 0) return null;

    const nestedToc = getNestedToc();

    return (
        <div className="space-y-8 sticky top-24">
            {/* Table of Contents */}
            {toc.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                        On this page
                    </h4>
                    <nav className="flex flex-col space-y-1 text-sm max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {nestedToc.map((section) => {
                            // Check if this (H2) or any of its children (H3) is active
                            const isSectionActive =
                                activeId === section.h2.id || section.h3s.some((h3) => h3.id === activeId);

                            return (
                                <div key={section.h2.id} className="space-y-1">
                                    <a
                                        href={`#${section.h2.id}`}
                                        className={cn(
                                            "block py-1.5 transition-colors border-l-2 pl-4 -ml-px",
                                            activeId === section.h2.id
                                                ? "font-medium text-foreground border-orange-500"
                                                : "text-muted-foreground/80 hover:text-foreground border-transparent hover:border-border"
                                        )}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(section.h2.id)?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                    >
                                        {section.h2.text}
                                    </a>

                                    {/* Render H3s only if section is active (Accordion behavior) */}
                                    {isSectionActive && section.h3s.length > 0 && (
                                        <div className="space-y-1 animate-in slide-in-from-left-1 duration-200">
                                            {section.h3s.map((h3) => (
                                                <a
                                                    key={h3.id}
                                                    href={`#${h3.id}`}
                                                    className={cn(
                                                        "block py-1 transition-colors border-l-2 pl-8 -ml-px text-xs",
                                                        activeId === h3.id
                                                            ? "font-medium text-orange-600 border-orange-200"
                                                            : "text-muted-foreground/70 hover:text-foreground border-transparent hover:border-border"
                                                    )}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        document.getElementById(h3.id)?.scrollIntoView({ behavior: "smooth" });
                                                    }}
                                                >
                                                    {h3.text}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* CTA Card - Refined Layout */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Top Section: Value Prop */}
                <div className="p-6 pb-2 space-y-4">
                    <h4 className="font-bold text-2xl tracking-tight text-foreground leading-tight">
                        Never double-book equipment
                    </h4>

                    <p className="text-base text-muted-foreground leading-relaxed">
                        Track who has what, when — and avoid last-minute chaos when plans change. Shelf gives teams a single system of truth for shared gear.
                    </p>

                    <div className="pt-2 flex flex-col gap-3">
                        {/* Primary Action */}
                        <Link href="/customers" className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors group">
                            See how teams use Shelf <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        {/* Secondary Action */}
                        <Link href="/pricing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
                            Learn more <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <div className="h-px bg-border/50 w-full" />
                </div>

                {/* Bottom Section: Quote Panel */}
                <div className="px-6 pb-6">
                    <div className="rounded-lg bg-muted/40 border border-border/50 p-5 relative">
                        <blockquote className="text-sm text-foreground/80 italic leading-relaxed mb-4">
                            &quot;Avoiding double bookings is the reason I wanted to use Shelf. The moment I had to fix a last-minute extra camera proved stressful enough to justify the change.&quot;
                        </blockquote>

                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                            <div>
                                <div className="font-semibold text-xs text-foreground">Johannes van Beeck</div>
                                <div className="text-[11px] text-muted-foreground">Technical Director</div>
                            </div>
                            <Link href="/case-studies" className="text-xs font-medium text-orange-600 hover:text-orange-700 whitespace-nowrap group flex items-center">
                                Case study <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
