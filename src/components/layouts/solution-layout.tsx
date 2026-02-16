import { Frontmatter } from "@/lib/content/schema";
import { HeroWithSocialProof } from "./shared/hero-with-social-proof";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import { CTA } from "@/components/sections/cta";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function SolutionLayout({ frontmatter, children }: LayoutProps) {
    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <HeroWithSocialProof
                    title={frontmatter.title}
                    description={frontmatter.description}
                    tagline={frontmatter.heroTagline || "Solution"}
                />

                {frontmatter.problemStatements && (
                    <section className="bg-muted py-16">
                        <Container>
                            <h2 className="text-2xl font-bold mb-6">The Challenge</h2>
                            <ul className="grid gap-4 md:grid-cols-2">
                                {frontmatter.problemStatements.map((prob, i) => (
                                    <li key={i} className="bg-background p-6 rounded-lg border">{prob}</li>
                                ))}
                            </ul>
                        </Container>
                    </section>
                )}

                <main className="flex-1">
                    <Container className="py-16">
                        <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                            {children}
                        </div>
                    </Container>
                </main>

                <CTA />

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
