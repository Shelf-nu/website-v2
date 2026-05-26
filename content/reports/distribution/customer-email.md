# Customer email — State of Equipment Management 2026 launch

**DRAFT** — v1 scaffold. Send to existing Shelf customers on launch day.

---

**Subject line options** (pick one):

- The State of Equipment Management 2026 — our report, built from your data
- We turned a year of telemetry into a report. Free PDF inside.
- {{TODO: ds_ghost_asset_rate}}% of tracked assets are ghosts. Here's the data.
- A report on how teams actually track equipment, drawn from yours.

**Preview text:**

The first industry report drawn from anonymized Shelf telemetry. Five findings, full methodology, CC BY 4.0.

---

Hey {{first_name}},

Quick note from the Shelf team.

We just published *The State of Equipment Management 2026* — the first industry report drawn from anonymized telemetry across the Shelf platform. Your workspace, along with thousands of others, is part of the dataset behind it.

The report quantifies things nobody else can. The median workspace tracks **{{TODO: median_assets_per_workspace}} assets** but only **{{TODO: pct_assets_with_active_custody}}%** have an active custodian. Booking conflict-prevention catches **{{TODO: pct_bookings_with_conflict_averted}}%** of attempted overlaps. Ghost assets — items missing across consecutive audits with no scan in between — are an estimated **{{TODO: ds_ghost_asset_rate}}%** of the median inventory.

It's free, under CC BY 4.0. Read it, share it, cite it, remix it:

[→ Read the State of Equipment Management 2026](https://www.shelf.nu/reports/state-of-equipment-management-2026)

A few notes:

- **Your data is not in there individually.** Everything is aggregated across cohorts of 20+ workspaces. Customer names, workspace names, and asset details never appear.
- **We open-sourced the extraction.** The script that produced the aggregates is in the public Shelf repo. If you want to know exactly how a number was calculated, the code is there.
- **Tell us what you'd like to see next year.** If there's a cut you want investigated for 2027 — by team size, by region, by industry, by feature — reply to this email. We'll plan extraction queries against requests.

Thank you for being a Shelf customer. The report only exists because you and thousands of others run real operations on the platform.

— {{TODO: signature — Carlos personal signature is preferred for launch day}}

[Read the report](https://www.shelf.nu/reports/state-of-equipment-management-2026) · [Download the PDF](https://www.shelf.nu/reports/state-of-equipment-management-2026.pdf) · [Download the CSV](https://www.shelf.nu/reports/state-of-equipment-management-2026.csv)

P.S. — If you want to be quoted in next year's edition, reply and tell us your story. We do interviews on a rolling basis.

---

**Segmentation notes for the email send:**

- **Send to:** All active Team-tier workspace owners + admins. Suppress: Personal-tier accounts (the report excludes them from the dataset anyway), users who unsubscribed from marketing, anyone with a support ticket open in the last 7 days (avoid stepping on active conversations).
- **Personalization:** Use first name where available; fall back to "Hey there". Don't personalize anything beyond first name — specific stats per customer would defeat the anonymization promise.
- **Send time:** Tuesday 10am in the recipient's local timezone (use the workspace timezone field if available; fall back to ET).
- **From:** Carlos Virreira <carlos@shelf.nu>. Reply-to: same. Replies should route to the founder inbox — customer responses on report launches are gold.
- **Tracking:** Use the existing email-tracking setup. Add a `utm_source=customer-launch-email` to the report URL so downstream attribution is clean.
