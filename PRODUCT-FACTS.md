# Shelf — Product Facts (single source of truth)

> **Purpose:** the canonical, verified facts about Shelf for anyone — human or AI agent — writing or reviewing marketing / KB / AI-discovery content. **Read this before making any product claim.** The content truthfulness-gate and `scripts/check-product-claims.mjs` enforce the highest-risk rules below.
>
> **Why this file exists:** a stale "Native App Coming Soon — join the beta waitlist" claim shipped on the #1-ranking `/knowledge-base/shelf-mobile-app` page *after* the iOS app had launched, because there was no single place that said "the iOS app is live." This is that place.

`lastVerified: 2026-06-10`

## What Shelf is
- Open-source (**AGPL**), **QR-first asset & equipment management** platform (shelf.nu). Public repo: `github.com/Shelf-nu/shelf.nu`.
- For tracking equipment/assets a team **uses** — IT hardware, AV/camera gear, tools, vehicles, lab, education/media. **Not** retail/SKU/stock inventory.

## Mobile / apps
- **Shelf Companion (iPhone): LIVE on the Apple App Store since 2026-05-25** — `https://apps.apple.com/app/id6765639874`. iPhone and **iPad** (a native iPad app since 1.6.0; the App Store lists iPad devices and iPad screenshots; `supportsTablet: true` in apps/companion/app.json), iOS 15.1+, **free**, requires an existing Shelf account. A field **companion**: scan QR/barcodes, run live audits, manage custody, booking check-in/out; syncs with the web workspace.
- **Shelf Companion (Android): LIVE on Google Play since 2026-06-09** — `https://play.google.com/store/apps/details?id=com.shelf.companion`. **Free**, requires an existing Shelf account. Same field companion as the iPhone app (scan QR/barcodes, run live audits, manage custody, booking check-in/out).
- **Web app / PWA:** the full Shelf platform runs in any modern browser (iOS, Android, macOS, Windows, Linux) and installs as a PWA — no app store needed. The web app is the **complete platform / source of truth**; the native apps are optional companions.
- ❌ **Never say:** "native app coming soon", "join the (beta) waitlist", "the upcoming native app", "Android is in development / coming soon", "Shelf has no native app / no app-store option." Both Companion apps (iPhone + Android) are live.
- ✅ **Say:** "Shelf Companion is on the App Store and Google Play — free on iPhone & Android; listing iOS and Android in operatingSystem structured data is now correct; the web app works in any browser."

## Reports (verified 2026-11-08 against shelf.nu main @197f3b4)
- Reports are on the **Plus and Team** plans (`REPORTS_PLAN_TITLE`, apps/webapp/app/modules/reports/plan-copy.ts); Owners and Admins only.
- **CSV export on every report. PDF download on three only: Booking Compliance, Asset Inventory, Custody Snapshot** (`REPORTS_WITH_PDF`, components/reports/report-export-actions.tsx; the generate-pdf route handles only those three). ❌ Never say "chart-based reports export to PDF" or list Top Booked Assets, Monthly Booking Trends, Activity Summary, Utilization or Distribution as PDF reports.
- **Asset Utilization counts booking time only**, not custody. ❌ Never say "based on booking and custody time".
- Asset Inventory, Asset Distribution and Idle Assets count active assets only; Activity Summary, Utilization and Top Booked Assets keep archived assets' history inside the timeframe.

## Pricing (verify against `/pricing` + `src/data/pricing.ts`)
- **Free** — single user, unlimited assets, QR scanning, custody. $0.
- **Plus** — $34/mo or $190/yr (≈ $15.83/mo).
- **Team** (most popular) — $67/mo or $370/yr (≈ $30.83/mo). Unlocks **bookings/reservations** and multi-user; add-ons: audits, SSO, external barcode import.
- **Enterprise** — custom.
- ❌ **Never** call bookings/reservations or multi-user "free" — they are paid (Team plan). The free tier is single-user.

