## Part 3: Content Pages → Code Concepts

Every content page on the website, mapped back to the code concepts it references.

---

### 3a: Feature Pages (content/features/) → Code

| # | Feature Page | Website Title | Primary Code Concept(s) | Route(s) | Models | Notes |
|---|-------------|--------------|------------------------|----------|--------|----- -|
| 1 | `asset-pages.mdx` | Asset Pages | Asset detail view | `assets.$assetId.overview.tsx` | `Asset`, `Note`, `CustomField`, `Qr`, `Custody` | Describes: photos, custom fields, custody history, location history, QR label, notes |
| 2 | `asset-reminders.mdx` | Asset Reminders | Reminder scheduling | `reminders._index.tsx`, `assets.$assetId.reminders.tsx` | `AssetReminder`, `TeamMember` | Describes: time-based alerts, email notifications, maintenance scheduling |
| 3 | `asset-search.mdx` | Asset Search | Asset index search | `assets._index.tsx` | `Asset`, `AssetCustomFieldValue` | Describes: multi-field search, custom field search, instant results |
| 4 | `audits.mdx` | Audits | Audit workflow | `audits._index.tsx`, `audits.$auditId.scan.tsx` | `AuditSession`, `AuditAsset`, `AuditScan`, `AuditAssignment`, `AuditImage`, `AuditNote` | Paid add-on. Describes: scan workflows, found/missing/unexpected, PDF/CSV export, 7-day trial |
| 5 | `bookings.mdx` | Bookings | Booking system | `bookings._index.tsx`, `bookings.new.tsx` | `Booking`, `BookingSettings`, `PartialBookingCheckin`, `BookingNote` | Describes: conflict-free scheduling, kit-aware bookings, pull-list PDFs, working hours |
| 6 | `calendar.mdx` | Calendar | Calendar view | `calendar.tsx` | `Booking` | Describes: month/week/day views, color-coded status, overdue highlighting |
| 7 | `custody.mdx` | Custody | Custody tracking | `assets.$assetId.overview.assign-custody.tsx`, `assets.$assetId.overview.release-custody.tsx` | `Custody`, `KitCustody`, `TeamMember` | Describes: accountability trail, QR transfers, automatic assignment from bookings |
| 8 | `dashboard.mdx` | Dashboard | Home/Dashboard | `home.tsx` (dashboard.tsx redirects here) | `Booking`, `Custody`, `Asset` | Describes: real-time overview, bookings summary, overdue items. **Note**: Code route is `/home`, not `/dashboard` |
| 9 | `kits.mdx` | Kits | Kit management | `kits._index.tsx`, `kits.$kitId.overview.tsx` | `Kit`, `KitCustody`, `Asset` | Describes: parent-child items, kit-aware bookings, custody sync |
| 10 | `location-tracking.mdx` | Location Tracking | Location management | `locations._index.tsx`, `locations.$locationId.overview.tsx` | `Location` (self-referencing hierarchy) | Describes: hierarchical locations, GPS, QR-based updates |
| 11 | `workspaces.mdx` | Workspaces | Organization management | `account-details.workspace.tsx`, `settings.general.tsx` | `Organization`, `UserOrganization`, `OrganizationRoles` | Describes: separate inventories, role controls, admin oversight |

---

### 3b: Knowledge Base Articles (content/knowledge-base/) → Code

All 63 KB articles, grouped by category, mapped to the code area they document.

#### Getting Started (9 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `getting-started.mdx` | Getting Started with Shelf | Onboarding (`_welcome+/`) | |
| 2 | `how-to-log-in-to-the-shelf-application.mdx` | How to Log in to the Shelf Application | Auth (`_auth+/`) | |
| 3 | `how-to-reset-your-password-in-shelf.mdx` | How to Reset Your Password in Shelf | Auth | |
| 4 | `how-to-change-your-email-address.mdx` | How to Change Your Email Address | `account-details.general.tsx` | |
| 5 | `how-to-get-in-touch-with-support.mdx` | How to Get in Touch with Support | `api+/feedback.ts` | |
| 6 | `share-your-feedback-or-request-new-features-on-our-github.mdx` | Share Your Feedback or Request New Features | External (GitHub) | |
| 7 | `add-the-shelf-app-to-your-dock-taskbar-or-homescreen.mdx` | Add the Shelf App to your Dock, Taskbar, or Homescreen | PWA install | |
| 8 | `shelf-mobile-app.mdx` | Shelf Mobile App | PWA / mobile | |
| 9 | `data-flow-chart.mdx` | Data Flow Chart | Architecture overview | |

