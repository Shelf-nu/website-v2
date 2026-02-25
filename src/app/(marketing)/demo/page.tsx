import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { DemoForm } from "@/components/forms/demo-form";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: "Book a Demo - Shelf Asset Management",
    description: "See how Shelf can help your team track assets effortlessly.",
};

export default function DemoPage() {
    return (
        <PagefindWrapper type="Page" title="Book a Demo - See Shelf in action" keywords="demo book a demo request demo schedule demo demo page">
        <div className="flex flex-col min-h-screen relative">
            {/* Ambient Background Gradient (reused from pricing for consistency) */}
            {/* Ambient Background Gradient & Grid */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="pt-32 pb-12 md:pt-48 md:pb-24 relative z-10 flex-1 flex flex-col justify-center">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    {/* LEFT COLUMN: Messaging & Bento */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100/50">
                                Book a Demo
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground mb-6">
                                See Shelf in <span className="text-orange-600">action.</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                                Get a personalized walkthrough of the platform and see how we can help you track your physical assets.
                            </p>
                        </div>

                        {/* Mini Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card 1: Review - Toby */}
                            <div className="md:col-span-2 bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" />
                                    ))}
                                </div>
                                <blockquote className="text-lg font-medium leading-normal mb-4">
                                    &quot;Having SHELF has massively improved our ability to locate equipment... This makes purchasing much easier and will prevent over and under purchasing of equipment.&quot;
                                </blockquote>
                                <div className="flex items-center gap-3">
                                    <Image src="/testimonials/toby.jpeg" alt="Toby Liversedge" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                    <div>
                                        <div className="font-semibold text-sm">Toby Liversedge</div>
                                        <div className="text-xs text-muted-foreground">Support Supervisor | Resq | Migrated from Excel</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Review - Steve */}
                            <div className="md:col-span-2 bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" />
                                    ))}
                                </div>
                                <blockquote className="text-lg font-medium leading-normal mb-4">
                                    &quot;Migrating to Shelf let us modernize without losing the systems we’d already invested in. The team adapted Shelf to work perfectly with our DYMO label workflow—no retraining, no downtime, just a seamless upgrade.&quot;
                                </blockquote>
                                <div className="flex items-center gap-3">
                                    <Image src="/testimonials/steve.jpeg" alt="Steve Gardels" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                    <div>
                                        <div className="font-semibold text-sm">Steve Gardels</div>
                                        <div className="text-xs text-muted-foreground">Media Center Manager | Kansas City Art Institute | Migrated from Cheqroom</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Quick Stat */}
                            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between min-h-[140px]">
                                <Quote className="h-6 w-6 text-muted-foreground/30 mb-4" />
                                <div>
                                    <div className="text-3xl font-bold text-foreground">99.9%</div>
                                    <div className="text-sm text-muted-foreground font-medium mt-1">Asset Accuracy</div>
                                </div>
                            </div>

                            {/* Card 3: Trust Badge */}
                            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-center items-center text-center min-h-[140px]">
                                <div className="text-sm font-semibold text-muted-foreground mb-2">Trusted by modern teams</div>
                                <div className="flex -space-x-2">
                                    {[
                                        { src: "/logos/nokia.png", alt: "Nokia" },
                                        { src: "/logos/universal-music.png", alt: "Universal Music" },
                                        { src: "/logos/virgin-hyperloop.webp", alt: "Virgin Hyperloop" }
                                    ].map((logo, i) => (
                                        <div key={i} className="relative h-8 w-8 rounded-full border-2 border-background bg-white flex items-center justify-center overflow-hidden">
                                            <Image src={logo.src} alt={logo.alt} fill className="object-contain p-1" />
                                        </div>
                                    ))}
                                    <div className="h-8 w-8 rounded-full border-2 border-background bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700">
                                        +500
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Form */}
                    <div className="lg:sticky lg:top-32">
                        <Card className="border-border shadow-2xl bg-background">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl">Book your demo</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we&apos;ll be in touch shortly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<div className="h-[400px] animate-pulse rounded-lg bg-muted/50" />}>
                                    <DemoForm />
                                </Suspense>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </Container>
        </div>
        </PagefindWrapper>
    );
}
