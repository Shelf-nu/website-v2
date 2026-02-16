import { Hero } from "@/components/sections/hero";
import { FeatureSection } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LogoGrid } from "@/components/sections/logo-grid";
import { FounderLetter } from "@/components/sections/founder-letter";
import { ScaleBlock } from "@/components/sections/scale-block";

import { TestimonialsSection } from "@/components/sections/case-studies/testimonials-section";
import { FAQSection } from "@/components/sections/faq";
import { FeatureNavigationCTA } from "@/components/sections/feature-navigation-cta";
import { JsonLd } from "@/components/seo/json-ld";

// Default high-impact logos for the home page
const homePageLogos = [
    // Row 1
    { id: "ces", name: "CES Utility", logo: "/logos/ces-utility.svg", slug: "ces-70k-recovery" },
    { id: "fabel", name: "Fabel Film", logo: "/logos/fabel-film.svg", slug: "fabel-film-double-bookings" },
    { id: "haarp", name: "HAARP", logo: "/logos/haarp.svg", slug: "haarp" },
    { id: "resq", name: "ResQ", logo: "/logos/resq.svg", slug: "resq" },

    // Row 2
    { id: "uni-music", name: "Universal Music", logo: "/logos/universal-music.svg" },
    { id: "nokia", name: "Nokia", logo: "/logos/nokia.svg" },
    { id: "virgin", name: "Virgin Hyperloop", logo: "/logos/virgin-hyperloop.svg" },
    { id: "brabant", name: "Brabant", logo: "/logos/brabant.svg" }
];

export const metadata = {
    title: "The Open Source Asset Tracking Platform",
    description: "Shelf is the asset management platform for modern teams. Track equipment, bookings, and inventory with a clean, open source tool.",
};

export default function HomePage() {
    return (
        <>
            <JsonLd />
            <Hero />

            <LogoGrid items={homePageLogos} />
            <FounderLetter />


            <FAQSection />
            <ScaleBlock />
            <FeatureNavigationCTA />
        </>
    );
}
