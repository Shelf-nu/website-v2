import dynamic from "next/dynamic";
import { JsonLd } from "@/components/seo/json-ld";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { HomeHero } from "@/components/sections/home/home-hero";
import { HomeTrust } from "@/components/sections/home/home-trust";

// Below the fold: split out of the first chunk. They are still server-rendered
// into the static HTML, so their text and links are there for crawlers.
const HomeWhySwitch = dynamic(() => import("@/components/sections/home/home-why-switch").then(m => m.HomeWhySwitch));
const ScaleBlock = dynamic(() => import("@/components/sections/scale-block").then(m => m.ScaleBlock));
const HomePlatform = dynamic(() => import("@/components/sections/home/home-platform").then(m => m.HomePlatform));
const HomeQuestions = dynamic(() => import("@/components/sections/home/home-questions").then(m => m.HomeQuestions));
const HomeSegments = dynamic(() => import("@/components/sections/home/home-segments").then(m => m.HomeSegments));
const HomeStories = dynamic(() => import("@/components/sections/home/home-stories").then(m => m.HomeStories));
const FounderLetter = dynamic(() => import("@/components/sections/founder-letter").then(m => m.FounderLetter));
const HomeClosing = dynamic(() => import("@/components/sections/home/home-closing").then(m => m.HomeClosing));

// SEO: title, description, canonical and the h1 (in HomeHero) are what this page
// ranks with. exp-002 made this title the winner. Do not edit them as part of a
// design change.
export const metadata = {
    title: "Open Source Asset Management Software — Free for Teams",
    description: "Shelf is the open source asset management platform for modern teams. Track equipment, bookings, and inventory — free for individuals, no credit card required.",
    alternates: {
        canonical: "https://www.shelf.nu",
    },
};

export default function HomePage() {
    return (
        <PagefindWrapper type="Page" title="Shelf — Open Source Asset Management Software" keywords="asset management equipment tracking inventory open source shelf">
            <JsonLd />
            {/* 1. What is this?  2. Who already trusts it? */}
            <HomeHero />
            <HomeTrust />
            {/* 3. Why switch?  4. Does it hold up at scale? */}
            <HomeWhySwitch />
            <ScaleBlock />
            {/* 5. What does it do now?  6. "But does it...?" */}
            <HomePlatform />
            <HomeQuestions />
            {/* 7. Is it for me?  8. Who says so?  9. Why trust you? */}
            <HomeSegments />
            <HomeStories />
            <FounderLetter />
            {/* 10. How do I start? */}
            <HomeClosing />
        </PagefindWrapper>
    );
}
