## 5. Kit Management

### 5.1 Create Kit
- **Route**: `kits.new.tsx` → `/kits/new`
- **Permission**: `kit.create`
- **Form fields**:
  - Name (required, min 2 chars)
  - Description (textarea, max 1000 chars, optional)
  - Category (dropdown with inline creation)
  - Location (dropdown with inline creation, with thumbnails)
  - Image (PNG/JPG/JPEG/WebP, max 8 MB)
  - Barcodes (conditional on barcode add-on)

### 5.2 Kit List
- **Route**: `kits._index.tsx` → `/kits`
- **Permission**: `kit.read`
- **Columns**: Image+Name+Status badge, Category, Location, Description, Assets count, Custodian, Actions
- **Filters**: Status (AVAILABLE, IN_CUSTODY), Custodian
- **Views**: Table and Availability (calendar view)
- **Bulk actions**: Available (hidden for BASE role)

### 5.3 Kit Detail
- **Route**: `kits.$kitId.overview.tsx` → `/kits/:id/overview`
- **Sub-tabs**: Overview, Assets, Bookings
- **Overview displays**: ID, Shelf QR ID, Created date, Description, Category, Location with hierarchy, Total value (sum of all assets), Barcodes
- **Assets tab**: Paginated list with Scan and Add Assets buttons
- **Actions from kit**: Assign/Release custody, Update location, Add to booking, Create booking, Manage assets, Scan assets

### 5.4 Edit Kit
- **Route**: `kits.$kitId_.edit.tsx`
- **Permission**: `kit.update`
- Same form as create, pre-populated
- If location changed, cascades to all assets in the kit

---

## 6. Location Management

### 6.1 Create Location
- **Route**: `locations.new.tsx` → `/locations/new`
- **Permission**: `location.create`
- **Form fields**:
  - Name (required, min 2 chars)
  - Parent location (optional, for hierarchy)
  - Main image (PNG/JPG/JPEG/WebP, max 4 MB)
  - Address (text, sets geo position)
  - Description (optional)
- **"Add another" button**: saves and reloads for rapid entry
- **Inline creation**: Can be created from within asset/kit forms

### 6.2 Location List
- **Route**: `locations._index.tsx` → `/locations`
- **Permission**: `location.read`
- **Columns**: Image+Name+Address, Description, Parent location, Child locations count, Assets count, Kits count, Actions

### 6.3 Location Detail
- **Route**: `locations.$locationId.overview.tsx`
- **Sub-tabs**: Overview, Assets, Kits, Activity
- **Overview displays**: ID, Created date, Address, Description, Total value (sum of all assets at location)
- **Assets tab**: Add/remove assets, scan assets, filter by custodian
- **Kits tab**: Manage kits at location
- **Notes**: Location notes supported (`LocationNote` model)

### 6.4 Location Hierarchy
- Self-referencing `parentId` relation on `Location` model
- Supports unlimited nesting depth
- UI shows breadcrumb-style hierarchy badges
- **KB article**: `sublocations-organize-locations-into-hierarchies.mdx`

### 6.5 GPS Coordinates
- `Location.latitude` and `Location.longitude` fields
- Set via address input
- Also captured via QR code scans (`Scan.latitude`, `Scan.longitude`)

---

## 7. Categories

### 7.1 Create Category
- **Route**: `categories.new.tsx`
- **Permission**: `category.create`
- **Fields**: Name (min 3 chars), Description, Color (hex picker)
- Can be created inline from asset/kit forms

### 7.2 Category List
- **Route**: `categories.tsx` → `/categories`
- **Permission**: `category.read`
- **Columns**: Name (colored badge), Description, Assets count, Actions
- **Delete action**: `category.delete` permission
- **Bulk actions**: Available for admin roles

### 7.3 Category-Custom Field Linking
- Custom fields can be linked to specific categories
- When a category is selected on an asset, only linked custom fields show
- **KB article**: `linking-custom-fields-to-categories.mdx`

---

## 8. Tags

