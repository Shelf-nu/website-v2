"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CustomerLogoItem {
    id: string;
    name: string;
    logo: string;
    industry: string;
    caseStudySlug?: string;
}

interface CustomerLogoWallProps {
    items: CustomerLogoItem[];
}

export function CustomerLogoWall({ items }: CustomerLogoWallProps) {
    const [filter, setFilter] = useState("All");

    // Extract unique industries, sorted alphabetically
    const industries = [
        "All",
        ...Array.from(new Set(items.map((item) => item.industry)))
            .filter((i) => i !== "Other")
            .sort(),
    ];

    const filteredItems =
        filter === "All"
            ? items
            : items.filter((item) => item.industry === filter);

    return (
        <div className="w-full space-y-12">
            {/* Industry filters */}
            <div className="flex flex-wrap justify-center gap-2">
                {industries.map((ind) => (
                    <Button
                        key={ind}
                        variant={filter === ind ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(ind)}
                        className="rounded-full"
                    >
                        {ind}
                        {ind !== "All" && (
                            <span className="ml-1.5 text-xs opacity-60">
                                {items.filter((i) => i.industry === ind).length}
                            </span>
                        )}
                    </Button>
                ))}
            </div>

            {/* Logo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const cardContent = (
                            <>
                                <div className="relative h-10 w-full flex items-center justify-center">
                                    <Image
                                        src={item.logo}
                                        alt={item.name}
                                        width={120}
                                        height={40}
                                        className="object-contain h-10 w-auto max-w-[100px] grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 dark:invert dark:brightness-200"
                                    />
                                </div>
                                <span className="text-[11px] text-muted-foreground/70 text-center leading-tight line-clamp-1 group-hover:text-foreground transition-colors">
                                    {item.name}
                                </span>
                                {item.caseStudySlug && (
                                    <span className="absolute bottom-1.5 right-2 text-[9px] font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                        Story <ArrowRight className="h-2 w-2" />
                                    </span>
                                )}
                            </>
                        );

                        const cardClassName = "group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-background p-5 h-28 transition-all hover:border-orange-500/20 hover:shadow-md hover:-translate-y-0.5";

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                {item.caseStudySlug ? (
                                    <Link
                                        href={`/case-studies/${item.caseStudySlug}`}
                                        className={cardClassName}
                                    >
                                        {cardContent}
                                    </Link>
                                ) : (
                                    <div className={cardClassName}>
                                        {cardContent}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Count */}
            <p className="text-center text-sm text-muted-foreground">
                Showing {filteredItems.length} of {items.length} customers
            </p>
        </div>
    );
}
