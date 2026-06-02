# Shelf — Product Facts (single source of truth)

> **Purpose:** the canonical, verified facts about Shelf for anyone — human or AI agent — writing or reviewing marketing / KB / AI-discovery content. **Read this before making any product claim.** The content truthfulness-gate and `scripts/check-product-claims.mjs` enforce the highest-risk rules below.
>
> **Why this file exists:** a stale "Native App Coming Soon — join the beta waitlist" claim shipped on the #1-ranking `/knowledge-base/shelf-mobile-app` page *after* the iOS app had launched, because there was no single place that said "the iOS app is live." This is that place.

`lastVerified: 2026-06-02`

## What Shelf is
- Open-source (**AGPL**), **QR-first asset & equipment management** platform (shelf.nu). Public repo: `github.com/Shelf-nu/shelf.nu`.
- For tracking equipment/assets a team **uses** — IT hardware, AV/camera gear, tools, vehicles, lab, education/media. **Not** retail/SKU/stock inventory.

## Mobile / apps
- **Shelf Companion (iPhone): LIVE on the Apple App Store since 2026-05-25** — `https://apps.apple.com/app/id6765639874`. iPhone-only (iOS 15.1+), **free**, requires an existing Shelf account. A field **companion**: scan QR/barcodes, run live audits, manage custody, booking check-in/out; syncs with the web workspace.
- **Android native app: in development — NOT released.** Android users use the web app / PWA.
- **Web app / PWA:** the full Shelf platform runs in any modern browser (iOS, Android, macOS, Windows, Linux) and installs as a PWA — no app store needed. The web app is the **complete platform / source of truth**; the iPhone app is an optional companion.
- ❌ **Never say:** "native app coming soon", "join the (beta) waitlist" for the iOS app, "the upcoming native app", "Shelf has no native app / no app-store option." The iOS Companion is live.
- ✅ **Say:** "Shelf Companion for iPhone is on the App Store (free); Android is in development; the web app works in any browser."

## Pricing (verify against `/pricing` + `src/data/pricing.ts`)
- **Free** — single user, unlimited assets, QR scanning, custody. $0.
- **Plus** — $34/mo or $190/yr (≈ $15.83/mo).
- **Team** (most popular) — $67/mo or $370/yr (≈ $30.83/mo). Unlocks **bookings/reservations** and multi-user; add-ons: audits, SSO, external barcode import.
- **Enterprise** — custom.
- ❌ **Never** call bookings/reservations or multi-user "free" — they are paid (Team plan). The free tier is single-user.

## Social proof (verify before quoting)
- "3,000+ teams"; **5.0 on G2**. Marquee customers incl. Chicago Bulls, UC Berkeley, British Airways, Kent State, USS Midway Museum, University of Missouri (`src/data/customer-logos.ts`).

## Comparison-content rules
- Be **honest** in competitor comparisons — don't claim Shelf wins on every axis. Where a competitor is genuinely stronger (e.g. a native Android app, deeper integrations, CMMS depth, enterprise features), say so.
- Lead with the real, uncopyable wedge: **genuinely free + AGPL open-source + self-host + QR-first.**

## Maintenance — the "agentically compiled" part
1. A scheduled IC (GitHub Action and/or Claude routine) re-verifies the volatile facts — App Store listing, GitHub releases/tags, the pricing config, the latest `/content/updates` changelog — refreshes `lastVerified` + this file, and opens an issue if reality has drifted.
2. `scripts/check-product-claims.mjs` runs in CI and on the IC cadence: it greps content for the ❌ phrasings above and fails/flags, so a stale claim can never quietly ship again. (This is what would have caught the mobile-app page.) Update its patterns when the facts here change.
3. Every content workflow (e.g. the `/alternatives` wedge) and its truthfulness-verifier must read this file first.