#### Assets (20 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `adding-new-assets.mdx` | Adding New Assets | `assets.new.tsx`, Asset form component | |
| 2 | `how-to-add-assets-to-your-inventory.mdx` | How to Add Assets to Your Inventory | `assets.new.tsx` | Overlaps with adding-new-assets |
| 3 | `duplicating-assets-in-shelf.mdx` | Duplicating Assets in Shelf | `assets.$assetId.overview.duplicate.tsx` | |
| 4 | `advanced-asset-index-complete-guide.mdx` | Advanced Asset Index: Complete Guide | `AssetIndexSettings` model, `api+/asset-index-settings.ts` | |
| 5 | `how-to-enable-advanced-index.mdx` | How to Enable Advanced Index | `AssetIndexSettings.mode` (SIMPLE→ADVANCED) | |
| 6 | `importing-assets-to-shelf-csv-guide.mdx` | Importing Assets to Shelf: CSV Guide | `assets.import.tsx` | |
| 7 | `how-to-filter-export-and-report-on-your-asset-inventory.mdx` | How to Filter, Export and Report | `assets.export.$fileName[.csv].tsx` | |
| 8 | `alternative-barcodes.mdx` | Alternative Barcodes | `Barcode` model, `barcodesEnabled` flag | Updated 2026-03-25 |
| 9 | `asset-reminders.mdx` | Asset Reminders | `AssetReminder` model, `reminders._index.tsx` | |
| 10 | `batch-scanning-actions.mdx` | Batch Scanning Actions | `scanner.tsx`, `api+/asset.scan.ts` | |
| 11 | `scanning-an-asset.mdx` | Scanning an Asset | `scanner.tsx`, `Scan` model | Updated 2026-03-19 |
| 12 | `change-asset-label-information.mdx` | Change Asset Label Information (QR ID or Sequential ID) | `QrIdDisplayPreference` enum | |
| 13 | `sequential-asset-ids-simplifying-asset-identification.mdx` | Sequential Asset IDs | `Asset.sequentialId`, `api+/generate-sequential-ids.tsx` | |
| 14 | `how-to-print-custom-branded-qr-code-labels-with-shelf.mdx` | How to Print Custom Branded QR Code Labels | `Qr` model, `Organization.showShelfBranding` | |
| 15 | `understanding-qr-code-swapping-and-management-in-shelf.mdx` | QR Code Swapping and Management | `Qr` model | |
| 16 | `what-to-do-after-purchasing-assets-tags.mdx` | What to Do After Purchasing Asset Tags | `Qr` / `PrintBatch` | |
| 17 | `understanding-sorting-in-shelf.mdx` | Understanding Sorting in Shelf | Asset index sorting | |
| 18 | `understanding-and-using-pdf-agreements-for-asset-custody-in-shelf.mdx` | PDF Agreements for Asset Custody | `api+/bookings.$bookingId.generate-pdf.tsx` | |
| 19 | `sublocations-organize-locations-into-hierarchies.mdx` | Sublocations: Organize Locations into Hierarchies | `Location.parentId` self-relation | |
| 20 | `using-batch-actions-in-shelf.mdx` | Using Batch Actions in Shelf | `api+/assets.bulk-*.ts` routes | |

