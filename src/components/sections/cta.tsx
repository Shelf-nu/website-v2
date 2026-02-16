import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 bg-neutral-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
            <Container className="relative text-center">
                <ScrollReveal width="100%">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to organize your assets?
                    </h2>
                    <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
                        Join thousands of teams who trust Shelf to manage their physical assets.
                        Start your free trial today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" variant="secondary" className="bg-white text-neutral-900 hover:bg-neutral-200 h-12 px-8" asChild>
                            <Link href="/signup">
                                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:text-white h-12 px-8" asChild>
                            <Link href="/demo">
                                Book a demo
                            </Link>
                        </Button>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
