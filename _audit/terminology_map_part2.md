## Part 2: Routes → UI Titles → Website Terms

Every route in `apps/webapp/app/routes/_layout+/`, mapped to what the UI displays and what the website calls it.

### 2a: Primary Navigation Routes

| # | Route File | URL Path | UI Page Title (browser tab) | UI Header Title | Website Feature Page | Website KB Articles | Notes |
|---|-----------|----------|---------------------------|----------------|---------------------|--------------------|----|
| 1 | `home.tsx` | `/home` | "Home \| shelf.nu" | Home | — | — | Dashboard redirect target. `dashboard.tsx` 301-redirects to `/home` |
| 2 | `dashboard.tsx` | `/dashboard` | — | — | features/dashboard.mdx ("Dashboard") | — | Redirects to `/home`; website has a feature page for "Dashboard" but the app route is `/home` |
| 3 | `assets._index.tsx` | `/assets` | "Assets \| shelf.nu" | Assets | features/asset-pages.mdx, features/asset-search.mdx | KB: `adding-new-assets.mdx`, `how-to-add-assets-to-your-inventory.mdx`, `advanced-asset-index-complete-guide.mdx`, `duplicating-assets-in-shelf.mdx` | |
| 4 | `assets.new.tsx` | `/assets/new` | — | New Asset | — | KB: `adding-new-assets.mdx` | |
| 5 | `assets.import.tsx` | `/assets/import` | — | Import Assets | — | KB: `importing-assets-to-shelf-csv-guide.mdx` | |
| 6 | `assets.export.$fileName[.csv].tsx` | `/assets/export/[name].csv` | — | — | — | KB: `how-to-filter-export-and-report-on-your-asset-inventory.mdx` | CSV download |
| 7 | `bookings._index.tsx` | `/bookings` | "Bookings \| shelf.nu" | Bookings | features/bookings.mdx ("Bookings") | KB: `introduction-to-bookings.mdx`, `how-to-create-a-booking.mdx`, `adding-assets-and-kits-to-a-booking.mdx` | |
| 8 | `bookings.new.tsx` | `/bookings/new` | — | New Booking | — | KB: `how-to-create-a-booking.mdx` | |
| 9 | `bookings.export.$fileName[.csv].tsx` | `/bookings/export/[name].csv` | — | — | — | KB: `bookings-how-to-export-booking-information-and-assets-checked-out.mdx` | |
| 10 | `kits._index.tsx` | `/kits` | "Kits \| shelf.nu" | Kits | features/kits.mdx ("Kits") | KB: `kits.mdx` | |
| 11 | `kits.new.tsx` | `/kits/new` | — | New Kit | — | — | |
| 12 | `locations._index.tsx` | `/locations` | "Locations \| shelf.nu" | Locations | features/location-tracking.mdx ("Location Tracking") | KB: `sublocations-organize-locations-into-hierarchies.mdx` | Route says "Locations"; website feature page says "Location Tracking" |
| 13 | `locations.new.tsx` | `/locations/new` | — | New Location | — | — | |
| 14 | `categories.tsx` | `/categories` | "Categories \| shelf.nu" | Categories | — | KB: `using-categories-to-organize-your-asset-inventory.mdx` | No dedicated feature page |
| 15 | `categories.new.tsx` | `/categories/new` | — | New Category | — | — | |
| 16 | `tags.tsx` | `/tags` | "Tags \| shelf.nu" | Tags | — | KB: `what-is-a-tag-in-shelf-and-what-can-they-be-used-for.mdx` | No dedicated feature page |
| 17 | `tags.new.tsx` | `/tags/new` | — | New Tag | — | — | |
| 18 | `audits._index.tsx` | `/audits` | "Audits \| shelf.nu" | Audits | features/audits.mdx ("Audits") | — | No dedicated KB article for audits workflow |
| 19 | `reminders._index.tsx` | `/reminders` | "Reminders \| shelf.nu" | Reminders | features/asset-reminders.mdx ("Asset Reminders") | KB: `asset-reminders.mdx` | Route says "Reminders"; website feature page says "Asset Reminders" |
| 20 | `calendar.tsx` | `/calendar` | "Calendar \| shelf.nu" | Calendar | features/calendar.mdx ("Calendar") | KB: `availability-view-complete-guide.mdx` | |
| 21 | `scanner.tsx` | `/scanner` | "Qr code scanner \| shelf.nu" | QR code scanner | — | KB: `scanning-an-asset.mdx`, `batch-scanning-actions.mdx` | No feature page for scanner. Note: loader header.title is incorrectly set to "Locations" (copy-paste bug), but Header component overrides with explicit `title="QR code scanner"` |
| 22 | `updates.tsx` | `/updates` | — | Updates | — | — | In-app product updates; no website equivalent |

### 2b: Asset Detail Sub-Routes

