"use client";

import Image from "next/image";
import { Container } from "@/components/ui/container";
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

                {/* Two identical groups, each carrying its own internal gap +
                    trailing gap via padding-right; outer row has no gap so
                    translateX(-50%) seams exactly (no half-gap jump on Safari). */}
                <div className="relative flex max-w-[90vw] mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div
                        className="flex flex-nowrap animate-marquee"
                        style={{ "--marquee-duration": `${logos.length * 3}s` } as React.CSSProperties}
                    >
                        {[0, 1].map((copy) => (
                            <div
                                key={copy}
                                className="flex gap-16 md:gap-24 pr-16 md:pr-24 flex-nowrap flex-shrink-0"
                                {...(copy === 1 ? { "aria-hidden": true } : {})}
                            >
                                {logos.map((logo) => (
                                    <div
                                        key={`${logo.name}-${copy}`}
                                        className="relative h-10 w-32 flex-shrink-0 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-500 dark:invert dark:brightness-200"
                                    >
                                        <Image
                                            src={logo.src}
                                            alt={logo.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
