import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { MigrationDropdown } from "@/components/sections/migration-dropdown";
import { preload } from "react-dom";
import { HERO_VIEWS } from "@/data/home";
import { HeroStage } from "./hero-stage";
import { HERO_SIZES } from "./hero-sizes";

/**
 * Homepage hero. The h1 text is identical to the previous hero on purpose:
 * it is part of what the page ranks with. No ScrollReveal here, so the LCP
 * content paints without waiting for hydration.
 */
export function HomeHero() {
    // The first product view is the LCP element. It is a plain <img> with a
    // srcset (see shot.tsx), so it gets the preload next/image would have added.
    const lcp = HERO_VIEWS[0].shot;
    preload(lcp.src, { as: "image", fetchPriority: "high", imageSrcSet: lcp.srcSet, imageSizes: lcp.srcSet ? HERO_SIZES : undefined });

    return (
        <section className="relative overflow-x-clip border-b border-border pt-24 sm:pt-32">
            <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background dark:from-orange-950/20" />

            <Container className="relative">
                {/* max-w-5xl is for the h1; every other child sets its own narrower width. */}
                <div className="relative z-20 mx-auto max-w-5xl text-center">
                    <div className="mb-6 flex justify-center">
                        <Pill
                            href="/mobile-app"
                            icon={
                                <>
                                    <span className="font-semibold">New</span>
                                    <span className="mx-2 opacity-60">|</span>
                                </>
                            }
                        >
                            Shelf Companion is now on iPhone &amp; Android
                            <span className="ml-2 font-semibold text-orange-600">&rarr;</span>
                        </Pill>
                    </div>

                    <h1 className="mb-5 text-4xl font-bold leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        The equipment platform your team <span className="text-orange-600">will actually use.</span>
                    </h1>

                    <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Track equipment, book it, and know who has it, from the web or your phone. Free to start, and running in production for 3,000+ teams in 50+ countries.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                            <Button size="lg" className="w-full bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 sm:w-auto" asChild>
                                <TrackedLink href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=homepage_hero_signup" eventName="signup_click" eventProps={{ location: "hero" }}>
                                    Sign up free
                                </TrackedLink>
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                                <TrackedLink href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=homepage_hero_demo" eventName="demo_cta" eventProps={{ location: "hero" }}>
                                    Book a demo
                                </TrackedLink>
                            </Button>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row">
                            <span>
                                Free forever <span className="mx-1 opacity-50">|</span> 7-day Team trial <span className="mx-1 opacity-50">|</span> No credit card
                            </span>
                            <span className="hidden opacity-50 sm:inline">|</span>
                            <MigrationDropdown />
                        </div>
                    </div>
                </div>

                <HeroStage />
            </Container>
        </section>
    );
}
