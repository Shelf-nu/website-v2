"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface Article {
    slug: string;
    title: string;
    description: string;
    category: string;
}

interface Category {
    name: string;
    count: number;
}

interface KnowledgeBaseFeedProps {
    articles: Article[];
    categories: Category[];
}

export function KnowledgeBaseFeed({
    articles,
    categories,
}: KnowledgeBaseFeedProps) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let result = articles;

        if (activeCategory) {
            result = result.filter((a) => a.category === activeCategory);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    a.description.toLowerCase().includes(q)
            );
        }

        return result;
    }, [articles, search, activeCategory]);

    // Group filtered articles by category
    const grouped = useMemo(() => {
        const map = new Map<string, Article[]>();
        filtered.forEach((a) => {
            const existing = map.get(a.category) || [];
            existing.push(a);
            map.set(a.category, existing);
        });
        // Sort categories: Getting Started first, then alphabetically
        return Array.from(map.entries()).sort((a, b) => {
            if (a[0] === "Getting Started") return -1;
            if (b[0] === "Getting Started") return 1;
            return a[0].localeCompare(b[0]);
        });
    }, [filtered]);

    return (
        <div>
            {/* Search + Category filters */}
            <div className="mb-12 space-y-6">
                {/* Search */}
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-colors"
                    />
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            !activeCategory
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        All ({articles.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() =>
                                setActiveCategory(
                                    activeCategory === cat.name
                                        ? null
                                        : cat.name
                                )
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                activeCategory === cat.name
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {cat.name} ({cat.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {grouped.length === 0 ? (
                <div className="text-center py-20">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        No articles found matching your search.
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {grouped.map(([category, categoryArticles]) => (
                        <ScrollReveal key={category} width="100%">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-1">
                                    {category}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {categoryArticles.length} article
                                    {categoryArticles.length !== 1 ? "s" : ""}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categoryArticles.map((article) => (
                                        <Link
                                            key={article.slug}
                                            href={`/knowledge-base/${article.slug}`}
                                            className="group flex flex-col rounded-xl border border-border/60 bg-background p-5 transition-all duration-200 hover:border-orange-500/20 hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors leading-snug">
                                                    {article.title}
                                                </h3>
                                                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-orange-500 transition-all group-hover:translate-x-0.5 mt-0.5" />
                                            </div>
                                            {article.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {article.description}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-3">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] font-normal"
                                                >
                                                    {article.category}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    );
}
