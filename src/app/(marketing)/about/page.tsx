import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Us - Shelf Asset Management",
    description: "We are on a mission to make asset tracking simple and accessible for everyone.",
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Container className="py-20 md:py-32">
                <div className="mx-auto max-w-3xl text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        We help teams keep track of their things
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Shelf was born out of frustration with clunky, expensive enterprise software.
                        We believe that tracking your assets should be as easy as checking your email.
                    </p>
                </div>

                <div className="prose prose-lg dark:prose-invert mx-auto max-w-3xl">
                    <h2>Our Mission</h2>
                    <p>
                        To enable every organization, from schools to construction companies, to have
                        complete visibility over their physical tools and equipment. We are building
                        the operating system for physical assets.
                    </p>

                    <h2>The Story</h2>
                    <p>
                        In 2023, we saw a gap in the market. Spreadsheets were too error-prone, and
                        existing "enterprise" solutions were stuck in the 90s. We decided to build
                        Shelf with a focus on:
                    </p>
                    <ul>
                        <li><strong>Mobile-first design:</strong> Because tracking happens in the field, not at a desk.</li>
                        <li><strong>Openness:</strong> Our software plays nice with others (API first).</li>
                        <li><strong>Simplicity:</strong> No training manuals required.</li>
                    </ul>
                </div>
            </Container>
        </div>
    );
}
