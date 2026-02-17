import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getTestimonialLogos } from "@/data/customer-logos";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
    const testimonials = getTestimonialLogos().slice(0, 2);

    if (testimonials.length === 0) return null;

    return (
        <section className="py-24 bg-muted/30 border-y border-border/40">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className="relative rounded-2xl bg-background border border-border/60 p-8 md:p-12 shadow-sm flex flex-col"
                        >
                            <Quote className="h-10 w-10 text-orange-500/10 mb-4" />

                            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-foreground tracking-tight flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </blockquote>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center overflow-hidden border border-orange-100">
                                    <Image
                                        src={t.logo}
                                        alt={t.name}
                                        width={36}
                                        height={36}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">
                                        {t.quoteAuthor}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {t.quoteRole}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
