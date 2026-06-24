# Distribution materials — State of Equipment Management 2026

This folder holds **draft** distribution materials for the 2026 report launch. None of these files render on the public site — they live in the repo so the marketing/founder team can edit them as documents, with version control, alongside the report itself.

## What's here

| File | Purpose | Status |
|---|---|---|
| `press-release.md` | Embargoed press release. The "official" announcement. | v1 draft |
| `customer-email.md` | Email to existing Shelf customers on launch day. | v1 draft |
| `press-pitch.md` | Pitch email template for individual journalists / publications. | v1 draft |
| `share-copy.md` | Social copy — LinkedIn, X, Threads, in multiple lengths. | v1 draft |
| `wikipedia-citation.md` | Citation template + list of Wikipedia articles the report could support. | v1 draft |

## Launch sequence (proposed)

1. **T−2 weeks** — send `press-pitch.md` (customized per journalist) to 5–10 trade pubs with embargo date. Include the PDF as attachment.
2. **T−1 week** — finalize all `{{TODO}}` placeholders in the report MDX. Get a final read on the press release.
3. **T−1 day** — upload the PDF and CSV to `public/reports/`. Flip the report's `noindex` flag to `false` in the MDX frontmatter. Verify Google Rich Results Test passes for Report + Dataset schemas.
4. **T+0 (launch day)** —
   - Press release goes live (issue via wire service if budget allows, otherwise direct outreach + publish on Shelf blog).
   - Customer email sends.
   - LinkedIn / X posts go up (Carlos personal first, then company page).
   - Embargo lifts on press pieces.
5. **T+1 week** — follow up with journalists who haven't covered yet. Post a "top 5 findings" recap on LinkedIn for second-wave reach.
6. **T+2 weeks** — begin Wikipedia work: identify the 3–5 most-relevant Wikipedia articles where the report could be a citation, draft contributions (do NOT edit Wikipedia directly from a Shelf account — conflict of interest. See `wikipedia-citation.md` for the process).

## Rules

1. **No invented quotes.** Every customer quote in any of these materials needs explicit permission from the named customer before publication. The report MDX uses `{{TODO: outreach}}` markers — same rule applies here.
2. **No invented statistics.** If a number in any of these materials is also in the report, it MUST match the published number exactly. The numbers in the press release should be copy-pasted from the report, not paraphrased.
3. **No date commitments we can't keep.** "Coming soon", "in the coming weeks", "shortly" — fine. "By June 30" — only if you mean it.
4. **License everywhere.** CC BY 4.0. Mention it. It is the reason Wikipedia will allow the citation.
5. **Do not push to social before the press embargo lifts.** Standard professional courtesy and the only way you get covered next time.

## Who edits what

- **Carlos / founder** — own the press release headline + lead, customer email subject + opening line, LinkedIn launch post personal voice.
- **Marketing** — own the press pitch template, share copy variations, distribution sequence.
- **Data team** — own the methodology paragraph and any specific stat that appears in distribution copy.
- **Editorial / writer** — final pass on all five files for voice consistency with the report itself.
