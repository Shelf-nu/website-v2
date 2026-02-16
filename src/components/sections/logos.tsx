import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Logos() {
    return (
        <section className="py-24 sm:py-32 border-y border-border/40 bg-muted/20 relative overflow-hidden">
            <Container>
                <ScrollReveal width="100%">
                    <h2 className="text-center text-lg font-semibold leading-8 text-foreground/80 tracking-wide mb-12">
                        Trusted by the world’s most innovative teams
                    </h2>

                    <div className="relative w-full max-w-7xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                        <div className="flex w-max min-w-full hover:[animation-play-state:paused]">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center gap-12 sm:gap-24 animate-marquee py-4 pr-12 sm:pr-24">
                                    <img src="/vercel.svg" alt="Vercel" className="h-8 md:h-10 w-auto object-contain invert dark:invert-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                                    <img src="/next.svg" alt="Next.js" className="h-8 md:h-10 w-auto object-contain invert dark:invert-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                                    <img src="/globe.svg" alt="Globe" className="h-8 md:h-10 w-auto object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                                    <img src="/vercel.svg" alt="Vercel" className="h-8 md:h-10 w-auto object-contain invert dark:invert-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                                    <img src="/next.svg" alt="Next.js" className="h-8 md:h-10 w-auto object-contain invert dark:invert-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                                    <img src="/globe.svg" alt="Globe" className="h-8 md:h-10 w-auto object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
