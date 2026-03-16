import { Frontmatter } from "@/lib/content/schema";
import { PageHeader } from "./shared/page-header";
import { RelatedContent } from "./shared/related-content";

import { Container } from "@/components/ui/container";
import { CTA } from "@/components/sections/cta";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function ConceptLayout({ frontmatter, children }: LayoutProps) {
    return (
        <>
            <div className="flex min-h-screen flex-col">
                <PageHeader
                    title={frontmatter.title}
                    description={frontmatter.description}
                    heroTagline="Concept"
                />

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