| # | Route File | URL Path | UI Tab/Section Title | Website Reference | Notes |
|---|-----------|----------|---------------------|-------------------|-------|
| 1 | `assets.$assetId.overview.tsx` | `/assets/:id/overview` | Overview | features/asset-pages.mdx | Default tab |
| 2 | `assets.$assetId.activity.tsx` | `/assets/:id/activity` | Activity | — | Activity timeline for asset |
| 3 | `assets.$assetId.bookings.tsx` | `/assets/:id/bookings` | Bookings | — | Bookings associated with this asset |
| 4 | `assets.$assetId.reminders.tsx` | `/assets/:id/reminders` | Reminders | features/asset-reminders.mdx | |
| 5 | `assets.$assetId.overview.assign-custody.tsx` | modal | Assign Custody | features/custody.mdx | |
| 6 | `assets.$assetId.overview.release-custody.tsx` | modal | Release Custody | features/custody.mdx | |
| 7 | `assets.$assetId.overview.update-location.tsx` | modal | Update Location | features/location-tracking.mdx | |
| 8 | `assets.$assetId.overview.duplicate.tsx` | modal | Duplicate Asset | KB: `duplicating-assets-in-shelf.mdx` | |
| 9 | `assets.$assetId.overview.add-to-existing-booking.tsx` | modal | Add to Existing Booking | — | |
| 10 | `assets.$assetId.overview.create-new-booking.tsx` | modal | Create New Booking | — | |
| 11 | `assets.$assetId.note.tsx` | action | Add Note | — | Resource route for adding notes |
| 12 | `assets.$assetId_.edit.tsx` | `/assets/:id/edit` | Edit Asset | — | |
| 13 | `assets.$assetId.activity[.csv].ts` | `/assets/:id/activity.csv` | — | — | Activity export |

### 2c: Booking Detail Sub-Routes

| # | Route File | URL Path | UI Tab/Section Title | Website Reference | Notes |
|---|-----------|----------|---------------------|-------------------|-------|
| 1 | `bookings.$bookingId.overview.tsx` | `/bookings/:id/overview` | Overview | features/bookings.mdx | |
| 2 | `bookings.$bookingId.activity.tsx` | `/bookings/:id/activity` | Activity | KB: `activity-logs-for-bookings.mdx` | |
| 3 | `bookings.$bookingId.overview.manage-assets.tsx` | modal | Manage Assets | — | Add/remove assets in booking |
| 4 | `bookings.$bookingId.overview.manage-kits.tsx` | modal | Manage Kits | — | Add/remove kits in booking |
| 5 | `bookings.$bookingId.overview.checkin-assets.tsx` | modal | Check In Assets | KB: `partial-check-ins-efficiently-handle-incomplete-returns.mdx` | |
| 6 | `bookings.$bookingId.overview.scan-assets.tsx` | modal | Scan Assets | — | Scanner-based check-in |
| 7 | `bookings.$bookingId.overview.duplicate.tsx` | modal | Duplicate Booking | — | |
| 8 | `bookings.$bookingId.overview.cal[.ics].ts` | `/bookings/:id/overview/cal.ics` | — | — | ICS calendar export for booking |

### 2d: Kit Detail Sub-Routes

| # | Route File | URL Path | UI Tab/Section Title | Notes |
|---|-----------|----------|---------------------|-------|
| 1 | `kits.$kitId.overview.tsx` | `/kits/:id/overview` | Overview | |
| 2 | `kits.$kitId.assets.tsx` | `/kits/:id/assets` | Assets | |
| 3 | `kits.$kitId.bookings.tsx` | `/kits/:id/bookings` | Bookings | |
| 4 | `kits.$kitId.assets.manage-assets.tsx` | modal | Manage Assets | |
| 5 | `kits.$kitId.assets.assign-custody.tsx` | modal | Assign Custody | |
| 6 | `kits.$kitId.assets.release-custody.tsx` | modal | Release Custody | |
| 7 | `kits.$kitId.assets.update-location.tsx` | modal | Update Location | |
| 8 | `kits.$kitId.assets.add-to-existing-booking.tsx` | modal | Add to Existing Booking | |
| 9 | `kits.$kitId.assets.create-new-booking.tsx` | modal | Create New Booking | |
| 10 | `kits.$kitId.scan-assets.tsx` | modal | Scan Assets | |

### 2e: Location Detail Sub-Routes