#### Bookings & Custody (14 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `introduction-to-bookings.mdx` | Introduction to Bookings | `Booking` model, `bookings._index.tsx` | |
| 2 | `how-to-create-a-booking.mdx` | How to Create a Booking | `bookings.new.tsx` | |
| 3 | `adding-assets-and-kits-to-a-booking.mdx` | Adding Assets and Kits to a Booking | `bookings.$bookingId.overview.manage-assets.tsx`, `manage-kits.tsx` | |
| 4 | `activity-logs-for-bookings.mdx` | Activity Logs for Bookings | `BookingNote` model, `bookings.$bookingId.activity.tsx` | |
| 5 | `early-check-in-and-check-out-of-bookings.mdx` | Early Check-in and Check-out | `Booking.originalFrom`, `Booking.originalTo` | |
| 6 | `extending-booking-end-dates-in-shelf.mdx` | Extending Booking End Dates | `extend` permission action | |
| 7 | `partial-check-ins-efficiently-handle-incomplete-returns.mdx` | Partial Check-ins | `PartialBookingCheckin` model | |
| 8 | `bookings-how-to-export-booking-information-and-assets-checked-out.mdx` | Export Booking Information | `bookings.export.$fileName[.csv].tsx` | |
| 9 | `how-to-generate-a-pdf-overview-of-your-reserved-assets-bookings.mdx` | Generate a PDF Overview (Bookings) | `api+/bookings.$bookingId.generate-pdf.tsx` | |
| 10 | `use-case-scenarios-explaining-our-bookings-feature.mdx` | Use Case Scenarios: Bookings | `Booking` model | |
| 11 | `availability-view-complete-guide.mdx` | Availability View: Complete Guide | `calendar.tsx` | |
| 12 | `custody-feature-for-long-term-equipment-lend-outs.mdx` | Custody Feature for Long-Term Lend-Outs | `Custody` model | |
| 13 | `configure-what-self-service-and-base-users-can-see.mdx` | Configure What Self Service and Base Users Can See | `Organization.selfServiceCanSeeCustody`, `selfServiceCanSeeBookings`, `baseUserCanSeeCustody`, `baseUserCanSeeBookings` | |
| 14 | `working-hours-set-operating-schedules-for-your-workspace.mdx` | Working Hours | `WorkingHours` model, `WorkingHoursOverride` | |

#### Custom Fields (4 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `adding-additional-fields-to-assets.mdx` | Adding Additional Fields to Assets | `CustomField` model, `settings.custom-fields.new.tsx` | |
| 2 | `custom-field-types-in-shelf.mdx` | Mastering Custom Fields in Shelf | `CustomFieldType` enum (TEXT, OPTION, BOOLEAN, DATE, MULTILINE_TEXT, AMOUNT, NUMBER) | Title differs from filename |
| 3 | `linking-custom-fields-to-categories.mdx` | Linking Custom Fields to Categories | `CustomField.categories` relation | |
| 4 | `understanding-and-using-custom-property-ids-in-shelf.mdx` | Custom Property IDs | `CustomField.id` | Uses "Custom Property" — code says "Custom Field" |

#### Team (6 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `onboarding-your-team-members.mdx` | Onboarding Your Team Members | `settings.team.users.tsx`, `Invite` model | |
| 2 | `changing-user-roles-in-shelf.mdx` | Changing User Roles in Shelf | `OrganizationRoles` enum, `changeRole` permission | |
| 3 | `user-roles-and-their-permissions.mdx` | User Types / Roles and Their Permissions | `OrganizationRoles`, permission.data.ts | Updated 2026-03-25 |
| 4 | `converting-non-registered-members-nrms-to-users.mdx` | Converting NRMs to Users | `TeamMember` (userId null→linked), `Invite` | |
| 5 | `inviting-users-via-csv-upload.mdx` | Inviting Users via CSV Upload | `api+/settings.import-users.ts` | |
| 6 | `admin-notes-on-team-members.mdx` | Admin Notes on Team Members | `TeamMemberNote` model | New 2026-03-25 |

#### Workspaces (5 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `introduction-to-workspaces.mdx` | Introduction to Workspaces | `Organization` model | |
| 2 | `how-to-create-additional-workspaces.mdx` | How to Create Additional Workspaces | `account-details.workspace.new.tsx`, `TierLimit.maxOrganizations` | |
| 3 | `how-to-upgrade-to-team.mdx` | How to Upgrade to Team | `account-details.subscription.tsx`, Stripe checkout | |
| 4 | `export-exporting-workspace-data-from-shelf.mdx` | Exporting Workspace Data | `assets.export.$fileName[.csv].tsx` | |
| 5 | `free-trial.mdx` | Team Plan Trial | `User.usedFreeTrial`, Stripe trial logic | Title is "Team Plan Trial" but filename is `free-trial.mdx` |

#### Categories & Tags (2 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `using-categories-to-organize-your-asset-inventory.mdx` | Using Categories to Organize Your Asset Inventory | `Category` model, `categories.tsx` | |
| 2 | `what-is-a-tag-in-shelf-and-what-can-they-be-used-for.mdx` | What is a Tag in Shelf? | `Tag` model, `tags.tsx` | |

#### Kits (1 article)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `kits.mdx` | Kits | `Kit` model, `kits._index.tsx` | |

#### Other (2 articles)

