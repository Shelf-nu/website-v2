# Perf tests

Playwright + web-vitals perf tests for shelf.nu. WebKit is a first-class
project because the jank we care about is Safari-specific.

## Running locally

```bash
# Terminal 1 — build + serve the production output
npm run build
npx serve out -l 4173

# Terminal 2 — run the perf tests (against the served build)
npm run test:perf                    # all projects (webkit + chromium + mobile-safari)
npx playwright test --project=webkit # WebKit only (fastest iteration)
npm run test:perf:ui                 # Playwright UI mode for debugging
```

If `out/` already exists and a server is running on `:4173`, the config
auto-reuses it (see `reuseExistingServer: !process.env.CI`).

## What's tested

| Spec file | Targets | Key assertions |
|---|---|---|
| `blog-sidebar.spec.ts` | "Blinking anchors on blog deep links" — blog-sidebar.tsx IO + accordion thrash | CLS on initial load, CLS on deep-link nav, CLS on TOC click |
| `navbar.spec.ts` | "Menu jank" + "Scroll jank" — navbar.tsx scroll listener, top-banner collapse | Mega menu open ms, mobile menu open ms, scroll CLS, long-tasks, frame durations |

The "Search click jank" spec (`search.spec.ts`) is deferred — the
placeholder PostHog / Crisp env vars used in CI break React hydration
before the search button's click handler attaches, so the test is
flaky in ways unrelated to the search feature itself. Will re-introduce
in a follow-up PR once we've either (a) switched the CI build to use
minimal real keys, or (b) properly blocked third-party scripts at the
Playwright config level.

## Starter budgets (lenient — ratchet in Phase 5)

- CLS (blog load): **< 0.1** (target post-fix: < 0.05)
- CLS (scroll): **< 0.05** (target post-fix: < 0.01)
- Mega menu open: **< 2500ms** (target post-fix: < 300ms)

These budgets will be ratcheted down as fixes land so every PR must
maintain-or-improve the current-production numbers.

## CI

`.github/workflows/perf.yml` runs on every PR:

1. Install deps + browsers (webkit + chromium)
2. `npm run build` → produces `out/`
3. Lighthouse-CI against `out/` with budgets from `lighthouserc.json`
4. Playwright perf suite against `out/` served on `:4173`
5. Uploads HTML report + JSON as artifact
6. Comments pass/fail summary on the PR

The perf workflow is **not yet a required check on `main`** — Phase 5 adds that
once the current-production baseline is stable.

## Where the numbers come from

- Playwright uses the `web-vitals` library (v5) injected into each page via
  `perf/helpers/capture-vitals.ts`. Same library Google uses for CrUX, so
  numbers match Lighthouse field data.
- Lighthouse-CI runs a synthetic desktop-profile audit (cable-like throttling)
  and asserts against budgets in `lighthouserc.json`. Note the run count differs
  by trigger: `.github/workflows/perf.yml` passes
  `--collect.numberOfRuns=1` on pull requests and uses the config's
  `numberOfRuns: 3` only on pushes to `main`. So a PR's numbers are a single
  sample and are noisier than a `main` run — see the calibration section below.
- Both feed into the PR comment + Phase 1 baseline report.

## How the `lighthouserc.json` budgets are calibrated

Budgets target the **GitHub Actions `ubuntu-latest` runner** (2-core shared VM),
not a local developer laptop. A local M-series Mac scores ~20 points higher on
category metrics than the CI hardware even with `cpuSlowdownMultiplier: 1`.
Key calibration decisions:

- **Category scores** (performance/a11y/best-practices/seo) are all `warn`,
  not `error`. These are noisy composites that vary by runner CPU. Phase 5
  will re-introduce them as `error` once there's enough multi-run data to
  set a defensible floor.
- **Hardware-comparable metrics** stay as `error`:
  - CLS max 0.1 — hardware-independent, real user-visible number
  - LCP max 3500 ms — loose enough for CI, tight enough to catch regressions
- **TBT is `warn` with a very loose threshold** (50000 ms) because homepage
  TBT on the CI runner is *extremely noisy*, not because it is large.

  An earlier version of this file claimed the homepage "hits ~39,500 ms of TBT
  on ubuntu-latest CI across all 3 runs" and blamed the `cobe` globe and
  framer-motion hero animations. **That was wrong on both counts and has been
  corrected.** Measured from two real CI runs (2026-07-22):

  | URL | run A | run B |
  |---|---|---|
  | `/` | perf 99, TBT **22 ms** | perf 63, TBT **1418 ms** |
  | `/pricing` | perf 99, TBT 2 ms | perf 99, TBT 46 ms |
  | `/features/workspaces` | perf 100, TBT 0 ms | perf 100, TBT 4 ms |
  | `/mobile-app` | perf 100, TBT 0 ms | perf 100, TBT 0 ms |
  | blog post | perf 88, TBT 0 ms | perf 88, TBT 0 ms |

  Worst observed is 1418 ms — the old figure was off by ~28x even against
  that, and by ~1800x against the median. The attribution was wrong too: the
  globe is `dynamic(..., { ssr: false })` and IntersectionObserver-gated
  (`scale-block.tsx`, `globe.tsx`), and its chunk is not referenced by
  `out/index.html` at all.

  The real signal is the **spread**: the same homepage swings 22 ms → 1418 ms
  (and perf 99 → 63) purely on 2-core shared-runner contention. That is why TBT
  and the category scores are `warn`, not `error`.

  **Do not ratchet the TBT threshold on one green run.** Two samples are not
  enough to set a floor, and a tight threshold would fail flakily on a slow
  runner. Collect multi-run `main` data first — that is what Phase 5 is for.
- FCP and Speed Index are `warn` — they compound with other metrics in
  the category score, so gating on them adds noise without signal.

Do not add non-audit keys (like `_comment` or `_metadata`) inside the
`ci.assert.assertions` object — LHCI treats every key there as a Lighthouse
audit ID and fails validation when it can't find a matching audit. Put
explanatory text here instead.

## Bundle analysis (`npm run analyze`)

To see what's in the shipped JS bundles — tree-shake opportunities, heavy
deps, duplicated modules, route-level weight:

```bash
# Interactive web UI at http://localhost:4000
npm run analyze

# Or write the report to disk without starting a server
npm run analyze -- -o
# → .next/diagnostics/analyze/
```

Uses Next 16's native `next experimental-analyze` (Turbopack-compatible).
The older `@next/bundle-analyzer` package is intentionally *not* installed
because Shelf builds with Turbopack and that package prints "not compatible
with Turbopack builds, no report will be generated" and silently does nothing.

## Gotchas

- **web-vitals IIFE path**: `capture-vitals.ts` reads the bundle via
  `process.cwd() + "node_modules/web-vitals/dist/web-vitals.iife.js"`.
  If Playwright is run from a different cwd, this breaks. Always run from repo root.
- **WebKit on GH Actions** requires `playwright install --with-deps webkit`
  which pulls apt-get dependencies (libwebkit2gtk). Already in the workflow.
- **CLS `reportAllChanges: true`** gives us delta-capable metrics but also
  means the CLS value jumps around; don't compare intermediate readings,
  only start vs. end.
- **Starter budgets are deliberately loose** so the first perf workflow run
  on `main` goes green. Tighten in Phase 5.
