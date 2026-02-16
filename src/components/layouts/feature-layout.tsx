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

export function FeatureLayout({ frontmatter, children }: LayoutProps) {
    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <HeroWithSocialProof
                    title={frontmatter.title}
                    description={frontmatter.description}
                    tagline="Feature"
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
