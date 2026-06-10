import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { PlayStoreBadge } from "@/components/ui/play-store-badge";

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
                        Free forever, or try the Team plan free for 7 days.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" variant="secondary" className="bg-white text-neutral-900 hover:bg-neutral-200 h-12 px-8" asChild>
                            <TrackedLink
                                href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=global_bottom_cta_signup"
                                eventName="signup_click"
                                eventProps={{ location: "global_bottom_cta" }}
                            >
                                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                            </TrackedLink>
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:text-white h-12 px-8" asChild>
                            <TrackedLink
                                href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=global_bottom_cta_demo"
                                eventName="demo_cta"
                                eventProps={{ location: "global_bottom_cta" }}
                            >
                                Book a demo
                            </TrackedLink>
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-sm text-neutral-500">
                            Out in the field? Shelf Companion is free on iPhone &amp; Android.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <AppStoreBadge
                                variant="outline"
                                className="text-white border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:text-white"
                            />
                            <PlayStoreBadge
                                variant="outline"
                                className="text-white border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:text-white"
                            />
                        </div>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
