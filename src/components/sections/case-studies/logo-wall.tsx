"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LogoItem {
    id: string;
    name: string;
    logo?: string;
    industry: string;
    description: string;
    slug: string;
    productUsed?: string;
}

interface LogoWallProps {
    items: LogoItem[];
}

export function LogoWall({ items }: LogoWallProps) {
    const [filter, setFilter] = useState("All");

    // Extract unique industries from items, flatten if array, and genericize
    const industries = ["All", ...Array.from(new Set(items.map((item) => item.industry)))];

    const filteredItems = filter === "All"
        ? items
        : items.filter((item) => item.industry === filter);

    return (
        <div className="w-full space-y-12">
            {/* Filters */}
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
                    </Button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href={`/case-studies/${item.slug}`} className="group block h-full">
                                <div className="flex flex-col h-full rounded-xl border border-border/50 bg-background p-6 transition-all hover:border-orange-200 hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        {item.logo ? (
                                            <div className="h-8 w-auto relative">
                                                <Image
                                                    src={item.logo}
                                                    alt={item.name}
                                                    width={100}
                                                    height={40}
                                                    className="object-contain h-full w-auto grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-xl font-bold text-foreground">{item.name}</div>
                                        )}
                                        <Badge variant="secondary" className="text-xs font-normal bg-muted">
                                            {item.productUsed || "Shelf for Teams"}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                        {item.description}
                                    </p>

                                    <div className="mt-4 flex items-center text-xs font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Case Study <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
