# Shelf Product Capabilities Ledger

**Generated from**: Shelf-nu/shelf.nu @ commit `41327af`
**Date**: 2026-03-25

---

## 1. Asset Management

### 1.1 Create Assets
- **Route**: `assets.new.tsx` → `/assets/new`
- **Permission**: `asset.create`
- **Form fields**:
  - Name (required, min 2 chars)
  - Asset ID / Sequential ID (auto-assigned, read-only, format "SAM-0001")
  - Main image (PNG/JPG/JPEG/WebP, max 8 MB, auto-resized to 1200px)
  - Description (textarea, max 1000 chars)
  - Category (dropdown with inline creation)
  - Tags (multi-select autocomplete)
  - Location (dropdown with inline creation; disabled if asset belongs to kit)
  - Value/Valuation (number input with org currency prefix)
  - Barcodes (Code128, Code39, DataMatrix — requires barcode add-on)
  - Custom Fields (dynamic based on selected category):
    - TEXT — standard text input
    - BOOLEAN — switch toggle
    - DATE — date picker with clear
    - OPTION — custom select with search
    - MULTILINE_TEXT — Markdown editor, max 5000 chars
    - AMOUNT — number with currency prefix
    - NUMBER — number input
- **Post-creation**: Activity note created ("Asset was created by [user]"), location note if set
- **"Add another" button**: saves and reloads form for rapid entry

### 1.2 Asset List / Index
- **Route**: `assets._index.tsx` → `/assets`
- **Permission**: `asset.read`
- **Two display modes**:
  - **SIMPLE mode** — standard table (all roles)
  - **ADVANCED mode** — configurable columns via `AssetIndexSettings` (NOT available to BASE or SELF_SERVICE)
- **Simple mode columns**: Asset (image+title+status), Category, Tags, Custodian, Location, Actions
- **Availability view**: Calendar view showing asset bookings (FullCalendar)
- **Quick actions per asset** (permission-gated):
  - Edit (requires `asset.update`)
  - Show asset label / QR code preview
  - Duplicate (requires `asset.update`)
  - Delete (requires `asset.delete`)
- **Filter presets**: Users can save, rename, star, and delete filter presets

### 1.3 Asset Detail Page
- **Route**: `assets.$assetId.overview.tsx` → `/assets/:id/overview`
- **Sub-tabs**: Overview, Activity, Bookings, Reminders
- **Overview displays**:
  - Internal ID, Sequential ID (SAM ID), Shelf QR ID
  - Created date, Category badge, Location badge with hierarchy
  - Description, Tags, Value (formatted in org currency)
  - Barcodes (if addon enabled)
  - Custom fields (sorted alphabetically, filtered by category)
- **Right sidebar**:
  - Available for bookings toggle (requires `asset.update`)
  - Asset Reminder cards
  - Kit membership card (if in a kit)
  - Custody card (permission-gated)
  - QR/Barcode code preview
  - Last scan details (requires `scan.read`)

### 1.4 Edit Assets
- **Route**: `assets.$assetId_.edit.tsx` → `/assets/:id/edit`
- **Permission**: `asset.update`
- Same form as create, pre-populated with existing data
- Location disabled if asset belongs to a kit

### 1.5 Duplicate Assets
- **Route**: `assets.$assetId.overview.duplicate.tsx`
- **Permission**: `asset.update`
- Creates a copy of the asset

### 1.6 Bulk Actions
- **Hidden for BASE role users**
- All bulk actions support "select all across pages" via `CurrentSearchParamsSchema`

| Bulk Action | Permission | Route | Details |
|------------|-----------|-------|--------|
| Assign Custody | `asset.custody` | `api+/assets.bulk-assign-custody.ts` | Self-service can only assign to themselves |
| Release Custody | `asset.custody` | `api+/assets.bulk-release-custody.ts` | Self-service can only release their own |
| Assign Tags | `asset.update` | `api+/assets.bulk-assign-tags.ts` | Multi-select tag picker |
| Remove Tags | `asset.update` | `api+/assets.bulk-assign-tags.ts?remove=true` | Same endpoint with remove flag |
| Update Category | `asset.update` | `api+/assets.bulk-update-category.ts` | Dropdown with inline creation |
| Update Location | `asset.update` | `api+/assets.bulk-update-location.ts` | Also supports kit location updates |
| Mark Available | `asset.update` | `api+/assets.bulk-mark-availability.ts` | Sets `availableToBook=true` |
| Mark Unavailable | `asset.update` | `api+/assets.bulk-mark-availability.ts` | Sets `availableToBook=false` |
| Add to Kit | `asset.update` | `api+/assets.bulk-add-to-kit.ts` | Location auto-updates to match kit. Disabled for checked-out assets |
| Remove from Kit | `asset.update` | `api+/assets.bulk-remove-from-kits.ts` | Confirmation dialog only |
| Download QR Codes | (any) | `BulkDownloadQrDialog` | ZIP download of QR code images |
| Delete | `asset.delete` | Route action `bulk-delete` | Disabled for checked-out assets |
| Create Audit | `audit.create` | `BulkStartAuditDialog` | Starts new audit with selected assets |
| Add to Audit | `audit.update` | `BulkAddToAuditDialog` | Adds to existing audit |
| Book Selected | `booking.create` | `BookSelectedAssetsDropdown` | Separate dropdown |

