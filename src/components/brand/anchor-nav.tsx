"use client";

import { Check, Type, Palette, ImageIcon, FileText } from "lucide-react";

const NAV_ITEMS = [
    { icon: ImageIcon, label: "Logos", target: "logos" },
    { icon: Palette, label: "Colors", target: "colors" },
    { icon: Type, label: "Typography", target: "typography" },
    { icon: Check, label: "Usage", target: "usage" },
    { icon: FileText, label: "Boilerplate", target: "boilerplate" },
];

export function AnchorNav() {
    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-10 sm:mb-16 pb-6 sm:pb-8 border-b border-border/40">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    onClick={() => scrollTo(item.target)}
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:border-orange-200 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all cursor-pointer"
                >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                </button>
            ))}
        </div>
    );
}
