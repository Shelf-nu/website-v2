import { SolutionLayout } from "./solution-layout";
import { IndustryLayout } from "./industry-layout";
import { AlternativeLayout } from "./alternative-layout";
import { GlossaryLayout } from "./glossary-layout";
import { UseCaseLayout } from "./use-case-layout";
import { CaseStudyLayout } from "./case-study-layout";
import { BlogLayout } from "./blog-layout";
import { ConceptLayout } from "./concept-layout";
import { FeatureLayout } from "./feature-layout";
import { KnowledgeBaseLayout } from "./knowledge-base-layout";
import { UpdateLayout } from "./update-layout";

// Fallback layout (simple container)
import { Container } from "@/components/ui/container";
import { Frontmatter } from "@/lib/content/schema";

function DefaultLayout({ children }: { frontmatter: Frontmatter, children: React.ReactNode }) {
    return <Container className="py-20">{children}</Container>;
}

export function resolveLayout(layout: string) {
    switch (layout) {
        case "solution": return SolutionLayout;
        case "industry": return IndustryLayout;
        case "alternative": return AlternativeLayout;
        case "glossary": return GlossaryLayout;
        case "use-case": return UseCaseLayout;
        case "case-study": return CaseStudyLayout;
        case "blog": return BlogLayout;
        case "concept": return ConceptLayout;
        case "feature": return FeatureLayout;
        case "knowledge-base": return KnowledgeBaseLayout;
        case "update": return UpdateLayout;
        default: return DefaultLayout;
    }
}
