# Research inputs — State of Equipment Management 2026

This directory holds the **non-telemetry research inputs** for the 2026 report:

- **`survey-design.md`** — the 5-question admin survey that produces the "why" data. Telemetry tells what happened; the survey tells the operational consequence. Without this, the report is Shelf's product analytics. With it, it's a real *State of* industry report.

- **`external-benchmarks.md`** — candidate third-party industry benchmarks to cite for comparison. Marketing vets one before publication. The presence of even a single external benchmark moves the report from "hermetic vendor research" to "comparison against the field" and earns the citation in articles that summarise the category.

## Why these matter

The Musk-style editorial review of the v1 scaffold landed two specific findings:

1. **Telemetry alone produces a Shelf product report.** It tells you what Shelf's customers do. It does not tell you what the industry experiences. Pairing telemetry with a 200-admin survey produces the "why" — operational impact, hours lost, painful workflows, the open-ended themes — that journalists actually quote.

2. **A hermetic report is harder to cite.** Wikipedia editors and trade-press journalists are far more likely to cite a report that compares its findings to an external source. "Shelf workspaces' ghost-asset rate of X% is below/above the industry baseline of Y% reported by Z" earns citation in the Wikipedia article on equipment management more easily than "Shelf workspaces have a ghost-asset rate of X%" alone.

These aren't nice-to-haves. They're what separates a v1 industry report from a marketing piece.

## Who owns each

- **Survey:** marketing executes (Typeform / Sprig / built-in form), data team imports responses, editorial reads open-ended answers.
- **External benchmark:** marketing researches and vets candidates from the list in `external-benchmarks.md`, founder makes the final pick, editorial integrates into the MDX.

## Timeline

Both need to be done **before the publication date** — not after. Recommended sequence:

- **T − 6 weeks:** survey design finalized, distribution list assembled.
- **T − 5 weeks:** survey sent. 2-week response window.
- **T − 4 weeks:** external benchmark research begins in parallel.
- **T − 3 weeks:** survey closes. Data team imports.
- **T − 2 weeks:** benchmark selected and vetted. Founder signs off.
- **T − 1 week:** survey results + benchmark integrated into MDX. Final editorial pass.
- **T:** publication.
