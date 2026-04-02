# Content Improvement Plan — April 2026

## Context

- Google March 2026 **core update** (Mar 27) and **spam update** (Mar 24) are still settling
- Our approach: earn positions through genuine quality, not volume or tricks
- Everything we ship should pass the test: "Would a school administrator bookmark this?"

## Guiding Principles

1. **Fix what exists before creating new things** — incomplete pages with missing CTAs and images are conversion leaks
2. **One deep piece beats five shallow ones** — depth signals expertise to both humans and search engines
3. **Every page needs a job** — if it doesn't serve a specific searcher with a specific intent, it shouldn't exist
4. **No content spam** — we don't publish thin pages to "cover keywords." We publish useful resources that happen to rank.
5. **Verify before we claim** — after the core + spam updates, Google is rewarding accuracy and punishing fluff more than ever

---

## Sprint: April 3-4, 2026

### Experiment 1: Fix Solutions Page Conversions

**Hypothesis:** 3 solutions pages without CTAs and 4 without images are losing conversions from visitors who arrived with buying intent.

**What to do:**
- [ ] Add CTAs to: Tool Tracking, Fixed Asset Tracking, Mobile Asset Auditing
- [ ] Add hero images to: Equipment Check-In, Mobile Asset Auditing, Fixed Asset Tracking, Home Inventory Management
- [ ] Add missing images to: Open Source Asset Management

**How to measure:** Track demo_form_submit and signup_click events from these pages in PostHog over the next 14 days. Compare to the 14-day baseline before changes.

**Risk level:** None. This is fixing broken things, not adding new content.

---

### Experiment 2: "Best Equipment Management Software for Schools" Comparison Page

**Hypothesis:** School administrators searching for "best equipment management software for schools" or "equipment checkout software for schools" currently land on Asset Panda's self-serving comparison page. A fair, honest comparison page from Shelf would capture this high-intent traffic.

**What to do:**
- [ ] Create a comparison page covering: Shelf, Cheqroom, Sortly, Snipe-IT, EZOfficeInventory, Asset Panda, Reftab
- [ ] For each tool: honest summary of strengths, weaknesses, pricing, and who it's best for
- [ ] Include a clear comparison table (features, pricing, open source, education-specific)
- [ ] Be genuinely fair — name things competitors do better than us where true
- [ ] Link to our education page and case studies as proof, not as sales pitches

**How to measure:** GSC impressions and clicks for "best equipment management software" cluster. Track position over 30 days.

**Risk level:** Low. Honest comparison content is rewarded by Google's helpful content system. Self-serving listicles where you rank yourself #1 on every axis are not. We'll be honest.

**Quality check:** Before publishing, ask: "Would a school administrator trust this comparison, or would they feel sold to?"

---

### Experiment 3: Apply Winning SEO Formula to Remaining Pages

**Hypothesis:** Our SEO experiments show that "Free" + "Open Source" + action verbs in titles/descriptions drive 40-180% CTR improvements. Several pages haven't been updated with this formula yet.

**What to do:**
- [ ] Audit all solutions and industry page titles/descriptions
- [ ] Identify pages not yet using the winning formula
- [ ] Update titles/descriptions following the pattern proven in exp-002, exp-003, exp-004
- [ ] Log each change as a new SEO experiment in data/seo-experiments.json with baseline metrics

**How to measure:** GSC CTR and position changes per page, evaluated after 14-day window.

**Risk level:** Low. We're applying a tested pattern, not guessing. And we log everything so we can revert if something underperforms.

---

### Experiment 4: Granular Use Case Pages (2-3 pages)

**Hypothesis:** Long-tail searches like "student equipment checkout system" or "loaner laptop tracking system" have lower competition and higher intent than broad terms. Dedicated use case pages can capture this traffic.

**What to do:**
- [ ] Create 2-3 focused use case pages (500-800 words each):
  - "Student Equipment Checkout System" — targets schools, describes the workflow, links to education content
  - "Loaner Laptop Tracking" — targets IT departments and schools with 1:1 programs
  - (Optional) "Construction Tool Checkout" — targets field operations
- [ ] Each page: specific pain point, how Shelf solves it, one case study reference, CTA
- [ ] Internal links to/from relevant solutions pages and blog posts

**How to measure:** GSC impressions for the target long-tail queries within 30 days.

**Risk level:** Low, IF each page is genuinely useful and not just a keyword wrapper. The test: could someone land on this page and learn something even if they never sign up?

---

## Parked (Good Ideas, Not This Sprint)

These are validated ideas we'll return to after the April 3-4 sprint:

- **Printable PDF versions** of funding guide and equipment list
- **Equipment inventory template** (Google Sheets) as a free tool
- **"Shelf vs Cheqroom for Education"** deep-dive comparison
- **Nonprofit industry page** (have blog content, no dedicated page)
- **Construction industry page** (have CES case study, weak page)
- **More named case studies** (University of Missouri, Maynard HS)
- **Industries discoverability** on the website (navigation/UX improvement)

---

## What We Will NOT Do

- **Publish thin pages** just to cover keywords — if we can't make it useful, we don't publish it
- **Gate content** behind forms — everything stays open
- **Publish at volume** to try to outpace Sortly's 300+ posts — we win with depth, not quantity
- **Make dishonest comparisons** — if a competitor is better at something, we say so
- **Rush content** during a Google core update settling period — quality over speed

---

## Tracking

Each experiment gets logged in `data/seo-experiments.json` with:
- Baseline GSC metrics (captured before deployment)
- Deployment date
- 14-day evaluation window
- Results and learnings

We only declare winners with data. We revert losers without ego.
