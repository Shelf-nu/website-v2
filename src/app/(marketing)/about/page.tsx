import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScaleBlock } from "@/components/sections/scale-block";
import { ArrowRight, Github, Users, Globe } from "lucide-react";
import Link from "next/link";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: "About Us - Shelf Asset Management",
    description: "Shelf is an open-source platform for tracking and managing physical assets.",
};

export default function AboutPage() {
    return (
        <PagefindWrapper type="Page" title="About Us - Asset tracking for everyone" keywords="about about us who we are about page">
        <div className="flex min-h-screen flex-col bg-background text-heading font-sans">

            {/* 1. HERO — Standard SaaS Layout */}
            <section className="pt-32 pb-16 md:pt-48 md:pb-24 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/40 via-background to-background pointer-events-none" />
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <Badge variant="secondary" className="mb-6 bg-orange-50 text-orange-700 border-orange-100/50">
                            Our Mission
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-heading">
                            Asset tracking for <span className="text-orange-600">everyone</span>.
                        </h1>
                        <p className="text-xl md:text-2xl text-caption leading-relaxed font-light mb-8 max-w-2xl mx-auto">
                            Shelf is an open-source platform built for people who need clarity over what they own, where it is, and who has it.
                        </p>
                    </div>
                </Container>
            </section>

            {/* 2. WHY SHELF EXISTS - Standard Grid */}
            <section className="py-24 border-t border-border-subtle bg-card">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-6 text-heading">Why Shelf Exists</h2>
                            <p className="text-lg leading-relaxed text-body mb-6">
                                Physical assets are still managed with fragile tools: spreadsheets, clipboards, and disconnected systems.
                            </p>
                            <p className="text-lg leading-relaxed text-body mb-8">
                                Shelf exists to make asset management simple, transparent, and accessible — without lock-in or hidden complexity. We believe people should always understand what they own.
                            </p>
                        </div>
                        <div className="grid gap-6">
                            <Card className="bg-surface border-border-subtle shadow-sm">
                                <CardHeader className="pb-3">
                                    <Globe className="h-6 w-6 text-orange-600 mb-2" />
                                    <CardTitle>Open Source</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-body">No black boxes. Verify our code, host it yourself, or use our cloud.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-surface border-border-subtle shadow-sm">
                                <CardHeader className="pb-3">
                                    <Users className="h-6 w-6 text-orange-600 mb-2" />
                                    <CardTitle>Community Driven</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-body">Built with feedback from real users in education, logistics, and tech.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 3. GLOBE INTEGRATION */}
            <div className="border-t border-border-subtle">
                <ScaleBlock />
            </div>

            {/* 4. TEAM & COMMUNITY - Features Grid Style */}
            <section className="py-24 bg-card border-t border-border-subtle">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Built by a global team</h2>
                        <p className="text-lg text-caption">
                            Led by Carlos Virreira and Nikolay Bonev, supported by an amazing open-source community.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-12 items-start">
                        <div className="md:col-span-8 md:col-start-3">
                            <Card className="overflow-hidden border-border-subtle shadow-lg">
                                <div className="aspect-video w-full relative bg-surface">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://qliecghuzfchfjwaisyx.supabase.co/storage/v1/object/public/website-images/about/whale-team.jpg"
                                        alt="Shelf Team"
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                                <CardContent className="p-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="font-semibold text-heading mb-2">Leadership</h3>
                                            <p className="text-sm text-body leading-relaxed">
                                                We are a small, focused team obsessed with solving physical asset problems for the long term. We don&apos;t chase trends.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-heading mb-2">Community</h3>
                                            <p className="text-sm text-body leading-relaxed">
                                                Contributors from around the world help improve Shelf&apos;s core, ensuring it works for diverse use cases.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 6. LONG-TERM VISION - Dark Section */}
            <section className="py-24 bg-zinc-900 text-white">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <Badge variant="outline" className="mb-6 border-zinc-700 text-zinc-300">Long-term Vision</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">One Billion Assets.</h2>
                        <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed mb-12">
                            Our goal is to help people tag and track one billion assets — creating a world where physical belongings are as visible as digital ones.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-zinc-800 pt-12">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">100%</div>
                                <div className="text-sm text-zinc-500">Open Source</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">Global</div>
                                <div className="text-sm text-zinc-500">Availability</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">Zero</div>
                                <div className="text-sm text-zinc-500">Lock-in</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                                <div className="text-sm text-zinc-500">Reliability</div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 7. FOOTER CTA - Standard Pattern */}
            <section className="py-24 bg-surface border-t border-border-subtle">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-heading mb-6">
                            Asset Tagging and Tracking Infrastructure for Everyone™
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-8 min-w-[160px]">
                                <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=about_bottom_cta_signup">
                                    Start free <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="bg-card border-border-subtle h-12 px-8 min-w-[160px]">
                                <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=about_bottom_cta_demo">
                                    Book a demo
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="lg" className="h-12 min-w-[160px]">
                                <Link href="https://github.com/shelf-nu/shelf.nu" target="_blank">
                                    <Github className="mr-2 h-4 w-4" /> Contribute
                                </Link>
                            </Button>
                        </div>
                        <p className="mt-8 text-caption text-sm">
                            Need help? <Link href="mailto:hello@shelf.nu" className="text-heading font-medium hover:underline">Contact our team</Link>
                        </p>
                    </div>
                </Container>
            </section>
        </div>
        </PagefindWrapper>
    );
}
