import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Case Studies - Shelf",
    description: "See how leading teams use Shelf.",
};

export default function CaseStudiesIndexPage() {
    const caseStudies = getAllContent("case-studies");

    return (
        <Container className="py-20">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    Case Studies
                </h1>
                <p className="text-xl text-muted-foreground">
                    See how leading teams use Shelf.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {caseStudies.map((study) => (
                    <Link
                        key={study.slug}
                        href={`/case-studies/${study.slug}`}
                        className="group relative flex flex-col rounded-2xl border bg-background p-8 hover:bg-muted/50 transition-colors"
                    >
                        <h3 className="text-lg font-semibold leading-6 text-foreground group-hover:text-primary">
                            {study.frontmatter.title}
                        </h3>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                            {study.frontmatter.summary}
                        </p>
                    </Link>
                ))}
            </div>
        </Container>
    );
}
