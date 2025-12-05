import { Hero } from "@/components/sections/hero";
import { FeatureSection } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Logos } from "@/components/sections/logos";
import { Testimonials } from "@/components/sections/testimonials";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
    return (
        <>
            <Hero />
            <Logos />
            <FeatureSection />
            <HowItWorks />
            <Testimonials />
            <CTA />
        </>
    );
}