| # | KB Article | Title | Code Area | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `using-external-barcode-scanners-with-shelf.mdx` | Using External Barcode Scanners | `scanner.tsx`, `api+/get-scanned-barcode.$value.ts` | |
| 2 | `sso-with-google-workspace.mdx` | SSO with Google Workspace | `SsoDetails` model, `Organization.enabledSso` | New 2026-03-24 |

---

### 3c: Solution Pages (content/solutions/) → Code

| # | Solution Page | Website Title | Primary Code Features Referenced | Notes |
|---|-------------|--------------|--------------------------------|-------|
| 1 | `asset-tracking.mdx` | Asset Tracking | Assets, QR codes, Locations, Custody, Categories, Tags | Generic/umbrella solution page |
| 2 | `tool-tracking.mdx` | Tool Tracking | Assets, Kits, Custody, Locations | Industry: construction/trades |
| 3 | `it-asset-management.mdx` | IT Asset Tracking | Assets, Custom Fields, Locations, Categories | Industry: IT |
| 4 | `fixed-asset-tracking.mdx` | Fixed Asset Tracking | Assets, `Asset.valuation`, Locations | Mentions depreciation — website has MACRS calculator (`macrs-tables.ts`) but app has no depreciation feature |
| 5 | `equipment-reservations.mdx` | Equipment Reservations | Bookings, Calendar, Working Hours | Uses "Reservations" — code says "Bookings" |
| 6 | `educational-resource-management.mdx` | Educational Resource Management | Bookings, Kits, Workspaces, Custody | Industry: education |
| 7 | `camera-equipment-check-out.mdx` | Camera Equipment Check-Out | Bookings, Kits, Custody, Scanner | Industry: video/AV |
| 8 | `equipment-check-in.mdx` | Equipment Checkout Software | Bookings, Custody, Scanner, Partial Check-ins | Title says "Checkout" — broader than just check-in |
| 9 | `equipment-management.mdx` | Equipment Management | Assets, Bookings, Reminders, Locations | Generic solution |
| 10 | `mobile-asset-auditing.mdx` | Mobile Asset Auditing | Audits (add-on), Scanner | |
| 11 | `home-inventory-management.mdx` | Home Inventory Management | Assets, QR codes, Locations | Personal/free tier focused |
| 12 | `open-source-asset-management.mdx` | Open Source Asset Management | Self-hosting, AGPL license | Mentions self-hosted deployment |
| 13 | `multi-location-asset-tracking.mdx` | Multi-Location Asset Tracking | Locations (hierarchy), Workspaces | |
| 14 | `maintenance-tracking.mdx` | Maintenance Tracking | Asset Reminders, Custom Fields, Bookings | Website calls it "Maintenance Tracking" — code has no dedicated maintenance model; it's built on Reminders + Custom Fields |

---

### 3d: Alternative/Competitor Pages (content/alternatives/) → Code

22 competitor comparison pages. Each references Shelf advantages from `competitor-advantages.ts`.

| # | Alternative Page | Competitor | Shelf Advantages Claimed | Notes |
|---|-----------------|-----------|------------------------|-------|
| 1 | `asset-guru.mdx` | AssetGuru | transparent-pricing, faster-setup, open-source | |
| 2 | `asset-infinity.mdx` | Asset Infinity | transparent-pricing, modern-ux, open-source | |
| 3 | `asset-panda.mdx` | Asset Panda | lower-cost, unlimited-users, faster-setup | |
| 4 | `asset-tiger.mdx` | AssetTiger | bookings, kit-tracking, open-source | |
| 5 | `blue-tally.mdx` | BlueTally | open-source, kit-tracking, bookings | |
| 6 | `brite-check.mdx` | BriteCheck | bookings, kit-tracking, open-source | |
| 7 | `cheqroom.mdx` | Cheqroom | transparent-pricing, unlimited-users, open-source | |
| 8 | `ezofficeinventory.mdx` | EZOfficeInventory | flat-pricing, unlimited-users, open-source | |
| 9 | `gocodes.mdx` | GoCodes | flat-pricing, bookings, kit-tracking | |
| 10 | `hardcat.mdx` | Hardcat | faster-setup, modern-ux, transparent-pricing | |
| 11 | `hector.mdx` | Hector | flat-pricing, open-source, modern-ux | |
| 12 | `itemit.mdx` | itemit | lower-cost, no-hardware, open-source | |
| 13 | `limble.mdx` | Limble | lower-cost, faster-setup, open-source | |
| 14 | `reftab.mdx` | Reftab | bookings, open-source, flat-pricing | |
| 15 | `share-my-toolbox.mdx` | ShareMyToolbox | lower-cost, open-source, kit-tracking | |
| 16 | `snipe-it.mdx` | Snipe-IT | modern-ux, bookings, kit-tracking | |
| 17 | `sortly.mdx` | Sortly | bookings, unlimited-users, open-source | |
| 18 | `spreadsheets.mdx` | Spreadsheets | qr-first, bookings, unlimited-users | |
| 19 | `timly.mdx` | Timly | lower-cost, no-hardware, open-source | |
| 20 | `upkeep.mdx` | UpKeep | lower-cost, faster-setup, open-source | |
| 21 | `wasp.mdx` | Wasp | modern-ux, faster-setup, open-source | |
| 22 | `webcheckout.mdx` | WebCheckout | modern-ux, qr-first, open-source | |

