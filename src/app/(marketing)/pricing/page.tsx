import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { PricingPageContent } from "@/components/pricing/pricing-page-content";

// A server component on purpose. PagefindWrapper's keyword block is removed from
// the built HTML after indexing (scripts/strip-pagefind-keywords.mjs), and that
// only works when the block is rendered on the server. Rendered from client
// code, hydration would put it back. The interactive UI is PricingPageContent.
export default function PricingPage() {
    return (
        <PagefindWrapper type="Page" title="Pricing - Simple, transparent pricing" keywords="pricing plans price cost pricing page">
            <PricingPageContent />
        </PagefindWrapper>
    );
}
