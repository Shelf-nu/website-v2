"use client";

import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Image from "next/image";
import Link from "next/link";

export function FounderLetter() {
    return (
        <section className="py-24 sm:py-32 bg-[darkslategray] text-white relative overflow-hidden">
            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-[darkslategray] to-[darkslategray]" />

            <Container className="relative">
                <ScrollReveal width="100%">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Content */}
                        <div className="text-center mb-16 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                                Built for teams that <br className="hidden md:block" />
                                <span className="text-orange-500">manage real assets.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                Already trusted to track hundreds of thousands of assets — and counting.
                            </p>
                        </div>

                        {/* The Letter Card - Styled to look like high-quality stationery */}
                        <div className="bg-[#FFFFFC] text-zinc-900 rounded-lg p-8 md:p-12 lg:p-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-zinc-200 relative mx-auto max-w-3xl transform rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                            {/* Paper texture/highlight effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none rounded-lg" />

                            {/* "From the desk of" Header */}


                            <div className="relative space-y-6 text-lg md:text-[1.125rem] leading-relaxed font-normal text-zinc-800">
                                <p>
                                    Shelf didn’t start as a grand vision.
                                </p>
                                <p>
                                    It started as a practical solution to a very practical problem: asset management shouldn’t be this hard.
                                </p>
                                <p>
                                    Today, teams use Shelf to track hundreds of thousands of assets across studios, universities, production teams, and operations groups worldwide.
                                </p>
                                <p className="font-semibold text-zinc-900">
                                    Why? Because Shelf stays focused.
                                </p>
                                <p>
                                    It does the core job well: <Link href="/features/location-tracking" className="text-zinc-900 font-medium underline decoration-zinc-300 underline-offset-4 hover:text-orange-600 hover:decoration-orange-600 transition-all">tracking</Link>, <Link href="/features/bookings" className="text-zinc-900 font-medium underline decoration-zinc-300 underline-offset-4 hover:text-orange-600 hover:decoration-orange-600 transition-all">availability</Link>, <Link href="/features/bookings" className="text-zinc-900 font-medium underline decoration-zinc-300 underline-offset-4 hover:text-orange-600 hover:decoration-orange-600 transition-all">bookings</Link>, <Link href="/features/custody" className="text-zinc-900 font-medium underline decoration-zinc-300 underline-offset-4 hover:text-orange-600 hover:decoration-orange-600 transition-all">accountability</Link>. And it avoids the bloat that slows teams down over time.
                                </p>
                                <p>
                                    If you’re done fighting your tools and ready to trust them again, Shelf is ready for you.
                                </p>
                            </div>

                            <div className="relative mt-12 pt-8 flex items-end gap-6">
                                {/* Signature Image */}
                                <div className="flex-1">
                                    <div className="mb-4 ml-[-10px]">
                                        <Image
                                            src="/images/founder/signature.svg"
                                            alt="Carlos Virreira Signature"
                                            width={180}
                                            height={80}
                                            className="opacity-90 invert-0"
                                        />
                                    </div>
                                    <div className="font-bold text-zinc-900 text-lg">Carlos Virreira</div>
                                    <div className="text-sm font-medium text-zinc-500 uppercase tracking-wide mt-0.5">Founder & CEO, Shelf</div>
                                </div>

                                {/* CEO Portrait */}
                                <div className="relative h-20 w-20 rounded-lg overflow-hidden ring-1 ring-zinc-900/5 shadow-sm bg-zinc-100 rotate-3">
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
                </ScrollReveal>
            </Container>
        </section>
    );
}
