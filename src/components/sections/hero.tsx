import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
            <Container>
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-ring/10 hover:ring-ring/20">
                            Announcing our new mobile app{" "}
                            <Link href="/blog/mobile-app" className="font-semibold text-primary">
                                <span className="absolute inset-0" aria-hidden="true" />
                                Read more <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Asset management for modern teams
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Track, manage, and optimize your physical assets with Shelf.
                        The all-in-one platform designed for speed and simplicity.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button size="lg" asChild>
                            <Link href="/signup">
                                Get started <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                            <Link href="/about">
                                Learn more <span aria-hidden="true">→</span>
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="mt-16 flow-root sm:mt-24">
                    <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                        <div className="rounded-md bg-background shadow-2xl ring-1 ring-gray-900/10 aspect-[16/9] flex items-center justify-center text-muted-foreground">
                            App Screenshot Placeholder
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
