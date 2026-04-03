"use client";

import { useEffect, useState, startTransition } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

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

            {/* Conversion Card */}
            <div className="rounded-xl border border-orange-200/60 bg-orange-50/40 dark:border-orange-900/30 dark:bg-orange-950/20 p-5 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                    Try Shelf free
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Unlimited assets, QR scanning, custody tracking. No credit card required.
                </p>
                <a
                    href="https://app.shelf.nu/join?utm_source=blog&utm_medium=sidebar&utm_campaign=cta"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                    onClick={() => trackEvent("signup_click", { source: "blog_sidebar" })}
                >
                    Sign up free
                    <ArrowRight className="h-3 w-3" />
                </a>
                <div className="border-t border-orange-200/40 dark:border-orange-900/20 pt-3">
                    <a
                        href="/demo"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => trackEvent("demo_click", { source: "blog_sidebar" })}
                    >
                        Or book a demo
                        <ArrowRight className="h-3 w-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