### 8.1 Create Tag
- **Route**: `tags.new.tsx`
- **Permission**: `tag.create`
- **Fields**: Name (min 3 chars), Description, Color (hex, optional), Use For (multi-select: ASSET, BOOKING, or both)
- `TagUseFor` enum controls which entities a tag can be applied to

### 8.2 Tag List
- **Route**: `tags.tsx` → `/tags`
- **Permission**: `tag.read`
- **Columns**: Name (colored badge), Description, Use For chips, Actions
- **Filter**: `TagUseForFilter` component
- **Delete**: Requires `tag.delete`, uses DELETE HTTP method

---

## 9. Reminders

### 9.1 Reminders List
- **Route**: `reminders._index.tsx` → `/reminders`
- **Permission**: `assetReminders.read`
- **Search**: Reminder name, message, asset name, team member name (comma-separated OR)
- **Creation**: Via asset detail page → Actions → Set Reminder (not from reminders list)

### 9.2 Reminder Fields
- Name (required)
- Message (required)
- Alert Date/Time (must be future, timezone-aware)
- Team Members (at least 1, who gets notified via email)

### 9.3 Reminder Actions
- **Edit**: `assetReminders.update` permission
- **Delete**: `assetReminders.update` permission
- Both actions available from global reminders page and per-asset reminders tab

---

## 10. Audits (Add-on)

### 10.1 Overview
- **Paid add-on** with 7-day free trial
- **Flag**: `Organization.auditsEnabled`
- **Trial tracking**: `Organization.usedAuditTrial`

### 10.2 Audit Workflow
- **Routes**: `audits._index.tsx`, `audits.$auditId.overview.tsx`, `audits.$auditId.scan.tsx`
- **Models**: `AuditSession`, `AuditAssignment`, `AuditAsset`, `AuditScan`, `AuditImage`, `AuditNote`

### 10.3 Audit Statuses
- `PENDING` → `ACTIVE` (on start) → `COMPLETED` or `CANCELLED`

### 10.4 Audit Asset Statuses
- `PENDING` — not yet scanned
- `FOUND` — scanned and present
- `MISSING` — expected but not found
- `UNEXPECTED` — found but not expected in scope

### 10.5 Audit Assignments
- Roles: `LEAD` or `PARTICIPANT`
- Multiple users can be assigned to one audit

### 10.6 Audit Features
- Dedicated scan page with QR/barcode scanning
- Notes and photos per audit and per audit asset
- PDF and CSV export (`api+/audits.$auditId.generate-pdf.tsx`)
- Activity timeline with CSV export
- Asset location shown in scan list (mobile)
- Scope by assets (selected from bulk actions)

---

## 11. Settings

### 11.1 General Settings
- **Route**: `settings.general.tsx` → `/settings/general`
- Workspace name, currency

### 11.2 Booking Settings
- **Route**: `settings.bookings.tsx` → `/settings/bookings`
- **Hidden for personal workspaces**
- **Settings**:
  - Explicit check-in requirement (per-role: Admin, Self-Service) — **Owner-only setting**
  - Tags required on bookings (boolean)
  - Auto-archive toggle + days after completion (default 2)
  - Buffer start time (hours, 0=none; ADMIN/OWNER bypass)
  - Max booking length (hours, null=unlimited; ADMIN/OWNER bypass)
  - Max booking length skip closed days (boolean)
  - Working hours enable/disable
  - Weekly schedule (per-day open/close times in HH:mm UTC)
  - Schedule overrides (date-specific closures/openings with reason)

### 11.3 Email Settings
- **Route**: `settings.emails.tsx` → `/settings/emails`
- **Hidden for personal workspaces**
- Custom email footer (max 500 chars, `Organization.customEmailFooter`)

### 11.4 Custom Fields Settings
- **Route**: `settings.custom-fields.index.tsx` → `/settings/custom-fields`
- Create, edit, delete custom fields
- **Types**: TEXT, OPTION, BOOLEAN, DATE, MULTILINE_TEXT, AMOUNT, NUMBER
- Fields can be: required, active/inactive, linked to categories
- **Limits**: Free plan: 3 fields. Plus/Team/Enterprise: unlimited

