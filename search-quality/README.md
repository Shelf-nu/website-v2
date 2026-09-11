# Search-quality harness

Guards the Cmd+K site search against ranking regressions. It loads the built
Pagefind index and asserts that real queries surface the right canonical page —
using the **same** ranking config the app ships
([`src/lib/search-ranking.json`](../src/lib/search-ranking.json)), so the harness
and the app can never drift.

## Why this exists

Search ranking regressed silently before: `/features/audits` fell to #5 for the
query "audits" because Pagefind's defaults bury long canonical pages under short,
tangential ones. The fix was two ranking dials + a content-page keyword boost.
This harness exists so that class of regression fails loudly instead.

## Run it

```bash
npm run build        # produces out/ + the Pagefind index
npm run search:quality
```

The Playwright config ([`playwright.search.config.ts`](../playwright.search.config.ts))
auto-serves `out/` on port 4174 (reuses an existing server if one is running).
Chromium only — ranking is identical across engines.

## How to read the output

- **Asserted** queries (`queries` in `queries.json`) must surface their `expect`
  page within `topN` (default 3). Any miss fails the run and prints what won
  instead.
- **Known issues** (`knownIssues`) are reported with their current rank but never
  fail the run. They're the backlog — watch them improve over time.

Each query runs on a fresh Pagefind instance, the way a visitor's first search
does. With a shared instance, every index chunk an earlier query loaded stayed
loaded, so a query could pass or fail depending on the entries above it.

## Failures that aren't ranking problems

Both of these showed up in September 2026 as harness failures ("demo" at #5,
"workspaces" missing entirely). Neither could be fixed in `search-ranking.json`.

- **Boilerplate that puts a word on every page.** Pagefind weighs each matched
  word by how rare it is across the site, so a word on every page counts for
  almost nothing. Then any rare word that merely *starts with* the query can
  outscore the exact match. "Book a demo" in the global CTA, the KB sidebar and
  the other templated CTAs put "demo" on 418 of 424 pages, so a case study
  mentioning "demon statues" and the user-role guides about who can "demote"
  whom outranked /demo. Rule: templated chrome that
  repeats across a collection (CTA sections, sidebars, button rows) gets
  `data-pagefind-ignore`, like the navbar and footer. Symptom: the expected page
  scores near zero while pages with only a longer look-alike word rank above it.
- **Pagefind 1.4 loads the wrong index chunk.** It picks the chunk from the word
  as typed but matches by stem. When a chunk boundary falls between the two
  ("workspac" | "workspace"), the search never sees the stem's chunk.
  [`src/lib/search-warmup.ts`](../src/lib/search-warmup.ts) preloads each word's
  prefixes first; the search dialog and this harness both call it. Symptom: a
  query returns a handful of near-zero results and its obvious page is missing.

Pagefind 1.5 fixes the chunk lookup upstream, but it also re-weights ranking. On
the 2026-09-11 index, 1.5.2 with our ranking dropped this basket from 49 to 37
of 51: short `/updates` posts outranked the canonical feature pages, even with
`metaWeights.title` set to 0. Treat that upgrade as its own re-tune. Once it's
done, the warmup can go.

## The discovery loop (keep search getting better)

Search quality is demand-driven. Roughly monthly:

1. Pull what people actually search:
   - on-site: `node scripts/analytics.mjs searches --days 90` (PostHog)
   - from Google: `node scripts/analytics.mjs gsc-queries --days 90` (GSC)
2. For each meaningful query, check it has a clean canonical destination and that
   the destination ranks. Add new ones to `queries.json`.
3. Fix the misses one of two ways:
   - **Ranking / keywords** — re-tune `src/lib/search-ranking.json`, or add the
     term to a page's `seo.keywords` (content pages feed those into Pagefind's
     10x keyword block via `frontmatterKeywords`).
   - **Content** — if there's no good page to rank (e.g. a capability with only
     scattered mentions), that's a content gap, not a ranking bug. Create the
     canonical page (verify the product actually supports it first).
4. Re-run `npm run search:quality` until green.

## Tuning ranking

`src/lib/search-ranking.json` holds `pageLength` and `termSimilarity`
([Pagefind ranking docs](https://pagefind.app/docs/ranking/)). Change them there
only — both the app and this harness read that file. Re-run the harness after any
change to confirm the basket stays green.
