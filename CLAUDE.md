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

## Environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_FORM_ENDPOINT` | Client | Supabase Edge Function URL for form submissions |
| `NEXT_PUBLIC_APP_URL` | Client | Base URL for SEO/sitemap (defaults to https://shelf.nu) |

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

**Optional GitHub variable**:
- `NEXT_PUBLIC_APP_URL` — Base URL for SEO (defaults to `https://shelf.nu`)

## Things to avoid

- Don't add `"use server"` directives — breaks static export.
- Don't add API routes (`app/api/`) — not supported in static export.
- Don't use `next/headers` or `next/cookies` — server-only APIs.
- Don't commit `.env.local` — contains Supabase keys (gitignored).
- Don't commit `public/pagefind/` — generated at build time (gitignored).
- Don't send auth headers (Authorization, apikey) in client-side fetch — causes CORS issues.
