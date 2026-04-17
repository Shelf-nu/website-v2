"use client";

import Image from "next/image";
import { Container } from "@/components/ui/container";
import { LogoMarquee } from "@/components/sections/logo-marquee";
import { getTrustedByLogos } from "@/data/customer-logos";

export function TrustedBy({ showTitle = true }: { showTitle?: boolean }) {
    const logos = getTrustedByLogos().map((l) => ({
        name: l.name,
        src: l.logo,
    }));

    return (
        <section className="py-20 overflow-hidden">
            <Container>
                {showTitle && (
                    <p className="text-center text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest mb-10">
                        Trusted by innovative teams worldwide
                    </p>
                )}

                <LogoMarquee
                    duration={`${logos.length * 3}s`}
                    groupClassName="gap-16 md:gap-24 pr-16 md:pr-24"
                    containerClassName="flex max-w-[90vw] mx-auto"
                    items={logos.map((logo) => (
                        <div
                            key={logo.name}
                            className="relative h-10 w-32 flex-shrink-0 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-500 dark:invert dark:brightness-200"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                fill
                                className="object-contain"
                                sizes="128px"
                            />
                        </div>
                    ))}
                />
            </Container>
        </section>
    );
}
