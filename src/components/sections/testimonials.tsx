import { Container } from "@/components/ui/container";

export function Testimonials() {
    return (
        <section className="py-24 sm:py-32 bg-muted/50">
            <Container>
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Testimonials
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Trusted by the best
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col justify-between bg-background p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                                <blockquote className="text-lg leading-8 text-muted-foreground">
                                    <p>
                                        “Shelf has completely transformed how we manage our inventory. It's intuitive, fast, and reliable.”
                                    </p>
                                </blockquote>
                                <div className="mt-6 flex items-center gap-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-100" />
                                    <div>
                                        <div className="font-semibold text-foreground">Jane Doe</div>
                                        <div className="text-sm leading-6 text-muted-foreground">CTO, Tech Corp</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
