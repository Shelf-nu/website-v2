import { Container } from "@/components/ui/container";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";
import { PageHeader } from "@/components/layouts/shared/page-header";

export const metadata: Metadata = {
    title: "Features - Shelf Asset Management",
    description: "Explore the powerful features that make Shelf the best choice for modern asset tracking.",
};

export default function FeaturesPage() {
    const features = getAllContent("features");

    return (
        <div className="flex min-h-screen flex-col">
            <PageHeader
                title="Everything you need to manage your assets"
                description="From simple tagging to complex lifecycle management, Shelf has you covered."
                heroTagline="Features"
            />

            <Container className="py-16 md:py-24">
                <FeaturesGrid features={features} />
            </Container>
        </div>
    );
}
