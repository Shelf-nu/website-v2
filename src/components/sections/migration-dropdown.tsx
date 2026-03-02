"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const competitors = [
    { name: "Asset Panda", slug: "asset-panda" },
    { name: "Snipe-IT", slug: "snipe-it" },
    { name: "Cheqroom", slug: "cheqroom" },
    { name: "Sortly", slug: "sortly" },
    { name: "UpKeep", slug: "upkeep" },
    { name: "EZOfficeInventory", slug: "ezofficeinventory" },
    { name: "Asset Tiger", slug: "asset-tiger" },
    { name: "Itemit", slug: "itemit" },
    { name: "WebCheckout", slug: "webcheckout" },
    { name: "Hardcat", slug: "hardcat" },
    { name: "GoCodes", slug: "gocodes" },
    { name: "Timly", slug: "timly" },
];

export function MigrationDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors cursor-pointer"
            >
                Migrating from another tool?
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 rounded-xl border border-border/60 bg-card shadow-xl shadow-black/10 backdrop-blur-sm z-[60] py-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        Switch from
                    </div>
                    <div className="max-h-[240px] overflow-y-auto overscroll-contain">
                        {competitors.map((c) => (
                            <Link
                                key={c.slug}
                                href={`/alternatives/${c.slug}`}
                                className="flex items-center px-3 py-1.5 text-sm text-foreground hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950/30 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-border/40 mt-1 pt-1">
                        <Link
                            href="/alternatives"
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            View all comparisons →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
