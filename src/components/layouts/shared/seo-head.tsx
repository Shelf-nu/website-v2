import { Frontmatter } from "@/lib/content/schema";

interface SeoHeadProps {
    frontmatter: Frontmatter;
}

export function SeoHead({ frontmatter }: SeoHeadProps) {
    return (
        <>
            <title>{frontmatter.seo.title}</title>
            <meta name="description" content={frontmatter.seo.description} />
            {frontmatter.seo.keywords && (
                <meta name="keywords" content={frontmatter.seo.keywords.join(", ")} />
            )}
            <link rel="canonical" href={frontmatter.canonicalUrl} />
            {frontmatter.seo.noindex && <meta name="robots" content="noindex" />}
            {frontmatter.schemaType && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: frontmatter.schemaType }}
                />
            )}
        </>
    );
}
