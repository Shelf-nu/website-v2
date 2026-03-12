import { Hero } from "@/components/sections/hero";
import { LogoGrid } from "@/components/sections/logo-grid";
import { FounderLetter } from "@/components/sections/founder-letter";
import { ScaleBlock } from "@/components/sections/scale-block";

import { FAQSection } from "@/components/sections/faq";
import { FeatureNavigationCTA } from "@/components/sections/feature-navigation-cta";
import { CaseStudiesPreview } from "@/components/sections/case-studies-preview";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomePageLogosForGrid } from "@/data/customer-logos";

export const metadata = {
    title: "Open Source Asset Management Software — Free for Teams",
    description: "Shelf is the open source asset management platform for modern teams. Track equipment, bookings, and inventory — free for individuals, no credit card required.",
    alternates: {
        canonical: "https://www.shelf.nu",
    },
};

export default function HomePage() {
    return (
        <>
            <JsonLd />
            <Hero />

            <LogoGrid items={getHomePageLogosForGrid()} />
            <FounderLetter />


            <FAQSection />
            <ScaleBlock />
            <CaseStudiesPreview />
            <FeatureNavigationCTA />
        </>
    );
}
