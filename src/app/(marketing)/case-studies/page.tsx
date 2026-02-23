import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CaseStudyCard } from "@/components/sections/case-studies/case-study-card";
import { LogoWall } from "@/components/sections/case-studies/logo-wall";
import { TestimonialsSection } from "@/components/sections/case-studies/testimonials-section";

export const metadata: Metadata = {
    title: "Customers - Shelf",
    description: "See how leading teams use Shelf to track assets and streamline operations.",
};

export default function CaseStudiesIndexPage() {
    const caseStudies = getAllContent("case-studies");

    // Transform MDX content into LogoItem format for the wall
    const logoItems = caseStudies.map((study) => {
        const customerField = study.frontmatter.customer;
        const customerName = typeof customerField === 'object' ? customerField.name : (customerField || study.frontmatter.title);
        const customerLogo = typeof customerField === 'object' ? customerField.logo : study.frontmatter.logo;

        return {
            id: study.slug,
            name: customerName,
            logo: customerLogo,
            // Take the first industry if array, or default to "General"
            industry: Array.isArray(study.frontmatter.industry) ? study.frontmatter.industry[0] : (study.frontmatter.industry || "General"),
            description: study.frontmatter.description || study.frontmatter.summary || "",
            slug: study.slug,
            productUsed: "Shelf for Teams" // Mocking this as requested
        };
    });

    return (
        <div className="flex min-h-screen flex-col">

            {/* 1. Header Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <Container className="text-center relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                        Trusted by modern <span className="text-orange-600">teams</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
                        From recovering $70k drones to managing university film equipment. See how Shelf adapts to any workflow.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=case_studies_hero_signup">
                                Start for free <ArrowRight />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=case_studies_hero_demo">
                                Book a demo
                            </Link>
                        </Button>
                    </div>
                </Container>
            </section>

            {/* 2. Case Studies Grid (Top Tier) */}
            <section className="py-12 md:py-20">
                <Container>
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Featured Stories</h2>
                        <p className="text-muted-foreground">Deep dives into how customers solve complex asset problems.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {caseStudies.map((study) => (
                            <CaseStudyCard
                                key={study.slug}
                                slug={study.slug}
                                title={study.frontmatter.title}
                                summary={study.frontmatter.summary || study.frontmatter.description}
                                coverImage={study.frontmatter.coverImage}
                                logo={study.frontmatter.logo}
                                industry={Array.isArray(study.frontmatter.industry) ? study.frontmatter.industry : [study.frontmatter.industry || "General"]}
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* 3. Testimonials Block */}
            <TestimonialsSection />

            {/* 4. Logo Wall (Filterable) */}
            <section className="py-24 md:py-32">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">You&apos;re in good company</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of teams using Shelf to track what matters. Filter by industry to see who else is onboard.
                        </p>
                    </div>

                    <LogoWall items={logoItems} />
                </Container>
            </section>

            {/* 5. Final CTA */}
            <section className="py-24 bg-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <Container className="relative text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to organize your assets?
                    </h2>
                    <p className="text-orange-100 text-lg mb-10 max-w-xl mx-auto">
                        Stop losing equipment and start tracking in minutes. No credit card required.
                    </p>
                    <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700" asChild>
                        <Link href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=case_studies_bottom_cta_signup">
                            Get Started for Free <ArrowRight />
                        </Link>
                    </Button>
                </Container>
            </section>

        </div>
    );
}