### 11.5 Team Settings
- **Route**: `settings.team.*`
- **Sub-tabs**: Users, Pending invites, Non-registered members (NRM)
- **Users**: View user details (assets, bookings, notes tabs), change roles
- **Invites**: View/manage pending invitations
- **NRM**: Add, edit, import (CSV), bulk actions
- **User detail sub-tabs**: Assets, Bookings, Notes (new Mar 2026)

---

## 12. Account Details

### 12.1 General
- **Route**: `account-details.general.tsx`
- User profile info (name, email, photo)

### 12.2 Subscription
- **Route**: `account-details.subscription.tsx`
- Plan management, Stripe Customer Portal redirect
- Only shown when `premiumIsEnabled`

### 12.3 Workspaces
- **Route**: `account-details.workspace.tsx`
- List, create, edit workspaces
- **Limits**: Free: personal only. Plus: personal (no limits). Team: 1 Team + 1 Personal. Enterprise: custom

---

## 13. Pricing & Plans

### 13.1 Tier Mapping

| Code Tier ID | Marketing Name | Price (Monthly) | Price (Yearly) |
|-------------|---------------|----------------|---------------|
| `free` | Personal | $0 | $0 |
| `tier_1` | Plus | $34/mo | $190/mo billed yearly |
| `tier_2` | Team | $67/mo | $370/mo billed yearly |
| `custom` | Enterprise | Custom | Custom |

### 13.2 Feature Gates (from `TierLimit` model + `OrganizationType`)

| Feature | Personal (free) | Plus (tier_1) | Team (tier_2) | Enterprise (custom) |
|---------|----------------|--------------|--------------|--------------------|
| Assets | Unlimited | Unlimited | Unlimited | Unlimited |
| Users | 1 | 1 | Unlimited | Unlimited |
| Asset QR Codes | Yes | Yes | Yes | Yes |
| Tags & Categories | Yes | Yes | Yes | Yes |
| Kits | Yes | Yes | Yes | Yes |
| Custom Fields | 3 | Unlimited | Unlimited | Unlimited |
| Asset Reminders | Yes | Yes | Yes | Yes |
| Locations | Yes | Yes | Yes | Yes |
| Global Search | Yes | Yes | Yes | Yes |
| Advanced Filters | Yes | Yes | Yes | Yes |
| Bulk Asset Label Export | Yes | Yes | Yes | Yes |
| Role-Based Access | Yes | Yes | Yes | Yes |
| NRM (Non-Registered Members) | Unlimited | Unlimited | Unlimited | Unlimited |
| Workspaces | Personal only | Personal (no limits) | 1 Team + 1 Personal | Custom |
| Remove Shelf Branding | No | Yes | Yes | Yes |
| Import Assets (CSV) | No | Yes | Yes | Yes |
| Export Assets (CSV) | No | Yes | Yes | Yes |
| Request Unclaimed Tags | No | Yes | Yes | Yes |
| Priority Feature Request | No | Yes | Yes | Yes |
| Email Support | No | Yes | Yes | Yes |
| Bookings | No | No | Yes | Yes |
| Booking Calendar | No | No | Yes | Yes |
| Availability View | No | No | Yes | Yes |
| Fixed Period Checkout | No | No | Yes | Yes |
| Working Hours | No | No | Yes | Yes |
| Self-Checkouts | No | No | Yes | Yes |
| Booking PDFs (Pull Lists) | No | No | Yes | Yes |
| Import External Barcodes | No | Add-on | Add-on | Included |
| SSO / SAML / SCIM | No | No | Add-on (contact sales) | Included |
| Account Manager | No | No | No | Yes |
| SLA | No | No | No | Yes |

### 13.3 Add-ons

