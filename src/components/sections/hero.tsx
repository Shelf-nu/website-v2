import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { VideoLightbox } from "@/components/ui/video-lightbox";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Pill } from "@/components/ui/pill";
import { Play } from "lucide-react";
import { MigrationDropdown } from "@/components/sections/migration-dropdown";

interface HeroProps {
    heroImageDesktop?: string;
    heroImageMobile?: string;
}

export function Hero({
    heroImageDesktop = "/images/hero_dashboard_v3.png",
    heroImageMobile
}: HeroProps) {
    return (
        <section className="py-24 sm:py-32 relative overflow-x-clip">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 dark:from-orange-950/20 via-background to-background pointer-events-none" />

            <Container className="relative">
                {/* Centered Content Stack */}
                <div className="max-w-3xl mx-auto text-center relative z-20">
                    {/* Announcement Badge */}
                    <ScrollReveal width="100%" delay={0.1}>
                        <div className="mb-8 flex justify-center">
                            <Pill
                                href="/migrate"
                                icon={
                                    <>
                                        <span className="font-semibold">New</span>
                                        <span className="opacity-60 mx-2">|</span>
                                    </>
                                }
                            >
                                Check out our latest Migration Guides
                                <span className="ml-2 font-semibold text-orange-600">
                                    &rarr;
                                </span>
                            </Pill>
                        </div>
                    </ScrollReveal>

                    {/* Testimonials */}
                    <ScrollReveal width="100%" delay={0.15}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-lg mx-auto">
                            <div>
                                <div className="flex gap-1 mb-2 justify-center text-orange-500">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-muted-foreground/80 leading-snug">
                                    &quot;Finally, a modern and convenient asset database&quot;
                                </p>
                            </div>
                            <div>
                                <div className="flex gap-1 mb-2 justify-center text-orange-500">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-muted-foreground/80 leading-snug">
                                    &quot;Equipment reservations, no drama, no double bookings.&quot;
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Main Heading */}
                    <ScrollReveal width="100%" delay={0.2}>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.1]">
                            <span className="text-orange-600">Asset Management</span> for physical & digital equipment teams.
                        </h1>
                    </ScrollReveal>

                    {/* Subheading */}
                    <ScrollReveal width="100%" delay={0.3}>
                        <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground mb-10">
                            Shelf is the open source asset management platform for modern teams. Instantly track what you own, who&apos;s using it, and when it&apos;s available—zero spreadsheets required.
                        </p>
                    </ScrollReveal>

                    {/* CTAs */}
                    <ScrollReveal width="100%" delay={0.4}>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20" asChild>
                                    <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=homepage_hero_signup">
                                        Sign up free
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                                    <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=homepage_hero_demo">
                                        Book a demo
                                    </Link>
                                </Button>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground/60">
                                <span>Free 7-day trial <span className="mx-1 opacity-50">|</span> No credit card</span>
                                <span className="hidden sm:inline opacity-50">|</span>
                                <MigrationDropdown />
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Dashboard Image — Full-Width Below */}
                <div className="mt-16 sm:mt-20 relative mx-auto max-w-5xl">
                    <ScrollReveal width="100%" delay={0.5}>
                        <VideoLightbox videoId="RHs9nBpXuuE">
                            <div className="relative group cursor-pointer transition-transform duration-700 ease-out hover:scale-[1.01]">
                                <Image
                                    src={heroImageDesktop}
                                    alt="Shelf Asset Management — asset index with QR codes and labels"
                                    width={2432}
                                    height={1300}
                                    className={heroImageMobile ? "hidden lg:block w-full h-auto rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/50 dark:brightness-90 dark:contrast-110" : "w-full h-auto rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/50 dark:brightness-90 dark:contrast-110"}
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 1000px"
                                />

                                {heroImageMobile && (
                                    <Image
                                        src={heroImageMobile}
                                        alt="Shelf Asset Management Dashboard (Mobile)"
                                        width={2432}
                                        height={1300}
                                        className="lg:hidden w-full h-auto rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/50"
                                        priority
                                        sizes="100vw"
                                    />
                                )}

                                {/* Video Play Pill */}
                                <div className="absolute bottom-4 right-4 z-10">
                                    <div className="flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-sm px-3 py-1.5 shadow-lg shadow-black/10 group-hover:bg-card group-hover:scale-105 transition-all duration-300">
                                        <Play className="h-3.5 w-3.5 text-orange-600 fill-orange-600 ml-0.5" />
                                        <span className="text-xs font-semibold text-body">See it in action</span>
                                    </div>
                                </div>

                                {/* Ambient Glow */}
                                <div className="absolute -inset-10 bg-orange-500/5 rounded-[40%] blur-[80px] -z-10 pointer-events-none opacity-30" />
                            </div>
                        </VideoLightbox>
                    </ScrollReveal>
                </div>
            </Container>
        </section>
    );
}
