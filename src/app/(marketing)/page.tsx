import { Hero } from "@/components/sections/hero";
import { LogoGrid } from "@/components/sections/logo-grid";
import { FounderLetter } from "@/components/sections/founder-letter";
import { ScaleBlock } from "@/components/sections/scale-block";

import { FAQSection } from "@/components/sections/faq";
import { FeatureNavigationCTA } from "@/components/sections/feature-navigation-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomePageLogosForGrid } from "@/data/customer-logos";

export const metadata = {
    title: "The Open Source Asset Tracking Platform",
    description: "Shelf is the asset management platform for modern teams. Track equipment, bookings, and inventory with a clean, open source tool.",
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
            <FeatureNavigationCTA />
        </>
    );
}
