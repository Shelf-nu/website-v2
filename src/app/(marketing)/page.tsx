import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/hero";
import { LogoGrid } from "@/components/sections/logo-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomePageLogosForGrid } from "@/data/customer-logos";

const FounderLetter = dynamic(() => import("@/components/sections/founder-letter").then(m => m.FounderLetter));
const FAQSection = dynamic(() => import("@/components/sections/faq").then(m => m.FAQSection));
const ScaleBlock = dynamic(() => import("@/components/sections/scale-block").then(m => m.ScaleBlock));
const CaseStudiesPreview = dynamic(() => import("@/components/sections/case-studies-preview").then(m => m.CaseStudiesPreview));
const FeatureNavigationCTA = dynamic(() => import("@/components/sections/feature-navigation-cta").then(m => m.FeatureNavigationCTA));

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
