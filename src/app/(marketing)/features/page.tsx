import { Container } from "@/components/ui/container";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features - Shelf Asset Management",
    description: "Explore the powerful features that make Shelf the best choice for modern asset tracking.",
};

export default function FeaturesPage() {
    const features = getAllContent("features");

    return (
        <div className="flex min-h-screen flex-col">
            <Container className="py-20 md:py-32">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Everything you need to manage your assets
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        From simple tagging to complex lifecycle management, Shelf has you covered.
                    </p>
                </div>

                <FeaturesGrid features={features} />
            </Container>
        </div>
    );
}
