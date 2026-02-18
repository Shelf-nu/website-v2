# Site Search — Pagefind Integration

Full-text search across all 243+ content pages, powered by [Pagefind](https://pagefind.app/) (MIT, zero runtime cost, no external service).

## How it works

Pagefind is a **post-build** indexer. After Next.js generates static HTML, Pagefind scans those files and produces a compressed search index (~50-150 KB). The browser loads the index on demand when the user opens the search dialog.

### Architecture

```
next build              → .next/server/app/**/*.html   (SSG output)
pagefind --site ...     → public/pagefind/*             (index + JS client)
next start / deploy     → /pagefind/* served statically
```

The search UI (`SearchDialog`) lazy-loads `/pagefind/pagefind.js` only when the user presses **Cmd+K** (or clicks the search button). No search code is in the initial bundle.

## Build commands

### SSR deployment (Fly.io / VPS / Vimexx)

```bash
npm run build
```

This runs:
1. `next build` — generates static HTML in `.next/server/app/`
2. `npm run search:index` — runs `pagefind --site .next/server/app --output-path public/pagefind`
3. `npm run search:verify` — asserts the index exists and has ≥ 150 pages (fails CI if broken)

The Pagefind artifacts land in `public/pagefind/`, which Next.js serves as static files at `/pagefind/*`.

### Static export (Cloudflare Pages)

```bash
npm run build:static
```

This runs:
1. `NEXT_OUTPUT=export next build` — generates a full static export in `out/`
2. `pagefind --site out --output-path out/pagefind` — indexes the export and writes into `out/pagefind/`
3. `node scripts/verify-pagefind.mjs out/pagefind` — asserts the index exists and has ≥ 150 pages

Deploy the `out/` directory to Cloudflare Pages (or any static host). The `NEXT_OUTPUT=export` env var triggers `output: "export"` and `images.unoptimized: true` in `next.config.ts`.

### Development

In dev mode (`npm run dev`), the search index does not exist. The SearchDialog degrades gracefully — it shows the UI but logs a console warning. To test search locally:

```bash
npm run build:next && npm run search:index
npm run dev
```

## Where `/pagefind` files come from

| File | Source |
|------|--------|
| `public/pagefind/pagefind.js` | Pagefind client library (loaded by SearchDialog) |
| `public/pagefind/pagefind-ui.js` | Optional default UI (not used — we have a custom dialog) |
| `public/pagefind/pagefind-*.pf_*` | Chunked compressed index fragments (loaded on demand per query) |
| `public/pagefind/pagefind-entry.json` | Index metadata |
| `public/pagefind/fragment-*.pf_fragment` | Individual page content fragments |

These files are **generated at build time** and listed in `.gitignore`. They must be regenerated on every build.

## Content type filtering

Each content page is wrapped in a `<PagefindWrapper>` component that emits:

- `data-pagefind-body` — tells Pagefind to index only this section (skipping nav/footer)
- `data-pagefind-filter="type:Blog"` — enables type-based filtering in search results
- `data-pagefind-meta="title:…"` — provides the display title

Available filter values: `Blog`, `Knowledge Base`, `Feature`, `Solution`, `Case Study`, `Alternative`, `Industry`, `Glossary`, `Use Case`, `Concept`, `Update`.

The nav and footer are wrapped in `data-pagefind-ignore` in the marketing layout.

## Search UI

- **Trigger**: Cmd+K (Mac) / Ctrl+K (Windows/Linux), or click the search button in the navbar
- **Keyboard navigation**: Arrow keys, Enter to open, Escape to close
- **Type filter pills**: Appear when a query is entered, allowing scope to a specific content type
- **Results**: Title, highlighted excerpt, URL path, and type badge
- **Lazy-loaded**: Pagefind JS client loads only on first dialog open
- **Accessible**: `role="dialog"`, `aria-modal`, `role="listbox"` for results, focus management

## Key files

| File | Purpose |
|------|---------|
| `src/components/search/search-dialog.tsx` | Search UI (client component) |
| `src/components/search/pagefind-wrapper.tsx` | `data-pagefind-*` attribute wrapper |
| `src/app/(marketing)/layout.tsx` | `data-pagefind-ignore` on nav/footer |
| `src/app/(marketing)/*/[slug]/page.tsx` | Each slug page wraps content in `PagefindWrapper` |
| `next.config.ts` | Conditional `output: "export"` via `NEXT_OUTPUT` env var |
| `package.json` | Build scripts (`build`, `search:index`, `search:verify`, `build:static`) |
| `scripts/verify-pagefind.mjs` | Post-build assertion — fails CI if index is missing or too small |
| `.gitignore` | Excludes `public/pagefind/` |
