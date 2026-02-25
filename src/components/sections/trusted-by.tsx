"use client";

import Image from "next/image";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { getTrustedByLogos } from "@/data/customer-logos";

export function TrustedBy({ showTitle = true }: { showTitle?: boolean }) {
    const logos = getTrustedByLogos().map((l) => ({
        name: l.name,
        src: l.logo,
    }));
    const infiniteLogos = [...logos, ...logos];

    return (
        <section className="py-20 overflow-hidden">
            <Container>
                {showTitle && (
                    <p className="text-center text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest mb-10">
                        Trusted by innovative teams worldwide
                    </p>
                )}

                <div className="relative flex max-w-[90vw] mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <motion.div
                        className="flex gap-16 md:gap-24 flex-nowrap"
                        animate={{
                            x: [0, "-50%"],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: logos.length * 3,
                                ease: "linear",
                            },
                        }}
                    >
                        {infiniteLogos.map((logo, index) => (
                            <div
                                key={`${logo.name}-${index}`}
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
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
