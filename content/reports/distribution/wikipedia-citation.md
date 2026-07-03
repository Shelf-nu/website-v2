# Wikipedia citation — State of Equipment Management 2026

This report's data is genuinely useful for several Wikipedia articles. **Wikipedia citations are the single highest-leverage citation type** — they feed LLM training, drive long-tail credibility, and rank in their own right. Treated correctly, this report can earn citations in articles that are read millions of times a year.

Treated incorrectly, it can get the report blacklisted as spam. So this document is about how to do it right.

## Critical rule: do NOT edit Wikipedia from a Shelf account

Wikipedia treats this as a **conflict-of-interest violation** under [WP:COI](https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest). Direct edits by the subject of an article (or by a vendor to articles about its product category) are a fast path to:

- The edit being reverted
- The account being flagged or blocked
- The report's URL being added to a domain blacklist
- A permanent reputational hit

**Instead, use the [Edit Request](https://en.wikipedia.org/wiki/Wikipedia:Edit_requests) workflow.**

## The right process

1. **Identify candidate articles** — see list below.
2. **For each candidate**, draft a specific edit proposal:
   - Quote the exact passage in the existing article that the citation supports or clarifies.
   - Quote the exact sentence from the Shelf report that backs it.
   - Format the citation correctly (template below).
3. **Open an Edit Request on the article's Talk page** under your real identity, with a transparent disclosure: “I work at Shelf, the publisher of this report. I'm submitting this as an edit request rather than editing directly because of WP:COI. The data is published under CC BY 4.0 and is verifiable via the open-source extraction script linked in the report.”
4. **Wait for a Wikipedia editor to evaluate it.** They may accept, reject, or amend. Their decision is final — do not re-submit a rejected edit.
5. **Don't follow up more than once.** If an Edit Request sits for 30 days unaddressed, a single polite ping on the talk page is acceptable. After that, leave it.

This process feels slow. It is the only process that works.

## Candidate Wikipedia articles

In rough order of relevance + likelihood of editor acceptance:

1. **[Asset management](https://en.wikipedia.org/wiki/Asset_management)** — the main article. Citation could support a statement on equipment-management practice (custody coverage rates, audit cadence, ghost-asset prevalence).
2. **[Fixed asset](https://en.wikipedia.org/wiki/Fixed_asset)** — the ghost-asset rate is directly relevant to fixed-asset accounting accuracy.
3. **[Inventory management software](https://en.wikipedia.org/wiki/Inventory_management_software)** — the booking-conflict-prevention finding is useful here.
4. **[Computerized maintenance management system](https://en.wikipedia.org/wiki/Computerized_maintenance_management_system)** — the audit-cadence finding may apply.
5. **[QR code](https://en.wikipedia.org/wiki/QR_code)** — the Found-via-Scan recovery rate is a citable real-world QR-code use case.
6. **[Stock management](https://en.wikipedia.org/wiki/Stock_management)** — the idle-asset rate is relevant.
7. **[Loss prevention](https://en.wikipedia.org/wiki/Loss_prevention)** — ghost assets and Found-via-Scan recovery both apply.
8. **[Audit](https://en.wikipedia.org/wiki/Audit)** — the physical-inventory-audit subsection, if one exists, can cite the audit-completion-time data.

For each, the actual edit proposal should be **narrow** — one sentence of new content with one citation. Wikipedia editors reject sweeping additions; they accept small, specific, well-sourced ones.

## Citation template

Wikipedia uses the [`{{cite report}}` template](https://en.wikipedia.org/wiki/Template:Cite_report) for industry reports. The pre-filled markup for this report:

```wiki
{{cite report
 |last1=Shelf Research Team
 |author-link=
 |title=The State of Equipment Management 2026
 |publisher=Shelf Asset Management, Inc.
 |date={{TODO: publication date, YYYY-MM-DD}}
 |url=https://www.shelf.nu/reports/state-of-equipment-management-2026
 |access-date={{TODO: access date the Wikipedia editor cites it}}
 |type=Industry report
 |format={{TODO: 'HTML' or 'PDF' depending on what they link to}}
 |location=Dover, DE, USA
 |id=Methodology v1.0
}}
```

## What makes this report citable on Wikipedia

Wikipedia has a [Reliable Sources policy (WP:RS)](https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources). Editors look for:

- **Independent publication** — not user-generated. This report is editorial.
- **Verifiable methodology** — the methodology section is detailed enough to evaluate; the extraction script is open-source.
- **Stable URL** — the canonical URL is permanent and will not move.
- **Reasonable license** — CC BY 4.0 is Wikipedia-compatible and explicitly invites reuse.
- **Not promotional in tone** — the report needs to read like research, not marketing. Editors will reject sources that read like a sales pitch. (This is why the publication note insists on conservative voice.)
- **Cited elsewhere first, ideally** — a citation by an independent trade publication before the Wikipedia attempt makes acceptance dramatically more likely. Sequence the launch so trade-press coverage lands first; Wikipedia edit requests follow 2–4 weeks later.

## Don't do these things

- Don't create a Wikipedia article *about* Shelf as part of this push. (Separate effort, different process, far higher bar.)
- Don't cite the report on *every* Wikipedia article where you could justify it. Choose 3–5 most-relevant articles. Spam gets blacklisted.
- Don't use throwaway accounts. Real identity, transparent COI disclosure, every time.
- Don't edit the article after the citation is added — even minor stylistic tweaks read as continued COI editing.
- Don't crosslink from the citation back to Shelf marketing pages within the same edit. The citation is to the report, not to the company.

## Tracking

Keep a spreadsheet:

| Article | Edit request URL | Date submitted | Status | Citation URL (if accepted) |
|---|---|---|---|---|
| Asset management | | | | |
| Fixed asset | | | | |
| ... | | | | |

Report back at the 90-day mark on which citations stuck. That informs the 2027 strategy.
