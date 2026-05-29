# Survey design — State of Equipment Management 2026

**Goal:** pair telemetry (what happened) with a workspace-admin survey (what it costs operationally). The survey provides the "why" data and the staff-time cost figure that pairs with the dollar headline.

**Target sample:** n = 200 complete responses. Workspace admins on the Team or Enterprise tier who have been active in the previous 30 days.

**Tool:** Typeform or Sprig recommended. If Shelf already has an in-app feedback system, that works too — the cost is the same.

**Distribution channels:**
- Email to admins of eligible workspaces.
- In-app banner shown to admins on next login (skip-friendly).
- 2-week response window. Reminder email at day 7.
- No incentive offered — keeps the sample honest and avoids "survey grinder" responses.

**Anonymization:** Survey responses are stored separately from telemetry. Aggregate before reporting. Quotes from open-ended questions only published with explicit permission.

---

## The 5 questions

### Q1. Operational time cost (the headline survey stat)

> **In an average month, how many hours does your team lose dealing with missing or misplaced equipment?**
>
> Choose one:
> - 0 hours
> - 1–5 hours
> - 6–10 hours
> - 11–20 hours
> - 21+ hours

**Why this question:** produces the headline survey stat (median hours lost per month). Multiplied by a fully-loaded labour cost, it generates the dollar-equivalent of the staff-time tax. Pairs naturally with the ghost-asset dollar headline.

**Where it lands in the report:** the "operational tax" section.

---

### Q2. Worst-case dollar value (qualitative dollar anchor)

> **Think of the last equipment item your organization lost (couldn't find when you needed it). What was its approximate replacement value?**
>
> Choose one:
> - Less than $100
> - $100–$500
> - $500–$2,000
> - $2,000–$10,000
> - More than $10,000
> - We haven't lost anything in the past year

**Why this question:** anchors the ghost-asset dollar story to a single human-scale incident. Telemetry says "the median workspace has $X of ghost assets"; this answers "and the typical lost item is worth $Y."

**Where it lands in the report:** sidebar callout in the ghost-asset finding section.

---

### Q3. The most painful part (open-ended; the goldmine)

> **In one sentence, what is the most painful part of how your organization manages equipment today?**
>
> Open text field.

**Why this question:** the recurring themes from this open-ended become the most-quotable phrasings in the report. Past industry surveys have shown that open-ended responses cluster into 3–5 recurring themes — those clusters get summarized in the report.

**Where it lands in the report:** the "operational tax" section, paragraph paraphrasing the top recurring theme.

---

### Q4. Audit cadence (validates the telemetry finding)

> **How often does your organization run physical audits or inventory checks?**
>
> Choose one:
> - Quarterly or more often
> - Annually
> - Less than annually
> - Never

**Why this question:** validates (or surprises) the telemetry finding on audit cadence. If telemetry says "only X% of workspaces ran an audit" and the survey says "Y% of admins claim to audit at least annually", the delta is informative on its own.

**Where it lands in the report:** the "most teams don't audit" section, comparing telemetry to admin-reported cadence.

---

### Q5. The single change (forward-looking)

> **If you could change one thing about how your organization tracks equipment, what would it be?**
>
> Open text field.

**Why this question:** complements Q3 by surfacing aspirations (vs pain). Useful both for the report ("what teams want") and for Shelf's own product roadmap. Treat the responses as a parallel asset for the product team — they outlive the report.

**Where it lands in the report:** the "limitations and what's next" section, optional inclusion as a future-pointing closer.

---

## Demographics (auto-captured, not asked)

Do NOT ask demographic questions. Instead, capture from the workspace metadata at submission time:

- Industry / primary use case (from `UserBusinessIntel.primaryUseCase` on the admin's user record).
- Workspace asset count tier (small / medium / large — banded, never exact).
- Subscription tier (Team / Enterprise).
- Workspace age (years since `Organization.createdAt`).

These let the data team cut the open-ended themes by segment without burdening the respondent.

---

## Implementation checklist

- [ ] Choose tool (Typeform $50/mo, Sprig free tier, or in-app form).
- [ ] Build the 5-question form. Single page. Mobile-friendly.
- [ ] Set up demographic capture from workspace metadata at submit time.
- [ ] Identify the eligible-admin email list (Team / Enterprise tier, active in last 30 days, primary admin role).
- [ ] Draft the email subject line and body. Founder signature works better than "marketing@shelf.nu".
- [ ] Set the in-app banner trigger.
- [ ] Send. Wait 7 days. Send the reminder.
- [ ] Close at 14 days.
- [ ] Export to CSV. Aggregate. Run themes analysis on Q3 and Q5 (LLM-summarization is fine for first pass; human verification for what makes it into the report).
- [ ] Publish the questionnaire as a PDF alongside the report so journalists and Wikipedia editors can verify the wording.

## Cost

- **Tool:** $0–$50/month.
- **Marketing time:** ~8 hours over the 2-week window (setup, sends, reminders, theme analysis).
- **Editorial time:** ~3 hours to integrate themes into the report MDX.

## What good looks like

- 200+ complete responses.
- Open-ended responses cluster into 3–5 themes.
- Median Q1 answer is in the "6–10 hours" bucket or higher (anything less is hard to make a story from).
- Q4 admin-reported audit cadence is meaningfully higher than the telemetry-observed rate (the delta is a story).
