import { Frontmatter } from "@/lib/content/schema";
import { PageHeader } from "./shared/page-header";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function CaseStudyLayout({ frontmatter, children }: LayoutProps) {
    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <PageHeader
                    title={frontmatter.title}
                    description={frontmatter.description}
                    heroTagline={frontmatter.organization ? `Case Study: ${frontmatter.organization}` : "Case Study"}
                />

                <main className="flex-1">
                    <Container className="py-16">
                        <div className="grid gap-10 md:grid-cols-[1fr_300px]">
                            <div className="prose prose-lg dark:prose-invert">
                                {children}
                            </div>
                            <aside className="space-y-6">
                                {frontmatter.quotes && frontmatter.quotes.length > 0 && (
                                    <div className="bg-muted p-6 rounded-lg italic">
                                        "{typeof frontmatter.quotes[0] === 'string' ? frontmatter.quotes[0] : frontmatter.quotes[0].quote}"
                                        {typeof frontmatter.quotes[0] !== 'string' && frontmatter.quotes[0].author && (
                                            <div className="mt-4 text-sm font-semibold not-italic">
                                                — {frontmatter.quotes[0].author}
                                                {frontmatter.quotes[0].role && `, ${frontmatter.quotes[0].role}`}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {frontmatter.results && (
                                    <div className="border p-6 rounded-lg">
                                        <h3 className="font-bold mb-4">Key Results</h3>
                                        <ul className="list-disc pl-4 space-y-2">
                                            {frontmatter.results.map((res, i) => (
                                                <li key={i}>{res}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </aside>
                        </div>
                    </Container>
                </main>

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