| Add-on | Code Flag | Price | Trial | Self-Service? |
|--------|----------|-------|-------|---------------|
| Audits | `Organization.auditsEnabled` | Stripe subscription | 7-day free trial | Yes (one-time per org) |
| Alternative Barcodes | `Organization.barcodesEnabled` | Stripe subscription | 7-day free trial | Yes (one-time per org) |
| SSO / SAML / SCIM | `Organization.enabledSso` + `SsoDetails` | Contact sales (Team) / Included (Enterprise) | No | No |

### 13.4 Trial Mechanics
- **Platform trial**: Team plan free trial, tracked via `User.usedFreeTrial`
- **Addon trials**: 7-day, tracked via `Organization.usedAuditTrial` / `usedBarcodeTrial`
- **Trial behavior**: Stripe `trial_settings.end_behavior.missing_payment_method: "pause"`
- **Auto-charge safety nets**: Added Mar 2026 (`c6a9200`)

---

## 14. Roles & Permissions

### 14.1 Organization Roles

| Role | Rank | Description |
|------|------|------------|
| `OWNER` | 3 | Full access, can change explicit check-in settings, manage subscription |
| `ADMIN` | 2 | Full access except explicit check-in settings; bypasses time restrictions |
| `SELF_SERVICE` | 1 | Can manage own bookings/custody; sees own bookings unless override enabled |
| `BASE` | 1 | Read-only on assets; can manage own bookings; cannot use bulk actions |

### 14.2 Key Permission Differences

| Capability | OWNER | ADMIN | SELF_SERVICE | BASE |
|-----------|-------|-------|-------------|------|
| Create/edit/delete assets | Yes | Yes | No | No |
| View assets | Yes | Yes | Read only | Read only |
| Assign custody (to anyone) | Yes | Yes | No (self only) | No |
| Create bookings | Yes | Yes | Yes (self only) | Yes |
| Check out bookings | Yes | Yes | Yes | No |
| Check in bookings | Yes | Yes | Yes (own only) | No |
| Manage booking assets (non-draft) | Yes | Yes | No | No |
| Delete bookings | Yes (any) | Yes (any) | Yes (own only) | DRAFT only |
| View all bookings | Yes | Yes | If override on | If override on |
| View custody | Yes | Yes | If override on | If override on |
| Categories/Tags/Locations CRUD | Yes | Yes | No | No |
| Custom fields CRUD | Yes | Yes | No | No |
| Team management | Yes | Yes | No | No |
| Subscription management | Yes | Yes | No | No |
| Bulk actions | Yes | Yes | Limited | Hidden |
| Change roles | Yes | Yes | No | No |
| Export/Import | Yes | Yes | No | No |

---

## 15. Integrations

### 15.1 SSO / SAML / SCIM
- **Model**: `SsoDetails` with domain, group-to-role mappings
- **Group mappings**: `adminGroupId`, `selfServiceGroupId`, `baseUserGroupId`
- **Features** (shipped Mar 2026):
  - Hide personal workspaces for SSO users (`889b808`)
  - Display name field for SSO users (`ff68b61`)
  - Return first matched org in SSO flows (`d68ab82`)
- **KB article**: `sso-with-google-workspace.mdx`

### 15.2 Stripe
- Checkout sessions, subscription management, customer portal
- Webhook handling for subscription lifecycle events
- Addon subscription management (audit + barcode)
- Subscription transfer between users (workspace ownership transfer)

### 15.3 QR Code Scanner
- **Route**: `scanner.tsx` → `/scanner`
- Built-in camera-based scanner
- Supports QR codes and barcodes
- Haptic feedback on detection (shipped Mar 2026, `1f0d512`)
- Also used within: booking check-in, audit scanning, location scanning, kit scanning

### 15.4 No Public API
- All `api+/` routes are **internal resource routes** for UI operations
- No public developer-facing REST API exists
- Self-hosted deployments have access to the same internal routes

---

## 16. Other Features

### 16.1 QR Codes & Labels
- Every asset/kit gets a QR code
- `PrintBatch` model for bulk QR printing
- `QrIdDisplayPreference`: Show QR ID or Sequential ID (SAM ID) on labels
- `Organization.showShelfBranding`: Toggle Shelf branding on labels
- External asset label store (linked from sidebar)

