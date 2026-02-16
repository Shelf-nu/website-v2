"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { TrustedBy } from "@/components/sections/trusted-by";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface HeroWithSocialProofProps {
    title: string;
    description: string;
    tagline?: string;
}

export function HeroWithSocialProof({ title, description, tagline }: HeroWithSocialProofProps) {
    return (
        <section className="pt-32 pb-16 md:pt-48 md:pb-32 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="text-center relative z-10">
                <div className="flex justify-center mb-8">
                    <Breadcrumbs />
                </div>
                {tagline && (
                    <Badge variant="secondary" className="mb-8 bg-orange-50 text-orange-700 border-orange-100/50 px-4 py-1 text-sm">
                        {tagline}
                    </Badge>
                )}

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-8 max-w-4xl mx-auto leading-[1.1]">
                    {title}
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-8 text-base shadow-lg shadow-orange-600/20" asChild>
                        <Link href="/pricing">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm" asChild>
                        <Link href="/demo">
                            Request a demo
                        </Link>
                    </Button>
                </div>

                {/* Social Proof Divider */}
                <div className="border-t border-border/40 pt-16">
                    <p className="text-sm font-medium text-muted-foreground/60 uppercase tracking-widest mb-8">Trusted by innovative teams</p>
                    <div className="-mx-4 md:-mx-8">
                        <TrustedBy showTitle={false} />
                    </div>
                </div>
            </Container>
        </section>
    );
}
