import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Concepts - Shelf",
    description: "Learn about asset management concepts.",
};

export default function ConceptsIndexPage() {
    const concepts = getAllContent("concepts");

    return (
        <Container className="py-20">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    Concepts
                </h1>
                <p className="text-xl text-muted-foreground">
                    Deep dives into core asset management ideas.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {concepts.map((concept) => (
                    <Link key={concept.slug} href={`/concepts/${concept.slug}`} className="group block h-full">
                        <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="group-hover:text-primary transition-colors">
                                    {concept.frontmatter.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {concept.frontmatter.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </Container>
    );
}
