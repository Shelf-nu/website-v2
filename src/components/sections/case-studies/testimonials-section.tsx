import { Container } from "@/components/ui/container";

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-muted/30 border-y border-border/40">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Testimonial 1 */}
                    <div className="relative rounded-2xl bg-background border border-border/60 p-8 md:p-12 shadow-sm">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <span className="text-9xl font-serif text-orange-600 leading-none">&quot;</span>
                        </div>

                        <div className="relative z-10">
                            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-foreground tracking-tight">
                                “Shelf didn&apos;t just track our assets—it changed our entire culture of accountability. Ghost assets dropped to zero in three months.”
                            </blockquote>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-border">
                                    {/* Placeholder Avatar */}
                                    <div className="text-orange-600 font-bold">JD</div>
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">Jonathan Davis</div>
                                    <div className="text-sm text-muted-foreground">Operations Director, TechFlow</div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Product: <span className="text-orange-600">Shelf Enterprise</span>
                                </div>
                                {/* Placeholder Company Logo */}
                                <div className="font-bold text-muted-foreground/30 text-sm tracking-widest uppercase">TECHFLOW</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="relative rounded-2xl bg-background border border-border/60 p-8 md:p-12 shadow-sm">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <span className="text-9xl font-serif text-orange-600 leading-none">&quot;</span>
                        </div>

                        <div className="relative z-10">
                            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-foreground tracking-tight">
                                “We were losing $50k a year in lost tools. Shelf paid for itself in the first week. The QR workflow is genius in its simplicity.”
                            </blockquote>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-border">
                                    <div className="text-blue-600 font-bold">AK</div>
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">Sarah Miller</div>
                                    <div className="text-sm text-muted-foreground">Asset Manager, BuildCo</div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Product: <span className="text-orange-600">Shelf Mobile</span>
                                </div>
                                <div className="font-bold text-muted-foreground/30 text-sm tracking-widest uppercase">BUILDCO</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
