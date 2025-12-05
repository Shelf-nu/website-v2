import { Container } from "@/components/ui/container";

export function Logos() {
    return (
        <section className="py-24 sm:py-32 border-y bg-muted/20">
            <Container>
                <h2 className="text-center text-lg font-semibold leading-8 text-foreground">
                    Trusted by the world’s most innovative teams
                </h2>
                <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 flex items-center justify-center">
                            <div className="h-8 w-32 bg-foreground/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
