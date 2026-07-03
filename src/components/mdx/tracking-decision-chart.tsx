import { ImageZoom } from "@/components/ui/image-zoom";

/**
 * The static "How should you track it in Shelf?" decision flowchart.
 * The SVG is designed for light backgrounds and needs ~900px to stay
 * legible, so it renders on a forced-white card and only from md up;
 * on phones the interactive quiz and the text version carry the flow.
 */
export function TrackingDecisionChart() {
    return (
        <div className="not-prose my-8">
            <div className="hidden md:block">
                <ImageZoom
                    src="/images/knowledge-base/tracking-method-decision-chart.svg"
                    alt="Decision flowchart with four questions that lead to one of three tracking methods in Shelf: individual assets for unique items, Asset Models for fleets of identical units tracked individually, or Quantity tracking for interchangeable stock counted as one record."
                    className="rounded-xl border border-border/50 bg-white p-4 shadow-sm w-full"
                />
            </div>
            <p className="md:hidden text-sm text-muted-foreground rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
                The full flowchart is best viewed on a larger screen. On a phone, use the
                interactive helper above or the text version below: same questions, same answers.
            </p>
        </div>
    );
}
