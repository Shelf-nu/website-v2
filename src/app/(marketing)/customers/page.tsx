import Link from "next/link";
import Image from "next/image";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Globe, Package, Quote } from "lucide-react";
import { CaseStudyCard } from "@/components/sections/case-studies/case-study-card";
import { CUSTOMER_LOGOS, getTestimonialLogos } from "@/data/customer-logos";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";
import { CustomerLogoWall } from "@/components/sections/customers/customer-logo-wall";

export const metadata: Metadata = {
    title: "Customers - Shelf",
    description:
        "Over 3,000 teams worldwide trust Shelf to track and manage their assets. See testimonials, case studies, and the companies that rely on Shelf.",
};

export default function CustomersPage() {
    const caseStudies = getAllContent("case-studies");
    const testimonials = getTestimonialLogos();

    // Build logo items for the wall from the centralized registry
    const logoItems = CUSTOMER_LOGOS.map((logo) => ({
        id: logo.id,
        name: logo.name,
        logo: logo.logo,
        industry: logo.industry || "Other",
        caseStudySlug: logo.caseStudySlug,
    }));

    return (
        <div className="flex min-h-screen flex-col">
            {/* 1. Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <Container className="text-center relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-8">
                        <Users className="h-3.5 w-3.5" />
                        Customers
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                        Trusted by <span className="text-orange-600">3,000+</span> teams worldwide
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
                        From recovering $70k drones to managing university film equipment, teams across 50+ countries rely on Shelf to track what matters.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=customers_hero_signup">
                                Start for free <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=customers_hero_demo">Book a demo</Link>
                        </Button>
                    </div>
                </Container>
            </section>

            {/* 2. Stats bar */}
            <section className="border-y border-border/40 bg-muted/20 py-12">
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-foreground">3,000+</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                                <Users className="h-3.5 w-3.5" /> Teams using Shelf
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-foreground">200k+</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                                <Package className="h-3.5 w-3.5" /> Assets tracked
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-foreground">50+</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                                <Globe className="h-3.5 w-3.5" /> Countries
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 3. Testimonials */}
            <section className="py-24 md:py-32">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            What our customers say
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Real feedback from teams who switched to Shelf.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((t, index) => (
                            <ScrollReveal key={t.id} delay={index * 0.1}>
                                <div className="relative rounded-2xl bg-background border border-border/60 p-8 md:p-10 shadow-sm hover:shadow-lg hover:border-orange-500/20 transition-all h-full flex flex-col">
                                    <Quote className="h-8 w-8 text-orange-500/15 mb-4" />
                                    <blockquote className="text-lg font-medium leading-relaxed text-foreground tracking-tight flex-1">
                                        &ldquo;{t.quote}&rdquo;
                                    </blockquote>

                                    <div className="mt-8 flex items-center gap-4 pt-6 border-t border-border/50">
                                        <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <Image
                                                src={t.logo}
                                                alt={t.name}
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground text-sm">
                                                {t.quoteAuthor}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {t.quoteRole}
                                            </div>
                                        </div>
                                        {t.caseStudySlug && (
                                            <Link
                                                href={`/case-studies/${t.caseStudySlug}`}
                                                className="ml-auto text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                            >
                                                Read story <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </Container>
            </section>

            {/* 4. Logo Wall — all customers by industry */}
            <section className="py-24 md:py-32 bg-muted/20 border-y border-border/40">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            You&apos;re in good company
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {CUSTOMER_LOGOS.length} organizations across every industry trust Shelf to manage their assets. Filter by industry to find teams like yours.
                        </p>
                    </div>
                    <CustomerLogoWall items={logoItems} />
                </Container>
            </section>

            {/* 5. Case Studies */}
            <section className="py-24 md:py-32">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            Featured stories
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Deep dives into how customers solve complex asset problems with Shelf.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {caseStudies.map((study) => (
                            <CaseStudyCard
                                key={study.slug}
                                slug={study.slug}
                                title={study.frontmatter.title}
                                summary={
                                    study.frontmatter.summary ||
                                    study.frontmatter.description
                                }
                                coverImage={study.frontmatter.coverImage}
                                logo={study.frontmatter.logo}
                                industry={
                                    Array.isArray(study.frontmatter.industry)
                                        ? study.frontmatter.industry
                                        : [study.frontmatter.industry || "General"]
                                }
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* 6. CTA */}
            <CTA />
        </div>
    );
}