| # | Route File | URL Path | UI Tab/Section Title | Notes |
|---|-----------|----------|---------------------|-------|
| 1 | `locations.$locationId.overview.tsx` | `/locations/:id/overview` | Overview | |
| 2 | `locations.$locationId.assets.tsx` | `/locations/:id/assets` | Assets | |
| 3 | `locations.$locationId.kits.tsx` | `/locations/:id/kits` | Kits | |
| 4 | `locations.$locationId.assets.manage-assets.tsx` | modal | Manage Assets | |
| 5 | `locations.$locationId.kits.manage-kits.tsx` | modal | Manage Kits | |
| 6 | `locations.$locationId.scan-assets-kits.tsx` | modal | Scan Assets & Kits | |
| 7 | `locations.$locationId.activity.tsx` | tab | Activity | |
| 8 | `locations.$locationId.note.tsx` | action | Add Note | |

### 2f: Audit Detail Sub-Routes

| # | Route File | URL Path | UI Tab/Section Title | Notes |
|---|-----------|----------|---------------------|-------|
| 1 | `audits.$auditId.overview.tsx` | `/audits/:id/overview` | Overview | |
| 2 | `audits.$auditId.activity.tsx` | `/audits/:id/activity` | Activity | |
| 3 | `audits.$auditId.scan.tsx` | `/audits/:id/scan` | Scan | Dedicated scan page for audit |
| 4 | `audits.$auditId.scan.$auditAssetId.details.tsx` | modal | Asset Details (in scan) | |
| 5 | `audits.$auditId.note.tsx` | action | Add Note | |

### 2g: Settings Routes

| # | Route File | URL Path | UI Page Title | UI Tab Label | Website Reference | Notes |
|---|-----------|----------|--------------|-------------|-------------------|-------|
| 1 | `settings.tsx` | `/settings` | "Settings \| shelf.nu" | — | — | Parent layout with horizontal tabs |
| 2 | `settings.general.tsx` | `/settings/general` | "General \| shelf.nu" | General | — | Workspace name, currency, etc. |
| 3 | `settings.bookings.tsx` | `/settings/bookings` | "Bookings settings \| shelf.nu" | Bookings | — | Buffer time, tags required, max length, auto-archive, explicit checkin. Hidden for personal orgs |
| 4 | `settings.emails.tsx` | `/settings/emails` | "Email settings \| shelf.nu" | Emails | — | Custom email footer. Hidden for personal orgs |
| 5 | `settings.custom-fields.index.tsx` | `/settings/custom-fields` | "Custom Fields \| shelf.nu" | Custom fields | KB: `adding-additional-fields-to-assets.mdx`, `custom-field-types-in-shelf.mdx` | |
| 6 | `settings.custom-fields.new.tsx` | `/settings/custom-fields/new` | — | — | — | |
| 7 | `settings.custom-fields.$fieldId_.edit.tsx` | `/settings/custom-fields/:id/edit` | — | — | — | |
| 8 | `settings.team._index.tsx` | `/settings/team` | — | Team | — | Redirects to users or NRM sub-tab |
| 9 | `settings.team.users.tsx` | `/settings/team/users` | "Settings - {orgName}" | Users (sub-tab of Team) | KB: `onboarding-your-team-members.mdx` | |
| 10 | `settings.team.invites.tsx` | `/settings/team/invites` | "Settings - {orgName}" | Pending invites (sub-tab of Team) | — | |
| 11 | `settings.team.nrm.tsx` | `/settings/team/nrm` | "Settings - Manage Team Members" | Non-registered members (sub-tab of Team) | KB: `converting-non-registered-members-nrms-to-users.mdx` | |
| 12 | `settings.team.nrm.add-member.tsx` | modal | Add Member | — | |
| 13 | `settings.team.nrm.import-members.tsx` | modal | Import Members | KB: `inviting-users-via-csv-upload.mdx` | |
| 14 | `settings.team.nrm.$nrmId.edit.tsx` | modal | Edit Member | — | |
| 15 | `settings.team.users.$userId._index.tsx` | `/settings/team/users/:id` | User detail | — | |
| 16 | `settings.team.users.$userId.assets.tsx` | tab | Assets (user detail) | — | |
| 17 | `settings.team.users.$userId.bookings.tsx` | tab | Bookings (user detail) | — | |
| 18 | `settings.team.users.$userId.notes.tsx` | tab | Notes (user detail) | KB: `admin-notes-on-team-members.mdx` | New Mar 2026 |
| 19 | `settings.team.users.$userId.note.tsx` | action | Add Note | — | Resource route |

### 2h: Account Details Routes

| # | Route File | URL Path | UI Page Title | UI Tab Label | Notes |
|---|-----------|----------|--------------|-------------|-------|
| 1 | `account-details.tsx` | `/account-details` | "Account Details \| shelf.nu" | — | Parent layout |
| 2 | `account-details.general.tsx` | `/account-details/general` | "Account Details" | General | User profile info |
| 3 | `account-details.subscription.tsx` | `/account-details/subscription` | "Subscriptions" | Subscription | Plan management. Only shown when premium enabled |
| 4 | `account-details.workspace.tsx` | `/account-details/workspace` | "Workspaces" | Workspaces | List/manage workspaces |
| 5 | `account-details.workspace.new.tsx` | `/account-details/workspace/new` | — | — | Create new workspace |
| 6 | `account-details.workspace.$workspaceId.edit.tsx` | edit modal | — | — | Edit workspace |
| 7 | `account-details.subscription.customer-portal.tsx` | action | — | — | Redirects to Stripe Customer Portal |

