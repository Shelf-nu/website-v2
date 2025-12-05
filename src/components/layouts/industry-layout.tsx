import { Frontmatter } from "@/lib/content/schema";
import { PageHeader } from "./shared/page-header";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function IndustryLayout({ frontmatter, children }: LayoutProps) {
    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <PageHeader
                    title={frontmatter.title}
                    description={frontmatter.description}
                    heroTagline={frontmatter.industry ? `${frontmatter.industry} Solutions` : undefined}
                />

                <main className="flex-1">
                    <Container className="py-16">
                        <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                            {children}
                        </div>
                    </Container>
                </main>

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
