import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { FeaturesGrid } from "@/components/sections/features-grid";

export const metadata: Metadata = {
    title: "Features - Shelf",
    description: "Explore all the features Shelf has to offer.",
};

export default function FeaturesIndexPage() {
    const features = getAllContent("features");

    return (
        <Container className="py-24 sm:py-32">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                    Platform Features
                </h1>
                <p className="text-xl text-muted-foreground">
                    Everything you need to manage your physical assets with precision and ease.
                </p>
            </div>

            <FeaturesGrid features={features} />
        </Container>
    );
}