### 16.2 Barcodes (Add-on)
- **Types**: Code128, Code39, DataMatrix, ExternalQR, EAN13
- Organization-scoped uniqueness for barcode values
- Built-in barcode scanner for lookups
- Import via CSV

### 16.3 Sequential IDs (SAM IDs)
- Auto-generated per organization (format "SAM-0001")
- `Asset.sequentialId` field
- Display preference configurable per org

### 16.4 Report Found (Lost & Found)
- `ReportFound` model: email + content submitted when someone scans a lost asset's QR
- Not prominently documented on website

### 16.5 In-App Updates
- `Update` model with title, content (Markdown), publish date, role targeting
- Tracks read status per user
- Accessible from sidebar → Updates

### 16.6 Command Palette Search
- `api+/command-palette.search.ts`
- Full-text search across entities

### 16.7 PWA (Progressive Web App)
- Install prompt, dock/taskbar/homescreen support
- **KB article**: `add-the-shelf-app-to-your-dock-taskbar-or-homescreen.mdx`

### 16.8 My Profile
- **Route**: `me.tsx` → `/me`
- **Sub-tabs**: Assets (custodied by user), Bookings, Notes (admin notes, ADMIN/OWNER only)
- New Mar 2026

---

## 17. Features Shipped Since Jan 1, 2026

| Date | Description | Key Commit(s) | Route/Files |
|------|-------------|--------------|-------------|
| 2026-03-25 | Team member notes (admin notes on user profiles) | `4aecab0`, `2040c22`, `b5542b8` | `TeamMemberNote` model, `me.notes.tsx`, `settings.team.users.$userId.notes.tsx` |
| 2026-03-25 | Hide personal workspaces for SSO users | `889b808` | SSO login flow |
| 2026-03-25 | Fix SSO org matching (return first matched org) | `d68ab82` | SSO flow |
| 2026-03-23 | Display name field for SSO users | `ff68b61` | User model, account details |
| 2026-03-20 | Auto-charge safety nets for addon/platform trials | `c6a9200` | Trial/subscription logic |
| 2026-03-19 | Haptic feedback on QR/barcode scanner | `1f0d512` | `scanner.tsx` |
| 2026-03-17 | Centralized addon copy constants | `e9c4f29` | `config/addon-copy.ts` |
| 2026-03-16 | Batch refresh expired asset image URLs | `915b2ab` | Image handling |
| 2026-03-10 | Show bookings on all kits in calendar view | `a062803` | `calendar.tsx` |
| 2026-03-10 | Show asset location in audit scan list (mobile) | `1940be2` | Audit scan UI |
| 2026-03-10 | Preserve asset location on audit resume | `3c982bb` | Audit logic |
| 2026-03-06 | Purchasable barcodes addon with self-service trials | `6972855` | Barcode addon, Stripe integration |
| 2026-03-06 | Prevent emails to soft-deleted users | `9df65c9` | Email sending logic |
| 2026-03-05 | Require explicit type prop on Button components | `1776df2` | All form buttons |
| 2026-03-04 | Transfer workspace ownership with subscription transfer | `e72e066` | Workspace/subscription management |
| 2026-03-04 | ICS calendar export improvements | `9414d65` | `bookings.$bookingId.overview.cal[.ics].ts` |
| 2026-03-02 | Dashboard redesign (Stripe-inspired widget grid) | `ddea526` | `home.tsx` |
| 2026-03-02 | Client-side Sentry + error event IDs | `763295d` | Error tracking |
| 2026-03-02 | Migration from husky to lefthook | `99da826` | Dev tooling |
| 2026-02-27 | Split full name into firstName/lastName on invite accept | `89d7a37` | Invite flow |
| 2026-02-24 | Inventory value text wrap + tablet overflow fix | `91d90f9` | Dashboard UI |
| 2026-02-23 | pnpm + Turborepo monorepo migration | `8ada9c0` | Build system |
