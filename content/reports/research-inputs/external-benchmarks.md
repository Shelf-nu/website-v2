# External benchmarks — candidate sources for the State of Equipment Management 2026

The report needs **one** vetted external benchmark to escape the trap of being a hermetic Shelf-only document. Marketing researches the candidates below, the founder picks the one that best supports the report's ghost-asset / accountability framing, editorial integrates a one-paragraph comparison callout.

**Why only one:** more than one starts to look like cherry-picking. One well-chosen external source signals rigour without diluting the report's own findings.

---

## Selection criteria

A good benchmark source is:

1. **Independent of Shelf.** No vendor research from competing asset-management platforms.
2. **Publicly accessible.** Behind-a-paywall sources reduce the report's verifiability and Wikipedia-citability.
3. **Methodologically transparent.** Avoid sources where you can't read the methodology section.
4. **Recent.** Within the last 3 years ideally. Older sources are still usable but should be cited with their publication year prominent.
5. **Quotable.** The number can be summarized in one sentence and compared cleanly to a Shelf number.
6. **Adjacent to ghost-assets or accountability.** Loss rate, shrinkage rate, depreciation accuracy, audit cadence, equipment search time — any of these support the report's core findings.

Reject:
- Marketing blog posts from competitors.
- Surveys conducted by AM vendors (conflict of interest equivalent to ours).
- Industry reports with no methodology section.
- Sources that have been retracted, superseded, or are dated > 5 years.

---

## Candidate sources to research

The data team / marketing should evaluate each of these, document findings in a short note, and recommend one to the founder for final pick.

### 1. Insurance industry loss data

Large commercial insurers (Marsh, Aon, Zurich, Travelers, Liberty Mutual) periodically publish industry loss reports that include equipment / asset shrinkage by industry. Look specifically for:

- "Annual asset loss survey" or similar from any major commercial-property insurer.
- Industry-specific (construction, education, healthcare) loss reports.
- The numbers are usually published as % of insured fleet value lost annually — directly comparable to Shelf's ghost-asset rate.

**Likely framing:** "The Marsh 2024 Commercial Asset Loss Report estimates a {{X}}% annual equipment loss rate across surveyed organizations. Shelf workspaces' ghost-asset rate of {{shelf rate}}% is below / above that baseline."

**Research notes:** check whether each report is publicly downloadable. Marsh and Aon usually require a sign-up form but the PDFs are accessible.

---

### 2. Industry association reports

Industry trade associations sometimes publish equipment-management benchmarks for their members. Most relevant:

- **ARMA International** (records and information management) — publishes asset-tracking benchmarks.
- **ASIS International** (security industry) — publishes asset shrinkage rates.
- **APPA** (educational facilities) — publishes equipment management norms for higher education.
- **AGC** (Associated General Contractors of America) — publishes tool loss data for construction firms.
- **HFTP / SHFM** (facilities management) — publishes asset utilization data.

**Likely framing:** "The ARMA 2025 Information & Asset Management Benchmark Report finds {{X}}% of surveyed organizations conduct annual physical inventory audits. Shelf's telemetry shows {{Y}}% of audit-enabled workspaces ran at least one audit in the year."

**Research notes:** most association reports are available to members only. Check whether Shelf has access via an existing membership; if not, the one-off $300–$500 cost is justifiable.

---

### 3. Academic research

The academic literature on asset management and inventory accuracy is thin but worth checking:

- **MIT Center for Information Systems Research (CISR)** — occasional studies on asset visibility.
- **Auburn University RFID Lab** — inventory accuracy research, primarily retail but transferable.
- **University of Tennessee Global Supply Chain Institute** — asset-tracking case studies.
- **Stanford Graduate School of Business** — ops management research on inventory accuracy.

Google Scholar searches for "inventory accuracy rate", "equipment shrinkage", "fixed asset register accuracy" yield citable papers.

**Likely framing:** "A 2023 Auburn University RFID Lab study found inventory record accuracy averaged {{X}}% in surveyed retail environments. While not directly comparable (retail vs. enterprise asset management), Shelf's audit findings of {{Y}}% Missing rate at first scan suggest similar magnitudes of record / reality divergence across categories."

**Research notes:** academic citations carry the most editorial weight. The framing has to acknowledge the analogy (e.g. retail inventory vs. enterprise asset management).

---

### 4. Government / regulator data

Federal and state asset-tracking audits sometimes publish loss rates for public-sector equipment:

- **GAO (Government Accountability Office)** — periodically audits federal asset registers. The DOD asset accountability reports from GAO are public and often cite shocking loss percentages.
- **OECD** — occasional studies on public-sector asset management.
- **National Audit Office (UK)** equivalent reports.

**Likely framing:** "The 2023 GAO audit of [agency] found {{X}}% of expected equipment unaccounted for in physical inventory checks. Shelf's enterprise-customer data shows a meaningfully lower Missing rate of {{Y}}%, attributable to structured QR-based tracking workflows."

**Research notes:** these reports tend to be eye-popping (sometimes 20–40% loss rates) which provides a useful anchor showing how bad it gets when no system is in place. The comparison framing is favourable to Shelf.

---

### 5. Consulting firm reports

The major consulting firms (Deloitte, PwC, KPMG, EY, Accenture, Gartner, Forrester) periodically publish equipment / asset management reports:

- **Deloitte** — "Asset Management Maturity" reports.
- **Gartner** — Magic Quadrant for IT Asset Management; sometimes includes industry benchmark stats.
- **Forrester** — Total Economic Impact studies (vendor-funded, treat carefully).

**Research notes:** consulting reports usually have methodology sections. They're sometimes vendor-sponsored — read the disclosure. Forrester TEI studies in particular are commissioned by the vendor being studied; cite them with that disclosure.

---

## Decision template for the founder

The data team / marketing fills this in for the chosen candidate:

- **Source:** [organization name]
- **Title:** [report title]
- **Year:** [publication year]
- **URL:** [stable URL]
- **Methodology disclosed?** [Yes / No / Partial]
- **Number we'd cite:** [the specific stat in the form it appears in the source]
- **Comparison to Shelf:** [our number, with direction — better / worse / neutral]
- **Proposed framing for the callout box in the MDX:** [one-paragraph draft]
- **Cost to access:** [free / $X for membership]
- **Recommendation:** [USE / CONSIDER / REJECT, with one-line reason]

The founder reviews and picks one. The chosen source's full citation goes into the `externalBenchmark` field in `src/data/state-of-equipment-management-2026.ts` and into the MDX's external-benchmark callout.

---

## If no good benchmark exists

If marketing genuinely can't find a credible third-party number to cite, the **fallback** is to acknowledge it explicitly in the report's "limitations" section: "No directly comparable industry-wide benchmark on ghost-asset rates was identified during research. The 2027 edition will publish this as the first year-over-year baseline for the metric."

Don't fabricate a comparison. Don't paraphrase a vendor blog post as a benchmark. An honest "we looked and couldn't find one" is better than a weak citation that erodes trust.
