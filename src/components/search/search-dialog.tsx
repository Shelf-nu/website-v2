"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, FileText, Loader2, X, ArrowRight } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Pagefind type stubs (loaded dynamically at runtime)               */
/* ------------------------------------------------------------------ */
interface PagefindResult {
    id: string;
    data: () => Promise<PagefindResultData>;
}

interface PagefindResultData {
    url: string;
    meta: { title?: string; image?: string };
    excerpt: string;
    filters: Record<string, string[]>;
    content: string;
}

interface PagefindSearchResponse {
    results: PagefindResult[];
    filters: Record<string, Record<string, number>>;
    totalFilters: Record<string, Record<string, number>>;
}

interface PagefindInstance {
    search: (query: string, options?: { filters?: Record<string, string[]> }) => Promise<PagefindSearchResponse>;
    filters: () => Promise<Record<string, Record<string, number>>>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const MAX_RESULTS = 8;

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    Blog: { label: "Blog", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
    "Knowledge Base": { label: "KB", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
    Feature: { label: "Feature", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800" },
    Solution: { label: "Solution", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800" },
    "Case Study": { label: "Case Study", color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800" },
    Alternative: { label: "Alternative", color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800" },
    Industry: { label: "Industry", color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800" },
    Glossary: { label: "Glossary", color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800" },
    "Use Case": { label: "Use Case", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800" },
    Concept: { label: "Concept", color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800" },
    Update: { label: "Update", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
    Page: { label: "Page", color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PagefindResultData[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [availableFilters, setAvailableFilters] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const pagefindRef = useRef<PagefindInstance | null>(null);
    const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    /* ---------- Lazy-load Pagefind on first open ---------- */
    const loadPagefind = useCallback(async () => {
        if (pagefindRef.current) return;
        try {
            // @ts-expect-error — Pagefind is loaded at runtime from /pagefind/pagefind.js
            const pf = await import(/* webpackIgnore: true */ "/pagefind/pagefind.js");
            pagefindRef.current = pf;
            // Pre-fetch available filter values
            const filters = await pf.filters();
            if (filters.type) {
                setAvailableFilters(Object.keys(filters.type).sort());
            }
        } catch {
            // Pagefind not available (dev mode) — silently degrade
            console.warn("Pagefind index not found. Run `npm run build` to generate it.");
        }
    }, []);

    /* ---------- Cmd/Ctrl+K shortcut ---------- */
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    /* ---------- Focus input when dialog opens ---------- */
    useEffect(() => {
        if (open) {
            loadPagefind();
            // Small delay to let the dialog animate in
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        } else {
            // Reset state on close
            setQuery("");
            setResults([]);
            setActiveIndex(0);
            setActiveFilter(null);
        }
    }, [open, loadPagefind]);

    /* ---------- Search (debounced) ---------- */
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setActiveIndex(0);
            return;
        }
        if (!pagefindRef.current) return;

        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const filterOpts = activeFilter ? { filters: { type: [activeFilter] } } : undefined;
                const response = await pagefindRef.current!.search(query, filterOpts);
                const data = await Promise.all(
                    response.results.slice(0, MAX_RESULTS).map((r) => r.data())
                );
                setResults(data);
                setActiveIndex(0);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 150);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, activeFilter]);

    /* ---------- Keyboard navigation ---------- */
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results[activeIndex]) {
            e.preventDefault();
            resultRefs.current[activeIndex]?.click();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
        }
    }

    /* ---------- Scroll active result into view ---------- */
    useEffect(() => {
        resultRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    /* ---------- Clean URL for display (strip .html, leading slashes) ---------- */
    function cleanUrl(raw: string): string {
        return raw
            .replace(/\.html$/, "")
            .replace(/\/index$/, "")
            .replace(/^\/+/, "/");
    }

    /* ---------- Render ---------- */
    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                aria-label="Search (Cmd+K)"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ⌘K
                </kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
                onClick={() => setOpen(false)}
                aria-hidden
            />

            {/* Dialog panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Site search"
                className="fixed left-1/2 top-[min(20vh,180px)] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
                onKeyDown={handleKeyDown}
            >
                <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl shadow-black/20">
                    {/* Search input */}
                    <div className="flex items-center gap-3 border-b border-border/40 px-4">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search pages, articles, docs…"
                            className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground/60"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {query && !loading && (
                            <button
                                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                        >
                            ESC
                        </button>
                    </div>

                    {/* Type filters */}
                    {availableFilters.length > 0 && query.trim() && (
                        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/40 px-4 py-2 scrollbar-hide">
                            <button
                                onClick={() => setActiveFilter(null)}
                                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                                    activeFilter === null
                                        ? "bg-foreground text-background"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                }`}
                            >
                                All
                            </button>
                            {availableFilters.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                                        activeFilter === type
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    }`}
                                >
                                    {TYPE_LABELS[type]?.label ?? type}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    <div className="max-h-[min(50vh,400px)] overflow-y-auto overscroll-contain">
                        {results.length > 0 ? (
                            <ul role="listbox" className="py-1">
                                {results.map((item, i) => {
                                    const url = cleanUrl(item.url);
                                    const type = item.filters?.type?.[0];
                                    const badge = type ? TYPE_LABELS[type] : null;

                                    return (
                                        <li key={url} role="option" aria-selected={i === activeIndex}>
                                            <Link
                                                ref={(el) => { resultRefs.current[i] = el; }}
                                                href={url}
                                                onClick={() => setOpen(false)}
                                                onMouseEnter={() => setActiveIndex(i)}
                                                className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
                                                    i === activeIndex
                                                        ? "bg-muted/70"
                                                        : "hover:bg-muted/40"
                                                }`}
                                            >
                                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground truncate">
                                                            {item.meta?.title || url}
                                                        </span>
                                                        {badge && (
                                                            <span className={`shrink-0 rounded border px-1.5 py-px text-[10px] font-medium leading-tight ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.excerpt && (
                                                        <p
                                                            className="mt-0.5 text-xs text-muted-foreground line-clamp-2 [&_mark]:bg-orange-100 [&_mark]:text-orange-900 [&_mark]:rounded-sm [&_mark]:px-0.5 dark:[&_mark]:bg-orange-900/30 dark:[&_mark]:text-orange-300"
                                                            dangerouslySetInnerHTML={{ __html: item.excerpt }}
                                                        />
                                                    )}
                                                    <span className="mt-1 block text-[11px] text-muted-foreground/60 truncate">
                                                        {url}
                                                    </span>
                                                </div>
                                                {i === activeIndex && (
                                                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : query.trim() && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Search className="h-8 w-8 mb-3 opacity-30" />
                                <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                                {activeFilter && (
                                    <button
                                        onClick={() => setActiveFilter(null)}
                                        className="mt-2 text-xs text-orange-600 hover:text-orange-700"
                                    >
                                        Try searching in all categories
                                    </button>
                                )}
                            </div>
                        ) : !query.trim() ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Search className="h-8 w-8 mb-3 opacity-20" />
                                <p className="text-sm">Start typing to search</p>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer hints */}
                    <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 text-[11px] text-muted-foreground/60">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-mono text-[10px]">↑↓</kbd>
                                navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-mono text-[10px]">↵</kbd>
                                open
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-mono text-[10px]">esc</kbd>
                                close
                            </span>
                        </div>
                        <span>Powered by Pagefind</span>
                    </div>
                </div>
            </div>
        </>
    );
}
