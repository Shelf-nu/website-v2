import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { solutions } from "@/data/solutions";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTA } from "@/components/sections/cta";

export const metadata = {
    title: "Solutions - Shelf Asset Management",
    description: "Tailored asset management workflows for your industry.",
};

export default function SolutionsPage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Ambient Background Gradient & Grid */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-24">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Solutions</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Built for <span className="text-orange-600">every scale</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Whether you're managing a university campus, a construction fleet, or IT for a distributed team, Shelf adapts to your workflow.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map((solution, index) => (
                        <ScrollReveal key={solution.title} width="100%" delay={index * 0.05} className="h-full">
                            <Link href={solution.href} className="group block h-full">
                                <div className="h-full p-8 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
                                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm text-orange-600 group-hover:scale-110 group-hover:bg-orange-50/50 transition-all duration-300">
                                        <solution.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-orange-600 transition-colors">
                                        {solution.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1">
                                        {solution.description}
                                    </p>
                                    <div className="mt-6 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                                        Explore solution <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </Container>

            <CTA />
        </div>
    );
}