## Tracking methods (verified 2026-07-03 against product origin/main)
- Two tracking types, chosen at creation and **immutable**: **individually tracked** (default, one record per item) and **quantity-tracked** (one record with a count). ❌ Never say or imply items can be converted or merged between the two — no conversion exists.
- **Asset Models** group *individually tracked* units under one template (every unit keeps its own QR/custody/history). Grouping is editable anytime; quantity-tracked pools can NOT join a model. Asset Models and quantity tracking are on **every plan** (role-gated, not plan-gated).
- **Book-by-model** ("reserve 4x of a model, scan any 4 at pickup") is LIVE in production since 2026-06-29 (PR #2337). It rides on bookings, so it is **Team plan**. Keep "Asset Models on every plan" separate from "book by model" (paid).
- **Low-stock alerts** (re-verified 2026-10-28 against product origin/main + app.shelf.nu): set a Min quantity on a quantity-tracked asset. When free stock drops to or below it, every **Owner and Admin** gets an email, and whoever made the change sees an in-app notice. It fires on stock adjustments (web and phone), custody assignments, asset edits and **booking check-in consumption**. It fires once per dip, and a **"back in stock"** email follows when stock recovers. The asset list has a **Needs reordering** filter. ❌ Recipients are set by role (Owner + Admin); never say a user can choose who gets the alert.

## Calendar feed (verified 2026-09-17 against product origin/main + a live feed fetched from app.shelf.nu)
- **Subscribable booking calendar feed: LIVE since 2026-07-09** (shelf.nu PR #2602 merged; production migration applied the same day). Calendar page → **Subscribe** (or Account Settings → Calendars) → **Generate calendar link** gives a secret `https://app.shelf.nu/api/calendar/feed/<token>.ics` URL; the **Add to calendar** button opens it as `webcal://`.
- Works with **Google Calendar, Outlook, Apple Calendar** (any RFC 5545 client). **Team and Enterprise plans.**
- **One-way, read-only.** Includes reserved / ongoing / overdue / complete bookings from ~1 month back to 1 year ahead (drafts, cancelled, archived excluded). Each event: booking name + asset count, custodian (omitted if the member can't see custody), asset list, link to the booking, and a **reminder 1 day before the booking ends** ("Equipment due back tomorrow").
- Scope mirrors the member's in-app visibility: admins who see all bookings get the whole workspace (a shared team calendar); self-service/base get their own bookings.
- Calendar apps refresh subscribed calendars on their own schedule; the feed itself is cached for 5 minutes.
- ❌ **Never say:** "two-way calendar sync", "edit bookings from Outlook/Google", "real-time / instant sync", or that two-way sync is on the roadmap. None is built or committed.

## Asset reminders (verified 2026-10-27 against product origin/main + a live test on app.shelf.nu)
- One-time reminders on **every plan**. **Repeating reminders** (daily, weekly, every 2 weeks, monthly, every 3 months, every 6 months, yearly, optional end date) on **Plus, Team and Enterprise only** (shelf.nu PR #2685, live 2026-10-27). Free = Repeat locked to "Never".
- Each repeat email names the next date; each occurrence writes a note on the asset. Archived asset = series shows **Paused** and sends nothing until reinstated.
- Reminders are **not** driven by date custom fields (still set by hand). No work orders.
- ❌ **Never say:** "reminders do not repeat", "set the next reminder after each service" as the only option, or that repeating reminders are free.

## Booking PDF templates (verified 2026-11-10 against shelf.nu main @a914d27, shelf.nu#3354 and #3371)
- The saved booking PDF layouts are **PDF templates** (model `PdfTemplate`; until 2026-11-09 "PDF documents"). **Every team workspace** has them, whatever its plan (`canUsePdfTemplates` reads only the workspace type: `apps/webapp/app/modules/pdf-template/access.ts`); the old plan gate `canCustomizePdfDocuments` is gone. A **personal workspace** has no templates and no card: it prints the built-in **Checklist** and the print dialog has no **Template** dropdown.
- Managed by Owners and Administrators under **Settings → Bookings**, card **PDF templates** (`requirePermission` on `workingHours: update`, `settings.bookings.tsx`). Strings: **New template name**, **Add template**, **Edit template**, **Save template**, **Duplicate**, **Make default**, **Delete**, badge **Default template**. New team workspaces start with **Checklist** (default) and **Check-out receipt**.
- Inactive custom fields are not offered and never print; one already on a template stays, marked *inactive*.
- ❌ **Never say:** "PDF documents", "Settings → General → PDF documents", "on paid plans a workspace keeps named PDF documents", or that a plan "does not include" the layouts. `scripts/check-product-claims.mjs` guards the old card name, settings path, button labels and plan gate (`PDF_TEMPLATE_RULES`, added in the pipeline PR of 2026-11-10).

## Booking delete and Discard draft (verified 2026-11-10 against shelf.nu main @a914d27, shelf.nu#3365)
- **Base and Self-service hold no `booking:delete`** on any path (web, mobile, bulk): `packages/permissions/src/matrix.ts`. Both hold `booking:archive` (Base gained it 2026-11-10), scoped to bookings they hold or created.
- **Discard draft** archives a DRAFT and nothing else (`archiveBooking({ discardDraft: true })`); it is offered on a draft to anyone who can archive but not delete, today Base and Self-service, in the booking page **Actions** menu and the bookings list row menu, with no confirmation on the web. It writes the status note *discarded the draft* and sets `archivedWithoutCheckin`. Owners, Administrators and Managers keep **Delete** on drafts and never see Discard draft.
- Companion: `canDiscardDraft` in the booking payload; the **Discard draft** action ships with the 1.8.0 store build (stores are on 1.7.0, checked 2026-11-10). Older builds hide Delete for Base and Self-service because the server computes `canDelete`.
- **Usage reports** (Top Booked Assets, Top Booked Kits, Monthly Booking Trends, Asset Utilization) share `REAL_BOOKING_WHERE` (`modules/reports/helpers.server.ts`): no drafts, no cancellations, and no booking archived before any check-out (`archivedWithoutCheckin: false`), discarded drafts included.
- ❌ **Never say:** "Self-service and Base users can delete their own booking while it is a Draft". A `check-product-claims` rule for this phrase (and for "with CSV/PDF export" on report rows) is queued in the pipeline state file until the three open PRs that correct the phrase have merged; see follow-up `claims-rules-after-pipeline-prs-merge`.

## Audits: unit counts and photo provenance (verified 2026-11-10 against shelf.nu main @a914d27, shelf.nu#3337 and #3136; both migrations ran on production 2026-11-09)
- Scanning a **quantity-tracked asset** on the web audit scan page asks **How many did you find?** (field **Units found**, button **All here (N)**, **Discard scan**; recount via a second scan or **Edit count**, dialog **Update count**). Labels from `auditCountLabel` in `@shelf/labels`: **8 of 14 pcs**, **16 of 14 pcs (+2)**, **0 of 14 pcs**, **14 pcs expected**, **3 pcs counted** (unexpected pool), **Not counted** (scan from a build that sent no count). Expected units = the units in the audit's scope (location placement, kit, custody), whole pool when unscoped. Overview, Complete Audit dialog and receipt add a **Units counted** line; the receipt adds a **Quantity** column. The Expected/Found/Not scanned/Unexpected tiles count assets, not units.
- Every audit photo stores `captureSource` (**Shelf app camera**, **Photo library**, **Web upload**, **Phone app**) and `capturedAt` (EXIF `DateTimeOriginal`). Flags from `describeAuditPhoto`: **Old photo** = taken more than 24 h before upload; **No date** = no capture time. Photos uploaded before the release show their upload time and are never flagged. Shown on the audit overview, scan details, Findings, preview and the receipt (which prints a key line).
- **Companion:** the count prompt and the camera/library source ship with the 1.8.0 store build; the current 1.7.0 app records a pool scan without a count (**Not counted**) and its photos are stored as **Phone app**. ❌ Never present either as live on the phone until `companionStoreStatus` shows 1.8.0 in both stores.

## Hosting, data location and sub-processors (verified 2026-09-18 against product origin/main + live production)
- **Data:** Supabase (database, sign-in accounts, file storage) in AWS **eu-central-1, Frankfurt, Germany**.
- **Application servers:** Fly.io in **Amsterdam, the Netherlands**. Fly.io is compute only; it holds no customer data at rest. Cloudflare sits in front of app.shelf.nu.
- **Email:** Resend, sending through **Amazon SES in the United States** (sign-in codes, invitations, notifications).
- **Full sub-processor list:** Supabase, Fly.io, Cloudflare, Resend (Amazon SES), Stripe, Sentry (US), Microsoft Clarity, Crisp, PostHog, MapTiler, OpenStreetMap Nominatim. Canonical wording lives on `/knowledge-base/data-flow-chart` and `/privacy`.
- **Workspace isolation is in application code**: every query is scoped to the workspace, and a lint rule flags any query that is not. RLS is enabled with **zero policies**.
- ❌ **Never say:** "Row Level Security" / "RLS policies", "Frankfurt (Fly.io EU region)", "Fly.io Frankfurt", or "customer data does not leave the EU" (email delivery and error monitoring run in the US). `scripts/check-product-claims.mjs` enforces the first two.
- ✅ **Say:** "Data stored in the EU (Frankfurt), application servers in Amsterdam." "SOC 2 Type 2 certified infrastructure" is accurate (Supabase is SOC 2 Type 2); keep it.

## Social proof (verify before quoting)
- "3,000+ teams"; **5.0 on G2**. Marquee customers incl. Chicago Bulls, UC Berkeley, British Airways, Kent State, USS Midway Museum, University of Missouri (`src/data/customer-logos.ts`).

## Comparison-content rules
- Be **honest** in competitor comparisons — don't claim Shelf wins on every axis. Where a competitor is genuinely stronger (e.g. deeper integrations, CMMS depth, enterprise features), say so.
- Lead with the real, uncopyable wedge: **genuinely free + AGPL open-source + self-host + QR-first.**

## Maintenance — the "agentically compiled" part
1. A scheduled IC (GitHub Action and/or Claude routine) re-verifies the volatile facts — App Store listing, GitHub releases/tags, the pricing config, the latest `/content/updates` changelog — refreshes `lastVerified` + this file, and opens an issue if reality has drifted.
2. `scripts/check-product-claims.mjs` runs in CI and on the IC cadence: it greps content for the ❌ phrasings above and fails/flags, so a stale claim can never quietly ship again. (This is what would have caught the mobile-app page.) Update its patterns when the facts here change.
3. Every content workflow (e.g. the `/alternatives` wedge) and its truthfulness-verifier must read this file first.