### 1.7 CSV Import
- **Route**: `assets.import.tsx` → `/assets/import`
- **Permission**: `asset.import` + subscription check (`canImportAssets`)
- **Supported CSV headers**: title, description, category, kit, tags, location, custodian, bookable, imageUrl, valuation, qrId, barcode_Code128, barcode_Code39, barcode_DataMatrix, barcode_ExternalQR, barcode_EAN13
- **Custom field import**: Column format `cf:<field name>, type:<type>`
- **Delimiter**: Auto-detected (comma or semicolon)
- **Rules**: Each row creates a new asset; categories/locations/custodians/kits created if not found; tags created if not found
- **QR import**: Links existing QR codes by ID; generates new if omitted
- **Barcode import**: Requires barcode add-on; values must be org-unique
- **Confirmation**: User must type "I AGREE" before import executes
- **Error reporting**: Detailed tables for duplicate QRs, non-existent QRs, duplicate barcodes, defected headers

### 1.8 CSV Export
- **Route**: `assets.export.$fileName[.csv].tsx`
- **Permission**: `asset.export` + subscription check (`canExportAssets`)
- **Two modes**:
  - **Backup export** (default): All assets with all fields, relations serialized, semicolon delimiter
  - **Advanced index export**: Based on user's column settings and current filters

### 1.9 Asset Statuses
- `AVAILABLE` — not in custody, not checked out
- `IN_CUSTODY` — assigned to a custodian directly
- `CHECKED_OUT` — checked out via a booking

### 1.10 Asset Activity
- **Route**: `assets.$assetId.activity.tsx` → `/assets/:id/activity`
- Timeline of all changes, notes, custody events
- **Exportable**: `assets.$assetId.activity[.csv].ts`

---

## 2. Bookings

### 2.1 Create Booking
- **Route**: `bookings.new.tsx` → `/bookings/new`
- **Permission**: `booking.create`
- **Restriction**: Team workspace only (not available in personal workspaces)
- **Form fields**:
  - Name (required, min 2 chars)
  - Description (optional)
  - Custodian (team member picker; self-service users only see themselves)
  - Start Date (validated against buffer time, working hours, must be future)
  - End Date (validated against working hours, must be after start, max booking length enforced)
  - Asset IDs (pre-selectable via query params)
  - Tags (required or optional based on `bookingSettings.tagsRequired`)
- **ADMIN/OWNER bypass**: Buffer time and max booking length restrictions
- **Post-create flow**: Redirects to scan-assets, booking overview, or manage-assets depending on context

### 2.2 Booking List
- **Route**: `bookings._index.tsx` → `/bookings`
- **Permission**: `booking.read`
- **Search**: Name, Description, Tags, Custodian names, Asset names, Asset barcodes/QR codes (comma-separated OR)
- **Columns**: Name + Status badge, Availability warning, Assets sidebar, Description, From, To, Tags, Custodian, Created by
- **Filters**: Status, Custodian, Tags, Sort order
- **Self-service/BASE**: Only see their own bookings unless `canSeeAllBookings` org setting is on

### 2.3 Booking Detail / Overview
- **Route**: `bookings.$bookingId.overview.tsx` → `/bookings/:id/overview`
- **Displays**: Assets grouped by kit, paginated, with category/custody/tags/kit/conflicting bookings
- **Total value**: Sum of all assets formatted in org currency
- **Partial check-in progress**: Visual progress tracking

### 2.4 Booking Actions

