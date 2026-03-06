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
- **Analytics**: Cloudflare Web Analytics (traffic) + Supabase custom events (conversions)
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

1. **Cloudflare Web Analytics** — auto-injected by CF Pages (no manual beacon needed), tracks page views, visitors, referrers, countries, Core Web Vitals
2. **Supabase custom events** — CTA clicks, form submissions, search queries, scroll depth, content changes
3. **Google Search Console** — search queries, impressions, CTR, average position (how people find the site)

**Tracked events** (via `trackEvent()` from `@/lib/analytics`):
- `page_view` — every route change (with referrer, UTM params)
- `session_start` — once per page load (landing page, referrer, UTMs)
- `signup_click` — "Sign up free" button clicks (navbar, hero, pricing)
- `demo_form_submit` — demo form success (with full attribution: landing page, journey, UTMs)
- `pricing_cta` — pricing card button clicks (with plan ID + billing period)
- `search_query` — search terms (3+ chars, with result count)
- `scroll_depth` — 25/50/75/100% milestones
- `time_on_page` — seconds spent (on navigation away)
- `404_hit` — broken inbound links (path + referrer)

**CLI commands** (for querying data from Claude Code):
```bash
node scripts/analytics.mjs summary      [--days 7]    # Full dashboard
node scripts/analytics.mjs traffic      [--days 30]   # Visitors, views, trend
node scripts/analytics.mjs top-pages    [--days 30]   # Page ranking
node scripts/analytics.mjs conversions  [--days 7]    # Event counts
node scripts/analytics.mjs searches     [--days 30]   # Search queries
node scripts/analytics.mjs referrers    [--days 30]   # Traffic sources
node scripts/analytics.mjs attribution  [--days 30]   # Demo form journey
node scripts/analytics.mjs content-changes [--days 30] # SEO experiment log
node scripts/analytics.mjs gsc-summary    [--days 30] # GSC overview + quick wins
node scripts/analytics.mjs gsc-queries    [--days 30] # Top search queries (clicks, impr, CTR, pos)
node scripts/analytics.mjs gsc-pages      [--days 30] # Top pages by search performance
node scripts/analytics.mjs experiments                        # Show all SEO experiments + auto-pull results
node scripts/analytics.mjs experiments capture-baseline <id>  # Capture baseline GSC metrics for an experiment
node scripts/analytics.mjs experiments deploy <id>            # Mark experiment as deployed (starts evaluation timer)
```

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
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | Client | Supabase Edge Function URL for analytics events |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Client | Crisp live chat website ID |
| `CF_API_TOKEN` | Server/CLI | Cloudflare API token (Analytics:Read scope, for CLI queries) |
| `CF_SITE_TAG` | Server/CLI | Cloudflare Web Analytics site tag (for API queries) |
| `SUPABASE_URL` | Server/CLI | Supabase project URL (for analytics CLI + content snapshot) |
| `SUPABASE_SERVICE_KEY` | Server/CLI | Supabase service role key (for analytics CLI + content snapshot) |
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
- `NEXT_PUBLIC_ANALYTICS_ENDPOINT` — Supabase Edge Function URL for analytics events
- `NEXT_PUBLIC_CRISP_WEBSITE_ID` — Crisp live chat website ID
- `SUPABASE_URL` — Supabase project URL (for content snapshot)
- `SUPABASE_SERVICE_KEY` — Supabase service role key (for content snapshot)

**Optional GitHub variable**:
- `NEXT_PUBLIC_APP_URL` — Base URL for SEO (defaults to `https://shelf.nu`)

## Things to avoid

- Don't add `"use server"` directives — breaks static export.
- Don't add API routes (`app/api/`) — not supported in static export.
- Don't use `next/headers` or `next/cookies` — server-only APIs.
- Don't commit `.env.local` — contains Supabase keys (gitignored).
- Don't commit `public/pagefind/` — generated at build time (gitignored).
- Don't send auth headers (Authorization, apikey) in client-side fetch — causes CORS issues.
- Don't add `Co-Authored-By` lines to commit messages.
