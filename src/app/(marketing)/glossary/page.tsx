import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Glossary - Shelf",
    description: "Asset management terms explained.",
};

export default function GlossaryIndexPage() {
    const terms = getAllContent("glossary");

    return (
        <Container className="py-20">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    Glossary
                </h1>
                <p className="text-xl text-muted-foreground">
                    Common terms and definitions.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {terms.map((term) => (
                    <Link key={term.slug} href={`/glossary/${term.slug}`} className="group block h-full">
                        <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="group-hover:text-primary transition-colors">
                                    {term.frontmatter.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {term.frontmatter.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </Container>
    );
}
