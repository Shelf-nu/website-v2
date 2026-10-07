import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DarkGlow } from "@/components/ui/ambient-glow";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { PlayStoreBadge } from "@/components/ui/play-store-badge";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { COMPANION } from "@/data/home";
import { ScanToInstall } from "@/components/mobile/scan-to-install";

const badgeClass = "border-neutral-800 bg-neutral-900/50 text-white hover:bg-neutral-900 hover:text-white";

/**
 * How do I start? One action, with the demo as a quiet second path, then the
 * Companion app for the people who will use Shelf standing up.
 */
export function HomeClosing() {
    return (
        <section data-pagefind-ignore className="relative overflow-hidden bg-neutral-950 py-20 sm:py-24">
            <DarkGlow />
            <Container className="relative">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-balance text-white md:text-5xl">Ready to organize your assets?</h2>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-neutral-400">Join thousands of teams who trust Shelf to manage their physical assets. Free forever, or try the Team plan free for 7 days.</p>
                    <div className="mt-8 flex justify-center">
                        <Button size="lg" variant="secondary" className="h-12 bg-white px-8 text-neutral-900 hover:bg-neutral-200" asChild>
                            <TrackedLink href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=homepage_bottom_signup" eventName="signup_click" eventProps={{ location: "home_bottom" }}>
                                Get Started for Free <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                            </TrackedLink>
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-neutral-400">
                        Prefer a walkthrough first?{" "}
                        <TrackedLink href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=homepage_bottom_demo" eventName="demo_cta" eventProps={{ location: "home_bottom" }} className="font-medium text-white underline decoration-white/35 underline-offset-4 hover:decoration-white">
                            Book a demo
                        </TrackedLink>
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 items-center gap-8 rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8">
                    <div className="mx-auto grid w-full max-w-[260px] grid-cols-2 gap-3">
                        {[COMPANION.asset, COMPANION.inventory].map((shot) => (
                            <Image key={shot.src} src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="130px" className="h-auto w-full rounded-[12px] ring-1 ring-white/10" />
                        ))}
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-400">Shelf Companion</p>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">Out in the field? Take Shelf with you.</h3>
                        <p className="mt-3 text-base leading-relaxed text-neutral-400">Scan labels, check gear in and out, and update assets from your phone. Free with every Shelf account, on iPhone and Android.</p>
                        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                            <AppStoreBadge location="home_bottom" variant="outline" className={badgeClass} />
                            <PlayStoreBadge location="home_bottom" variant="outline" className={badgeClass} />
                        </div>
                        <ScanToInstall onDark className="mt-6 hidden lg:flex" />
                    </div>
                </div>
            </Container>
        </section>
    );
}