**Advantage types used across all pages** (from `competitor-advantages.ts`):
- `lower-cost` — Shelf is cheaper
- `transparent-pricing` — Public pricing, no sales call required
- `flat-pricing` — No per-user or per-asset fees
- `modern-ux` — Modern, intuitive interface
- `open-source` — AGPL-licensed, self-hostable
- `bookings` — Built-in booking/reservation system
- `kit-tracking` — Kit management feature
- `unlimited-users` — Unlimited team members on Team plan
- `faster-setup` — Quick onboarding, no implementation project
- `qr-first` — QR-code-native workflows
- `no-hardware` — No proprietary hardware required

---

### 3e: Use Case Pages (content/use-cases/) → Code

| # | Use Case Page | Title | Primary Code Features | Notes |
|---|-------------|-------|----------------------|-------|
| 1 | `av-equipment-management.mdx` | AV Equipment Management | Kits, Bookings, Custody, Scanner | Industry: AV/media |
| 2 | `it-asset-management.mdx` | IT Asset Management | Assets, Custom Fields, Categories, Locations | Industry: IT |
| 3 | `tool-tracking.mdx` | Tool Tracking | Assets, Custody, Kits, Locations | Industry: construction |

---

### 3f: Pricing Data Files (src/data/) → Code

| # | Data File | Purpose | Code Mapping | Notes |
|---|----------|---------|-------------|-------|
| 1 | `pricing.ts` | Main pricing plans (4 plans with features) | `TierId` enum, `TierLimit` model | Maps: free→Personal, tier_1→Plus, tier_2→Team, custom→Enterprise |
| 2 | `pricing.tiers.ts` | Simplified tier reference | `TierId` enum | Same 4 plans |
| 3 | `pricing.features.ts` | Full feature comparison (30 features) | `TierLimit` fields, `OrganizationType`, permission system | Has both `availability` (marketing names) and `internalAvailability` (code tier IDs) |
| 4 | `pricing-faq.ts` | 10 FAQ items | Various | |
| 5 | `pricing-audit.txt` | Internal audit notes on pricing data | — | Flags ambiguities in original data |
| 6 | `features.ts` | Feature icon mappings (11 features) | Feature page slugs | |
| 7 | `solutions.ts` | Solution page listings (14 solutions) | Solution page slugs | |
| 8 | `competitor-advantages.ts` | Competitor advantage mappings (22 competitors) | — | 11 advantage types |
| 9 | `customer-logos.ts` | Customer logos (55 logos) | — | Marketing social proof |
| 10 | `macrs-tables.ts` | MACRS depreciation tables | — | Website tool; app has no depreciation feature |
| 11 | `salvage-benchmarks.ts` | Salvage value benchmarks (8 categories) | — | Website tool; app has no depreciation feature |

---

### 3g: Content Directories Not Yet Mapped (for Phase 2)

These directories exist but will be read in detail during Phase 2:

| Directory | File Count | Purpose |
|-----------|-----------|--------|
| `content/blog/` | (many) | Blog posts — feature announcements, thought leadership |
| `content/updates/` | (unknown) | Changelog/release notes |
| `content/case-studies/` | (unknown) | Customer stories |
| `content/concepts/` | (unknown) | Conceptual/educational content |
| `content/glossary/` | (unknown) | Asset management glossary terms |
| `content/pages/` | (unknown) | Static pages (about, contact, etc.) |
| `content/industries/` | (unknown) | Industry-specific landing pages |
