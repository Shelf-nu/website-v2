"use client";

import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";

export function FounderLetter() {
    return (
        <section className="py-24 sm:py-32 bg-zinc-950 text-white relative overflow-hidden">
            {/* Background layers */}
            <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/8 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent pointer-events-none" />

            <Container className="relative">
                <ScrollReveal width="100%">
                    <div className="max-w-4xl mx-auto">
                        {/* Section label */}
                        <div className="text-center mb-14 sm:mb-16">
                            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-5">
                                A note from our founder
                            </p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                                Built for teams that <br className="hidden sm:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">manage real assets.</span>
                            </h2>
                            <p className="mt-5 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                                Already trusted to track hundreds of thousands of assets — and counting.
                            </p>
                        </div>

                        {/* The Letter Card */}
                        <div className="relative max-w-3xl mx-auto">
                            {/* Card glow effect */}
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/50 via-zinc-800/20 to-zinc-800/50 pointer-events-none" />

                            <div className="relative bg-[#FAFAF8] text-zinc-900 rounded-2xl p-8 sm:p-10 md:p-14 shadow-2xl shadow-black/40">
                                {/* Decorative quote mark */}
                                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 md:top-10 md:right-10">
                                    <Quote className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500/10 rotate-180" />
                                </div>

                                {/* Letter body */}
                                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-zinc-700">
                                    <p>
                                        Shelf didn&apos;t start as a grand vision.
                                    </p>
                                    <p>
                                        It started as a practical solution to a very practical problem: asset management shouldn&apos;t be this hard.
                                    </p>
                                    <p>
                                        Today, teams use Shelf to track hundreds of thousands of assets across studios, universities, production teams, and operations groups worldwide.
                                    </p>
                                    <p className="font-semibold text-zinc-900">
                                        Why? Because Shelf stays focused.
                                    </p>
                                    <p>
                                        It does the core job well:{" "}
                                        <Link href="/features/location-tracking" className="text-zinc-900 font-medium underline decoration-orange-300/60 underline-offset-4 hover:text-orange-600 hover:decoration-orange-500 transition-all">tracking</Link>,{" "}
                                        <Link href="/features/bookings" className="text-zinc-900 font-medium underline decoration-orange-300/60 underline-offset-4 hover:text-orange-600 hover:decoration-orange-500 transition-all">availability</Link>,{" "}
                                        <Link href="/features/bookings" className="text-zinc-900 font-medium underline decoration-orange-300/60 underline-offset-4 hover:text-orange-600 hover:decoration-orange-500 transition-all">bookings</Link>,{" "}
                                        <Link href="/features/custody" className="text-zinc-900 font-medium underline decoration-orange-300/60 underline-offset-4 hover:text-orange-600 hover:decoration-orange-500 transition-all">accountability</Link>.
                                        {" "}And it avoids the bloat that slows teams down over time.
                                    </p>
                                    <p>
                                        If you&apos;re done fighting your tools and ready to trust them again, Shelf is ready for you.
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="mt-10 mb-8 border-t border-zinc-200" />

                                {/* Signature area */}
                                <div className="flex items-end justify-between gap-6">
                                    <div>
                                        <div className="mb-3 ml-[-8px]">
                                            <Image
                                                src="/images/founder/signature.svg"
                                                alt="Carlos Virreira Signature"
                                                width={160}
                                                height={64}
                                                className="opacity-85"
                                            />
                                        </div>
                                        <div className="font-bold text-zinc-900 text-base sm:text-lg">Carlos Virreira</div>
                                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-1">Founder & CEO</div>
                                    </div>

                                    {/* CEO Portrait */}
                                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden ring-1 ring-zinc-900/5 shadow-lg flex-shrink-0">
                                        <Image
                                            src="/images/founder/ceo.jpg"
                                            alt="Carlos Virreira"
                                            fill
                                            className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
