"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { Container } from "@/components/ui/container";

interface LogoItem {
    id: string;
    name: string;
    logo: string;
    slug?: string;
}

interface LogoGridProps {
    items: LogoItem[];
}

export function LogoGrid({ items }: LogoGridProps) {
    return (
        <section className="py-24 border-y border-border/40 bg-background/50">
            <Container>
                <div className="text-center mb-16 space-y-4">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Trusted by <Link href="/case-studies" className="underline underline-offset-4 hover:text-foreground transition-colors">more than 3000 teams</Link> worldwide
                    </p>

                    <a href="https://www.g2.com/products/shelf-asset-management/reviews" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/50 hover:bg-muted/50 transition-colors group">
                        <div className="relative h-6 w-6">
                            <Image
                                src="/logos/g2-logo.png"
                                alt="G2 Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors ml-1">
                            5.0/5 Rating
                        </span>
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 md:gap-x-24 gap-y-16 items-center justify-items-center opacity-100 px-4 md:px-0">
                    {items.map((item) => {
                        const hasCaseStudy = !!item.slug;

                        // Content wrapper for the logo image
                        const LogoImage = (
                            <div className={`relative h-12 w-full max-w-[160px] transition-all duration-300 ${hasCaseStudy ? 'opacity-60 grayscale group-hover:opacity-0 group-hover:-translate-y-2' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                                <Image
                                    src={item.logo}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        );

                        if (hasCaseStudy) {
                            return (
                                <Link
                                    key={item.id}
                                    href={`/case-studies/${item.slug}`}
                                    className="group relative flex items-center justify-center w-full h-12"
                                >
                                    {LogoImage}

                                    {/* Hover State: CTA */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                                        <span className="inline-flex items-center text-sm font-semibold text-orange-600 whitespace-nowrap">
                                            Read Story <ArrowRight className="ml-1 h-3 w-3" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        }

                        // Render static item for logos without case studies
                        return (
                            <div key={item.id} className="flex items-center justify-center w-full h-12">
                                {LogoImage}
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
