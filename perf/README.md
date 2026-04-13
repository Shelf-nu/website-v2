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
- Lighthouse-CI runs a synthetic desktop-profile audit (cable-like throttling,
  3 runs per URL) and asserts against budgets in `lighthouserc.json`.
- Both feed into the PR comment + Phase 1 baseline report.

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