| Action | Permission | When Available | Details |
|--------|-----------|----------------|--------|
| Save/Update | `booking.update` | DRAFT: all fields. RESERVED/ONGOING/OVERDUE: name+description only | Updates name, description, dates, custodian, tags |
| Reserve | `booking.create` | DRAFT → RESERVED | Validates all fields including dates/working hours |
| Check Out | `booking.checkout` | RESERVED → ONGOING | Changes asset statuses, creates notes on all assets |
| Check In (full) | `booking.checkin` | ONGOING/OVERDUE → COMPLETE | Blocked if explicit check-in required by settings |
| Partial Check-in | `booking.checkin` | ONGOING/OVERDUE | Check in specific assets; creates `PartialBookingCheckin` record |
| Cancel | `booking.update` | Any pre-complete | With optional cancellation reason (max 500 chars) |
| Archive | `booking.update` | COMPLETE → ARCHIVED | Manual or auto (configurable days) |
| Revert to Draft | `booking.update` | RESERVED → DRAFT | |
| Extend | `booking.extend` | ONGOING/OVERDUE | Extend end date; validated against working hours/max length |
| Delete | `booking.delete` | Self-service: own only. BASE: DRAFT only | Creates notes on affected assets |
| Remove Asset | `booking.update` | Active booking | Sends email notification |
| Remove Kit | `booking.update` | Active booking | Removes all kit assets |
| Duplicate | — | Any | Creates copy |

### 2.5 Booking Statuses (Lifecycle)
```
DRAFT → RESERVED → ONGOING (checkout) → COMPLETE (full checkin)
                                       → OVERDUE (past end date)
Any pre-complete → CANCELLED
COMPLETE → ARCHIVED (manual or auto)
RESERVED → DRAFT (revert)
ONGOING/OVERDUE: supports partial check-ins and extensions
```

### 2.6 Check-in via Scanner
- **Route**: `bookings.$bookingId.overview.checkin-assets.tsx`
- **Permission**: `booking.checkin`
- Full-screen QR/barcode scanner with `PartialCheckinDrawer`
- Self-service users can check in their own ONGOING/OVERDUE bookings

### 2.7 Manage Assets in Booking
- **Route**: `bookings.$bookingId.overview.manage-assets.tsx`
- **Permission**: `booking.update`
- Two tabs: Assets and Kits
- Filter by Categories, Tags, Locations, Status, Availability
- Bulk selection with select-all support
- Self-service/BASE: can only manage assets on DRAFT bookings

### 2.8 Scan Assets to Add
- **Route**: `bookings.$bookingId.overview.scan-assets.tsx`
- Full-screen scanner to add assets by scanning QR/barcode

### 2.9 Booking Export (CSV)
- **Route**: `bookings.export.$fileName[.csv].tsx`
- **Permission**: `booking.export`
- **Columns**: Booking URL, ID, Name, Status, Actual/Planned start/end dates, Custodian, Description, Tags, Assets (one per row)
- Supports select-all with current filters

### 2.10 Booking PDF (Pull List)
- **Route**: `api+/bookings.$bookingId.generate-pdf.tsx`
- **Permission**: `booking.read`
- Contains: Booking details, all assets with category/location/kit/QR codes, total value, org info
- Assets grouped by kit

### 2.11 ICS Calendar Export
- **Route**: `bookings.$bookingId.overview.cal[.ics].ts`
- Exports booking as calendar event

---

## 3. Custody

### 3.1 Assign Custody
- **Route**: `assets.$assetId.overview.assign-custody.tsx`
- **Permission**: `asset.custody`
- Team member picker (self-service users only see themselves)
- Sets asset status to `IN_CUSTODY`, creates custody record
- Creates activity note, sends notification
- **Warning**: If asset is in a reserved booking, shows warning about checkout conflict

### 3.2 Release Custody
- **Route**: `assets.$assetId.overview.release-custody.tsx`
- **Permission**: `asset.custody`
- Self-service: can only release custody of assets assigned to their own user
- Sets status back to `AVAILABLE`, removes custody record
- Creates activity note, sends notification

### 3.3 Kit Custody
- Kits have their own `KitCustody` model
- Assign/release custody available from kit detail pages
- Kit statuses mirror asset statuses: `AVAILABLE`, `IN_CUSTODY`, `CHECKED_OUT`

### 3.4 Visibility Overrides
- `Organization.selfServiceCanSeeCustody` — lets self-service users see custody info
- `Organization.selfServiceCanSeeBookings` — lets self-service users see all bookings
- `Organization.baseUserCanSeeCustody` — lets base users see custody info
- `Organization.baseUserCanSeeBookings` — lets base users see all bookings
- **KB article**: `configure-what-self-service-and-base-users-can-see.mdx`

---

## 4. Calendar

### 4.1 Calendar View
- **Route**: `calendar.tsx` → `/calendar`
- **Permission**: `booking.read`
- **Not available in personal workspaces**
- **Views**: Month (default desktop), Week, Day, List Week (default mobile)
- **Library**: FullCalendar
- **Features**:
  - Color-coded by booking status
  - Now indicator (current time line)
  - Max 3 events per day cell, "more" popover
  - Tooltip on hover (month view)
  - Click navigates to booking
  - Same filters as bookings index
  - Create booking dialog accessible from header
  - First day of week: Monday
  - URL params `start`/`end` for maintaining calendar position
