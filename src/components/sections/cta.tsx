import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CTA() {
    return (
        <section className="py-16 sm:py-24">
            <Container>
                <div className="relative isolate overflow-hidden bg-primary px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                        Ready to get started?
                        <br />
                        Start your free trial today.
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
                        Join thousands of teams who trust Shelf to manage their physical assets.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/signup">Get started</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                            <Link href="/contact">Contact sales</Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
