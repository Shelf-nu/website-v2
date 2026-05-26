# Press release — State of Equipment Management 2026

**DRAFT** — v1.1 (pivoted to ghost-assets-in-dollars headline per editorial). Replace every `{{TODO}}` with a real number from the extracted aggregates before sending.

---

**FOR IMMEDIATE RELEASE** — OR — **EMBARGOED UNTIL [DATE], [TIME] [TIMEZONE]**

---

## New Shelf industry report finds the median organization has {{TODO: $X,XXX}} of equipment on the books but missing from audits

### "Ghost assets" — items recorded in inventory but absent across consecutive physical audits — distort budgets, depreciation, and insurance valuations across thousands of organizations, according to inaugural industry research drawn from anonymized telemetry and a survey of 200 workspace administrators.

**[CITY, COUNTRY] — [DATE]** — Shelf Asset Management, Inc., maker of the open-source asset tracking platform [shelf.nu](https://www.shelf.nu), today published the inaugural edition of *The State of Equipment Management 2026*, the first industry report drawn from anonymized telemetry across thousands of teams managing physical equipment, paired with a survey of workspace administrators on operational impact.

The headline finding: **for the median organization tracked, approximately {{TODO: $X,XXX}} of physical equipment exists only on paper** — items recorded in inventory but missing from two consecutive physical audits with no scan activity to explain where they went. The report names this category "ghost assets" and is the first to quantify it from telemetry rather than vendor survey data.

Ghost assets distort everything they touch: organizational budgets overstate fleet size, depreciation schedules carry phantom expense, insurance valuations misprice coverage, and headcount-per-device ratios suggest equipment exists that doesn't. Across the Shelf platform, ghost assets are approximately **{{TODO: ds_ghost_asset_rate}}%** of audited inventory.

Other findings:

- **The accountability gap.** Only **{{TODO: pct_assets_with_active_custody}}%** of tracked assets have an active custodian assigned at any moment. The custody gap is the operational cause of most ghost assets.
- **Most teams don't audit.** Only **{{TODO: au_pct_workspaces_running_audits}}%** of workspaces with the Audits add-on enabled ran at least one audit in the year. Ghost assets are invisible without audits, and most organizations are operating with no measurement at all.
- **Idle equipment is a parallel cost.** The median workspace also has **{{TODO: $X,XXX}}** of equipment idle (no activity in 90 days). Combined with ghost assets, the average organization carries significant unmeasured equipment overhead.
- **The operational tax.** In a survey of {{TODO: surveyResponses}} workspace administrators, the median answer to *"how many hours per month does your team lose dealing with missing equipment?"* was **{{TODO: survey_hours_lost_per_month_median}} hours per month** — the staff-time cost that pairs with the dollar cost.
- **The recovery story.** Across the platform, **{{TODO: $X,XXX,XXX}}** of equipment was recovered through Shelf's public Found-via-Scan flow, in which anyone (even without a Shelf account) can scan a QR label on a found item and notify the owner.

“{{TODO: founder quote — 1–2 sentences. Aim for the most-quotable line built around the dollar figure. Example: 'For the median organization, a single audit reveals roughly {{TODO: $X,XXX}} of equipment that exists only on paper. Nobody has been measuring this. Now we are.'}}” said **Carlos Virreira**, founder and CEO of Shelf.

The full report, including detailed methodology, three customer case studies with permission-confirmed attribution, an independent industry benchmark comparison, and the underlying aggregated dataset as CSV, is available free at [shelf.nu/reports/state-of-equipment-management-2026](https://www.shelf.nu/reports/state-of-equipment-management-2026).

The report is published under a **Creative Commons Attribution 4.0 International (CC BY 4.0) license** — reuse, remix, and republish with attribution. The extraction script that produced the telemetry aggregates is published in the open at [github.com/Shelf-nu/shelf.nu](https://github.com/Shelf-nu/shelf.nu), allowing researchers to audit the methodology directly. The 200-admin survey questionnaire is published as a separate PDF.

### About the methodology

The report draws from anonymized telemetry from approximately **{{TODO: workspaces}}** Shelf workspaces representing approximately **{{TODO: assets}}** tracked assets across **{{TODO: countries}}** countries, observed over the 12 months ending April 30, 2026. All aggregates require cohorts of at least 20 workspaces; cohorts below that threshold are not reported. Personal workspaces, disabled workspaces, and workspaces below a 10-asset minimum are excluded. Customer-identifying data is never reported. Numerical aggregates are rounded to one significant figure. Ghost-asset dollar values are computed from the workspace-entered `Asset.valuation` field and represent conservative lower bounds, since not all tracked assets carry a valuation.

The accompanying survey was distributed to administrators of eligible workspaces during {{TODO: month}} 2026, yielding {{TODO: surveyResponses}} complete responses. The questionnaire is published alongside the report.

### About Shelf

Shelf is an open-source asset management platform used by thousands of teams to track physical equipment with QR-based workflows, conflict-free bookings, and audit-ready reporting. Founded in 2022 and based in Delaware, USA, Shelf serves customers in education, IT, media production, construction, and field operations across more than 50 countries. The platform is free for individuals and offered as a managed cloud service for teams, with the full source code available under AGPL license for self-hosting. Shelf Companion for iPhone is also available free on the Apple App Store.

### Press contact

- **Carlos Virreira**, Founder & CEO
- carlos@shelf.nu
- [shelf.nu/contact](https://www.shelf.nu/contact)

### Resources

- Read the full report: [shelf.nu/reports/state-of-equipment-management-2026](https://www.shelf.nu/reports/state-of-equipment-management-2026)
- Download the PDF: [shelf.nu/reports/state-of-equipment-management-2026.pdf](https://www.shelf.nu/reports/state-of-equipment-management-2026.pdf)
- Download the underlying aggregates (CSV): [shelf.nu/reports/state-of-equipment-management-2026.csv](https://www.shelf.nu/reports/state-of-equipment-management-2026.csv)
- Download the survey questionnaire: [shelf.nu/reports/state-of-equipment-management-2026-survey-questions.pdf](https://www.shelf.nu/reports/state-of-equipment-management-2026-survey-questions.pdf)
- Methodology + open-source extraction code: [github.com/Shelf-nu/shelf.nu](https://github.com/Shelf-nu/shelf.nu)
- Press kit: [shelf.nu/brand-assets](https://www.shelf.nu/brand-assets)

###