### 2i: My Profile Routes

| # | Route File | URL Path | UI Page Title | UI Tab Label | Notes |
|---|-----------|----------|--------------|-------------|-------|
| 1 | `me.tsx` | `/me` | "{userName} \| shelf.nu" | — | Shows user's own profile. Breadcrumb: "My profile" |
| 2 | `me._index.tsx` | `/me` | — | — | Redirects to `/me/assets` |
| 3 | `me.assets.tsx` | `/me/assets` | — | Assets | Assets custodied by this user |
| 4 | `me.bookings.tsx` | `/me/bookings` | — | Bookings | Bookings for this user |
| 5 | `me.notes.tsx` | `/me/notes` | — | Notes | Admin notes about this user (visible to ADMIN/OWNER only). New Mar 2026 |
| 6 | `me.note.tsx` | `/me/note` | — | — | Resource route for adding notes |

### 2j: Other Routes

| # | Route File | URL Path | UI Title | Notes |
|---|-----------|----------|---------|-------|
| 1 | `scanner-sam-id.ts` | `/scanner-sam-id` | — | API route for SAM ID scanner lookup |
| 2 | `_auth+/*` | `/login`, `/join`, etc. | — | Authentication routes |
| 3 | `_welcome+/*` | `/welcome` | — | Onboarding flow |
| 4 | `barcode+/*` | `/barcode/*` | — | Barcode display routes |
| 5 | `qr+/*` | `/qr/*` | — | QR code display routes |
| 6 | `admin-dashboard+/*` | `/admin-dashboard/*` | Admin Dashboard | Super-admin only; not on website |

### 2k: API Routes (Internal vs Public)

All routes in `api+/` are **internal resource routes** used by the UI for client-side operations. None are public developer-facing APIs.

| Category | Route Examples | Purpose | Public API? |
|----------|--------------|---------|-------------|
| Asset bulk actions | `assets.bulk-assign-custody.ts`, `assets.bulk-assign-tags.ts`, `assets.bulk-update-category.ts`, `assets.bulk-update-location.ts`, `assets.bulk-mark-availability.ts`, `assets.bulk-release-custody.ts`, `assets.bulk-add-to-kit.ts`, `assets.bulk-remove-from-kits.ts` | Bulk operations on selected assets | No |
| Booking actions | `bookings.bulk-actions.ts`, `bookings.$bookingId.generate-pdf.tsx` | Booking management, PDF generation | No |
| Audit actions | `audits.add-assets.ts`, `audits.record-scan.ts`, `audits.start.ts`, `audits.get-pending.ts`, `audits.$auditId.generate-pdf.tsx`, `audits.$auditId.upload-image.ts` | Audit workflow | No |
| Scanner | `asset.scan.ts`, `get-scanned-item.$qrId.ts`, `get-scanned-barcode.$value.ts` | QR/barcode scanning | No |
| Search | `command-palette.search.ts`, `model-filters.ts` | UI search/filter | No |
| User prefs | `user.prefs.*.ts` | UI preferences (sidebar, camera, PWA) | No |
| Settings | `settings.invite-user.ts`, `settings.import-users.ts`, `settings.export-nrm.$fileName[.csv].ts` | Team management | No |
| Stripe | `stripe-webhook.ts`, `barcode-addon-prices.ts`, `barcode-addon.ts` | Payment processing | No |
| Other | `feedback.ts`, `sse.notification.ts`, `public-stats.ts`, `oss-friends.ts` | Misc internal | No |

**Key finding**: Shelf does NOT have a public/developer-facing REST API. All `api+/` routes are internal. The website should NOT claim API access exists unless referring to the self-hosted deployment.

---

### 2l: Sidebar Navigation Labels

The sidebar (from `use-sidebar-nav-items.tsx`) groups links as follows:

| Sidebar Section | Items | Visible To |
|----------------|-------|-----------|
| (top) | Home | All |
| Asset Management | Assets, Kits, Categories, Tags, Locations, Audits, Reminders | Categories/Tags/Locations hidden for SELF_SERVICE and BASE |
| Bookings | View Bookings, Calendar | Team orgs only; visibility controlled by `canSeeAllBookings` |
| Organization | Team (→ Users, Pending invites, Non-registered members), Workspace settings (→ General, Bookings, Custom fields) | Team sections hidden for non-admin roles |
| (bottom) | Asset labels (external link), QR Scanner, Updates, Questions/Feedback | All |
