import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Testimonials() {
    return (
        <section className="py-24 sm:py-32 bg-muted/20 border-t border-border/40 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-background via-transparent to-transparent opacity-50 pointer-events-none" />

            <Container>
                <div className="mx-auto max-w-2xl lg:text-center mb-16">
                    <ScrollReveal width="100%">
                        <h2 className="text-base font-semibold leading-7 text-orange-600 uppercase tracking-widest mb-3">
                            Testimonials
                        </h2>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center">
                            Trusted by the best
                        </h2>
                    </ScrollReveal>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {[1, 2, 3].map((i, index) => (
                            <ScrollReveal key={i} width="100%" delay={index * 0.1}>
                                <div className="flex flex-col justify-between bg-background p-8 shadow-sm ring-1 ring-border/50 sm:rounded-2xl h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-200">
                                    <blockquote className="text-lg leading-relaxed text-muted-foreground italic">
                                        <p>
                                            &ldquo;Shelf&rsquo;s tracking capability is nice—but the real value is the accountability it creates among our students.&rdquo;
                                        </p>
                                    </blockquote>
                                    <div className="mt-8 flex items-center gap-x-4 border-t border-border/40 pt-6">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 ring-2 ring-background" />
                                        <div>
                                            <div className="font-semibold text-foreground">Jane Doe</div>
                                            <div className="text-sm leading-6 text-muted-foreground/80">CTO, Tech Corp</div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </Container>
        </section >
    );
}
