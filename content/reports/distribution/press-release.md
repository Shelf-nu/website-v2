# Press release — State of Equipment Management 2026

**DRAFT** — v1.2 (pivoted to idle-assets-in-dollars headline; ghost-asset stats demoted to audit-subset section). Replace every `{{TODO}}` with a real number from the extracted aggregates before sending.

---

**FOR IMMEDIATE RELEASE** — OR — **EMBARGOED UNTIL [DATE], [TIME] [TIMEZONE]**

---

## New Shelf industry report finds {{TODO: $X,XXX}} of equipment sits unused for 90+ days at a time in the median organization

### "Idle assets" — equipment recorded in inventory but with no recent activity — represent dead capital that distorts budgets, depreciation, and insurance valuations. The inaugural Shelf industry report quantifies the gap from anonymized telemetry across thousands of workspaces, paired with a survey of 200 administrators.

**[CITY, COUNTRY] — [DATE]** — Shelf Asset Management, Inc., maker of the open-source asset tracking platform [shelf.nu](https://www.shelf.nu), today published the inaugural edition of *The State of Equipment Management 2026*, the first industry report drawn from anonymized telemetry across thousands of teams managing physical equipment, paired with a survey of workspace administrators on operational impact.

The headline finding: **for the median organization tracked, approximately {{TODO: $X,XXX}} of physical equipment sits unused for 90 days or more at a stretch** — items recorded in inventory but with no scan activity, no custody change, no booking, and no location update during that window. Across the Shelf platform, **{{TODO: ds_idle_asset_rate}}%** of tracked assets met this definition.

Idle equipment is dead capital. It still appears in fleet counts, still depreciates, still incurs insurance premium — without being used. The report quantifies the gap for the first time from telemetry rather than from vendor-survey data.

Other findings:

- **The accountability gap.** Only **{{TODO: pct_assets_with_active_custody}}%** of tracked assets have an active custodian assigned at any moment. The custody gap is the operational surface where most loss and underutilization originates.
- **Late returns cascade.** Among workspaces that used the bookings feature, **{{TODO: bk_pct_returned_late}}%** of reservations ended after their scheduled return time. Late returns block the next user, force last-minute substitutions, and are the operational tax that pairs with the dollar cost of idle equipment.
- **The recovery story.** Across the platform, **{{TODO: $X,XXX,XXX}}** of equipment was recovered through Shelf's public Found-via-Scan flow — anyone, including someone without a Shelf account, scanned a QR label on a found item and notified the owner.
- **The operational tax.** In a survey of {{TODO: surveyResponses}} workspace administrators, the median answer to *"how many hours per month does your team lose dealing with missing equipment?"* was **{{TODO: survey_hours_lost_per_month_median}} hours per month** — the staff-time cost that pairs with the dollar cost of dead capital.
- **The audit-enabled subset.** For the smaller cohort of workspaces that ran at least one completed audit during the window, **{{TODO: au_pct_audited_assets_missing}}%** of expected assets came up Missing on first scan, and **{{TODO: ds_ghost_asset_rate}}%** met the report's "ghost asset" definition — missing across consecutive audits with no scan activity in between. This subset is presented with explicit qualification rather than as a platform-wide median, since audits is a paid add-on with bounded adoption.

“{{TODO: founder quote built around the dollar idle headline. Example: 'For the median organization, $X,XXX of equipment sits unused for 90 days or more at a stretch. That's dead capital that distorts every downstream financial decision. Nobody has been measuring this from telemetry. Now we are.'}}” said **Carlos Virreira**, founder and CEO of Shelf.

The full report — including detailed methodology, three customer case studies with permission-confirmed attribution, an independent industry benchmark comparison, and the underlying aggregated dataset as CSV — is available free at [shelf.nu/reports/state-of-equipment-management-2026](https://www.shelf.nu/reports/state-of-equipment-management-2026).

The report is published under a **Creative Commons Attribution 4.0 International (CC BY 4.0) license** — reuse, remix, and republish with attribution. The extraction script that produced the telemetry aggregates is published in the open at [github.com/Shelf-nu/shelf.nu](https://github.com/Shelf-nu/shelf.nu), allowing researchers to audit the methodology directly. The 200-admin survey questionnaire is published as a separate PDF.

### About the methodology

The report draws from anonymized telemetry from approximately **{{TODO: workspaces}}** Shelf workspaces representing approximately **{{TODO: assets}}** tracked assets across **{{TODO: countries}}** countries, observed over the 12 months ending April 30, 2026. All aggregates require cohorts of at least 20 workspaces; cohorts below that threshold are not reported. Personal workspaces, disabled workspaces, and workspaces below a 10-asset minimum are excluded. Customer-identifying data is never reported. Numerical aggregates are rounded to one significant figure. Dollar values are computed from the workspace-entered `Asset.valuation` field and represent conservative lower bounds, since not all tracked assets carry a valuation.

Feature-dependent stats (bookings, audits, Found-via-Scan recovery) are restricted to feature-enabled workspaces and published with explicit qualification rather than as platform-wide medians. The accompanying survey was distributed to administrators of eligible workspaces during {{TODO: month}} 2026, yielding {{TODO: surveyResponses}} complete responses.

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
