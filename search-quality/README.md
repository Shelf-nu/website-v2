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
