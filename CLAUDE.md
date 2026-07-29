# CLAUDE.md — Shelf Website V2

## Project overview

Marketing website for [Shelf.nu](https://shelf.nu), an open-source asset management platform. Built with Next.js 16 App Router, fully static-exported to `out/` for CDN hosting (Cloudflare Pages, S3, etc.).

## Tech stack

- **Framework**: Next.js 16 (App Router) with `output: "export"` (static)
- **React**: 19
- **Styling**: Tailwind CSS 4 + PostCSS, CSS variables for theming
- **UI components**: Radix UI primitives in `src/components/ui/`, styled with CVA + tailwind-merge
- **Icons**: lucide-react
- **Forms**: Zod client-side validation, fetch POST to Supabase Edge Function
- **Search**: Pagefind (static search index, Cmd+K dialog)
- **Content**: MDX via next-mdx-remote (blog, KB, case studies, etc.)
- **Animation**: Framer Motion
- **Analytics**: PostHog (product analytics, autocapture, session replay) + Cloudflare Web Analytics (backup) + GSC (search)
- **Linting**: ESLint 9

## Key commands

```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Full build: next build → pagefind index → copy to public/
npm run start         # Serve static output: npx serve out
npm run lint          # ESLint
```

## Project structure

```
src/
├── app/(marketing)/     # All pages (about, blog, demo, pricing, tools, etc.)
├── components/
│   ├── analytics/       # Analytics tracker, tracked link, 404 tracker
│   ├── ui/              # Radix-based design system (button, card, dialog, etc.)
│   ├── forms/           # Demo form (client-only, fetches to external endpoint)
│   ├── search/          # Pagefind search dialog + wrapper component
│   ├── sections/        # Reusable page sections (hero, CTA, features)
│   ├── layout/          # Header, footer, navigation
│   └── seo/             # SEO components (JSON-LD, meta)
├── data/                # Static data (pricing tiers, customer logos, features)
├── lib/                 # Utilities (seo.ts, mdx.ts, utils.ts)
content/                 # MDX files for blog, KB, case studies, etc.
public/                  # Static assets (images, logos, pagefind index for dev)
out/                     # Build output (static HTML + pagefind index)
```

## Important conventions

### Linting
- Always run `npm run lint` after completing a task to verify no lint errors were introduced.

### Static export
- The site is **fully static** (`output: "export"`). No server actions, no API routes, no SSR.
- Never use `"use server"`, `cookies()`, `headers()`, or anything requiring a Node.js runtime.
- All dynamic routes must have `generateStaticParams()`.
- Images use `unoptimized: true` (no Next.js Image Optimization API).

### Pagefind search
- Pages are indexed via `<PagefindWrapper>` component with `data-pagefind-body`.
- Use `type` prop for filter categories (Blog, Page, Feature, etc.).
- Use `keywords` prop to boost ranking for primary search terms (weight 10x).
- Build writes index to `out/pagefind`; `search:dev` script copies to `public/pagefind` for dev.
- The search dialog lazy-loads `/pagefind/pagefind.js` at runtime.

### Forms
- Demo form at `/demo` uses client-side Zod validation + fetch POST.
- Endpoint URL configured via `NEXT_PUBLIC_FORM_ENDPOINT` env var.
- Field names sent as snake_case to match Supabase Edge Function API.
- Honeypot field (`website`) for anti-spam — silently "succeeds" if filled.
- UTM params and source URL captured client-side via `useSearchParams()`.

### Path alias
- `@/` maps to `./src/` (e.g., `import { Button } from "@/components/ui/button"`).

### Styling
- Tailwind utility classes, no CSS modules.
- Brand color: orange-600. Accent backgrounds: orange-50.
- Dark mode supported via next-themes + CSS variables.
- `cn()` utility from `@/lib/utils` for merging classnames.

### Analytics

Three-layer analytics, all free:

1. **PostHog** (primary) — product analytics with autocapture (pageviews, clicks, form submits), session replay, heatmaps, web vitals. Custom events for specific tracking. Queried via HogQL API from CLI.
2. **Cloudflare Web Analytics** — auto-injected by CF Pages (backup traffic data, Core Web Vitals)
3. **Google Search Console** — search queries, impressions, CTR, average position (how people find the site)

**PostHog autocaptures**: `$pageview`, `$pageleave` (with time on page), `$autocapture` (clicks, form submits), web vitals.

**Custom events** (via `trackEvent()` from `@/lib/analytics` → `posthog.capture()`):
- `signup_click` — "Sign up free" button clicks (navbar, hero, pricing)
- `demo_form_submit` — demo form success (with full attribution: landing page, journey, UTMs)
- `pricing_cta` — pricing card button clicks (with plan ID + billing period)
- `search_query` — search terms (3+ chars, with result count)
- `scroll_depth` — 25/50/75/100% milestones
- `404_hit` — broken inbound links (path + referrer)
- `chat_opened` / `chat_message_sent` — Crisp chat interactions
- `tracking_quiz_started` / `tracking_quiz_completed` — tracking-method decision quiz on /knowledge-base/how-to-choose-a-tracking-method (completed carries `result` + `path`)
- `demo_cta` — "Book a demo" clicks (distinct from `demo_form_submit`, which is the successful submission)
- `tool_calculate` / `tool_share` / `tool_interact` — calculator usage, not conversion intent
- `role_picker_completed` — role selection

**Every signup CTA fires `signup_click` with a `location` prop** (`navbar`, `kb_sidebar`, `tool_salvage`, `pricing_feature_table`, …). Keep it that way — until 2026-07-29 the calculator CTAs fired `tool_cta_click` instead, and that single naming split made every by-page conversion query undercount the tools cluster by ~10×. Group by `location`, never invent a second event name for the same user action.

**Server-side events from the app** (same PostHog project, NOT website events): `signup_completed`, `upgrade_completed` (carries `mrr`, `tierId`, `billing_cycle`, `via`), `subscription_cancelled`. See the traps below before using them.

**CLI commands** (for querying data from Claude Code):
```bash
node scripts/analytics.mjs summary      [--days 7]    # Full dashboard
node scripts/analytics.mjs traffic      [--days 30]   # Visitors, views, trend
node scripts/analytics.mjs top-pages    [--days 30]   # Page ranking
node scripts/analytics.mjs conversions  [--days 7]    # Event counts
node scripts/analytics.mjs searches     [--days 30]   # Search queries
node scripts/analytics.mjs referrers    [--days 30]   # Traffic sources
node scripts/analytics.mjs attribution  [--days 30]   # Demo form journey
node scripts/analytics.mjs funnel       [--days 30]   # Landing page → product-intent rate (fit signal)
node scripts/analytics.mjs revenue      [--days 90]   # MRR events + trial-vs-churn split
node scripts/analytics.mjs content-changes [--days 30] # SEO experiment log
node scripts/analytics.mjs gsc-summary    [--days 30] # GSC overview + quick wins
node scripts/analytics.mjs gsc-queries    [--days 30] # Top search queries (clicks, impr, CTR, pos)
node scripts/analytics.mjs gsc-pages      [--days 30] # Top pages by search performance
node scripts/analytics.mjs experiments                        # Show all SEO experiments + auto-pull results
node scripts/analytics.mjs experiments capture-baseline <id>  # Capture baseline GSC metrics for an experiment
node scripts/analytics.mjs experiments deploy <id>            # Mark experiment as deployed (starts evaluation timer)
```

**Reading the funnel / revenue data — three traps, all hit in practice:**

1. **Never compare raw `subscription_cancelled` events against `upgrade_completed` events and call the difference churn.** Most cancels are expiring trials from accounts that never paid; others are Stripe plan swaps firing cancel+create as a pair. `revenue` splits them three ways.
2. **PostHog cannot measure churn at all, and `revenue` says so.** The app's revenue events only start **2026-06-13**, so every customer who upgraded before that looks like "no upgrade on record" and is indistinguishable from an expiring trial. The command's post-upgrade-cancel count is a **floor, not the churn rate**. Real figures come from Stripe → Billing overview → Churn (as of 2026-07-29: 2.6% subscriber churn, 0.8% net MRR churn, 48 churned YTD against 85 new, retention cohorts flattening at 67–95%).
3. **PostHog measures MRR *added*, not total MRR.** Total MRR ($8.7k), subscriber counts (223), trial conversion (700 trials → 58 converted) and retention cohorts live in **Stripe → Billing overview** only.
4. **Website sessions cannot be joined to revenue.** The app emits only server-side events and no `app.shelf.nu` client events exist, so anonymous browser IDs never stitch to user IDs. Fixing this needs `posthog.identify(userId)` client-side in the product repo.

**Low intent on a page is a segment signal, not automatically a CTA bug.** `funnel` flags high-fit (≥1.5× average) and low-fit (<0.35×) landing pages. Solutions/alternatives pages run 13–29%; calculators and generic how-to KB pages run 0–5%. That gap is two different audiences, not broken buttons — check search intent before "fixing" a low-fit page.

**SEO experiments** — `data/seo-experiments.json` tracks title/description/redirect experiments with before/after GSC metrics. The `experiments` CLI auto-pulls results after the evaluation window (default 14 days). Workflow: plan experiment → capture baseline → make change → deploy → wait → check results → record learnings.

**Content changelog** — `scripts/snapshot-content.mjs` runs at build time on production deploys. Compares page titles/descriptions against last snapshot in Supabase and logs changes to `content_changelog` table. Ask "did our title change affect traffic?" and get before/after analysis.

**Adding new tracked events**:
- In client components: `import { trackEvent } from "@/lib/analytics"; trackEvent("event_name", { key: "value" })`
- In server components: use `<TrackedLink>` from `@/components/analytics/tracked-link`

## Environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_FORM_ENDPOINT` | Client | Supabase Edge Function URL for form submissions |
| `NEXT_PUBLIC_APP_URL` | Client | Base URL for SEO/sitemap (defaults to https://shelf.nu) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Client | PostHog project API key (for client-side tracking) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Client | PostHog ingest host (https://us.i.posthog.com) |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Client | Crisp live chat website ID |
| `POSTHOG_PERSONAL_API_KEY` | Server/CLI | PostHog personal API key (for CLI queries via HogQL) |
| `POSTHOG_PROJECT_ID` | Server/CLI | PostHog project ID (default: 336438) |
| `SUPABASE_URL` | Server/CLI | Supabase project URL (for content snapshot) |
| `SUPABASE_SERVICE_KEY` | Server/CLI | Supabase service role key (for content snapshot) |
| `GSC_KEY_FILE` | Server/CLI | Path to Google Search Console service account JSON key |
| `GSC_SITE_URL` | Server/CLI | GSC property URL (e.g. `sc-domain:shelf.nu`) |

## CI/CD

Deployed to **Cloudflare Pages** via GitHub Actions (`.github/workflows/deploy.yml`):
- **Production**: auto-deploys on merge to `main`
- **Preview**: deploys per PR, posts preview URL as a PR comment
- Pipeline: `npm ci` → `npm run lint` → `npm run build` → `wrangler pages deploy`
- Node version pinned in `.nvmrc` (22)

**Required GitHub secrets**:
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages edit permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID
- `NEXT_PUBLIC_FORM_ENDPOINT` — Supabase Edge Function URL for form submissions
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key
- `NEXT_PUBLIC_CRISP_WEBSITE_ID` — Crisp live chat website ID
- `SUPABASE_URL` — Supabase project URL (for content snapshot)
- `SUPABASE_SERVICE_KEY` — Supabase service role key (for content snapshot)

**Optional GitHub variable**:
- `NEXT_PUBLIC_APP_URL` — Base URL for SEO (defaults to `https://shelf.nu`)

## Deployment rules

1. **Never push directly to main.** Always create a feature branch and open a PR. No exceptions.
2. **New env vars = verify secrets first.** If a change adds or depends on a new `NEXT_PUBLIC_*` or server env var, confirm the corresponding GitHub secret exists BEFORE merging. The build bakes `NEXT_PUBLIC_*` values at build time — a missing secret means the feature silently ships broken.
3. **Verify production after deploy.** After a deploy, check the live site to confirm the change actually works. A green CI check only means the build succeeded, not that the feature is functional. For analytics: check real events flowing. For UI: check the live page.
4. **Never claim something is working without evidence.** If you can't verify it, say so.

## Things to avoid

- Don't push directly to main — always use a branch + PR.
- Don't add `"use server"` directives — breaks static export.
- Don't add API routes (`app/api/`) — not supported in static export.
- Don't use `next/headers` or `next/cookies` — server-only APIs.
- Don't commit `.env.local` — contains Supabase keys (gitignored).
- Don't commit `public/pagefind/` — generated at build time (gitignored).
- Don't send auth headers (Authorization, apikey) in client-side fetch — causes CORS issues.
- Don't add `Co-Authored-By` lines to commit messages.
