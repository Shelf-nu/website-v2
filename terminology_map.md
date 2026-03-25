# Shelf Terminology Map

**Generated**: 2026-03-25
**Product repo**: Shelf-nu/shelf.nu @ `41327af`
**Website repo**: Shelf-nu/website-v2 @ `de57476`

This map reconciles how the **code** names things vs. how the **marketing website** names them, to prevent false positives during the content audit.

---

## Entities & Core Concepts

| Code Term | Website Term(s) | Notes |
|-----------|----------------|-------|
| `Organization` | Workspace | Code uses `Organization` as the DB model and `organizationId` everywhere. UI sidebar says "Workspace settings." Website says "Workspaces." These are synonymous. |
| `teamMember` | Team member, User, Collaborator | Code entity is `TeamMember`. Website uses "team members" and "users" interchangeably. "Collaborator" appears in marketing copy. |
| `TeamMemberNote` | (not on website yet) | New feature (shipped Mar 2026). Admin notes on user profiles. No website coverage yet. |
| `NRM` / `Non-Registered Member` | Non-Registered Team Member | Code abbreviates to `NRM` internally. Website spells out "Non-Registered Team Members." Both refer to team members without Shelf accounts. |
| `asset` | Asset, Equipment, Item, Gear, Inventory | Code uses `asset` consistently. Website uses many synonyms depending on context/industry page. |
| `kit` | Kit | Consistent across both. Website describes as "bundle equipment with accessories." Code model is `Kit`. |
| `booking` | Booking, Reservation | Code uses `booking` exclusively. Website primarily says "Bookings" but some older content and solution pages use "Reservation" or "Equipment Reservations." |
| `custody` | Custody, Custodian, Accountability trail | Code has `custody` as a permission action and DB concept. Website uses "Custody" and adds marketing terms like "accountability trail" and "chain of custody." |
| `category` | Category | Consistent. |
| `tag` | Tag | Consistent. |
| `location` | Location | Consistent. Both support hierarchy (building/floor/room). |
| `locationNote` | (not prominently on website) | Code supports notes on locations. Not a marketed feature. |
| `customField` | Custom Field, Custom Properties | Code uses `customField`. Website uses both "Custom Fields" and occasionally "custom properties." |
| `qr` | QR Code, QR Label, Asset Label | Code entity is `Qr`. Website uses "QR Codes," "QR Labels," and "Asset Labels" (the physical printed labels). The sidebar link says "Asset labels" and goes to external store. |
| `barcode` | Barcode, Alternative Barcode, External Barcode | Code uses `barcode` and the addon is `BARCODE_ADDON`. Website calls it "Alternative Barcodes" (addon name) and "External Barcodes" (import feature). Supports Code128, Code39, EAN-13, DataMatrix, QR. |
| `audit` | Audit, Physical Audit, Mobile Auditing | Code model is `Audit` with `auditsEnabled` flag. Website uses "Audits" as the addon name, plus marketing terms like "Physical Audit" and "Mobile Auditing" on solution pages. |
| `scan` | Scan, QR Scanner | Code has `scan` permission entity and `scanner.tsx` route. Website calls it "QR Scanner" in nav and "scan workflow" in audit context. |
| `reminder` / `assetReminder` | Asset Reminder | Code uses `assetReminders` (permission entity) and `reminders` (route). Website says "Asset Reminders." Consistent. |
| `dashboard` | Dashboard | Consistent. |
| `calendar` | Calendar, Booking Calendar, Availability View | Code route is `calendar.tsx`. Website uses "Booking Calendar" and "Availability View" as distinct marketed features. |
| `note` | Note | Code has `note`, `bookingNote`, `locationNote`, `auditNote`, `teamMemberNote` as separate entities. Website doesn't prominently feature notes. |
| `update` | Updates, Changelog | Code route `updates.tsx`. Website equivalent unclear — may refer to in-app product updates. |

---

## Roles

| Code Term | Website Term(s) | Notes |
|-----------|----------------|-------|
| `OWNER` (OrganizationRoles) | Owner | Consistent. Highest org-level role. |
| `ADMIN` (OrganizationRoles) | Admin | Consistent. |
| `SELF_SERVICE` (OrganizationRoles) | Self-service | Code uses `SELF_SERVICE` (screaming snake). Website says "Self-service" (hyphenated, lowercase). |
| `BASE` (OrganizationRoles) | Base, Base User | Code uses `BASE`. Website says "Base" or "Base user." |
| `ADMIN` (system Roles) | (not exposed) | System-level admin role (super admin). Not referenced on website. |

---

## Plans & Tiers

| Code Term | Website Term | Notes |
|-----------|-------------|-------|
| `free` | Personal | **Important mismatch**: Code tier ID is `free`. Website displays plan name as "Personal." |
| `tier_1` | Plus | Code tier ID is `tier_1`. Website displays as "Plus" at $34/month. |
| `tier_2` | Team | Code tier ID is `tier_2`. Website displays as "Team" at $67/month. Marked as "popular." |
| `custom` | Enterprise | Code tier ID is `custom`. Website displays as "Enterprise" with custom pricing. |

---

## Add-ons

| Code Term | Website Term | Notes |
|-----------|-------------|-------|
| `AUDIT_ADDON` / `auditsEnabled` | Audits (add-on) | 7-day free trial. Code tracks via `usedAuditTrial`. |
| `BARCODE_ADDON` / `barcodesEnabled` | Alternative Barcodes (add-on) | 7-day free trial. Code tracks via `usedBarcodeTrial`. Website also calls it "External Barcodes" when referring to import capability. |

---

## Feature Gates

| Code Function / Field | Website Feature Name | Notes |
|----------------------|---------------------|-------|
| `canExportAssets` | Export Assets (CSV) | Boolean on TierLimit. |
| `canImportAssets` | Import Assets (CSV) | Boolean on TierLimit. |
| `canImportNRM` | (not explicitly named) | Import non-registered members. Part of team management. |
| `canHideShelfBranding` | Remove Shelf Branding | Hide branding on printable QR labels. |
| `maxCustomFields` | Custom Fields (limited) | Free plan has a limit; paid plans have higher/unlimited. |
| `maxOrganizations` | Workspaces (limited) | Free: personal only. Team: 1 team + 1 personal. Enterprise: custom. |
| `canUseBookings()` | Bookings | Only available on TEAM organization type. Not available on personal workspaces. |
| `canUseAudits()` | Audits | Requires add-on purchase or trial. |
| `canUseBarcodes()` | Alternative Barcodes | Requires add-on purchase or trial. |

---

## Organization Settings (visibility overrides)

| Code Setting | Website Equivalent | Notes |
|-------------|-------------------|-------|
| `selfServiceCanSeeCustody` | (not explicitly documented) | Override allowing Self-Service users to see custody info. |
| `selfServiceCanSeeBookings` | (not explicitly documented) | Override allowing Self-Service users to see all bookings. |
| `baseUserCanSeeCustody` | (not explicitly documented) | Override allowing Base users to see custody info. |
| `baseUserCanSeeBookings` | (not explicitly documented) | Override allowing Base users to see all bookings. |

---

## Actions & Operations

| Code Term | Website Term(s) | Notes |
|-----------|----------------|-------|
| `checkout` (permission action) | Check out, Check-out | Initiate asset custody via booking. |
| `checkin` (permission action) | Check in, Check-in | Return asset from booking. |
| `custody` (permission action) | Assign custody, Release custody | Direct custody assignment outside bookings. |
| `archive` (permission action) | Archive | Archive bookings. |
| `cancel` (permission action) | Cancel | Cancel bookings. |
| `extend` (permission action) | Extend | Extend booking period. |
| `import` (permission action) | Import, CSV Import | Asset/NRM import. |
| `export` (permission action) | Export, CSV Export | Asset/booking export. |
| `manageAssets` (permission action) | Manage assets | Add/remove assets in bookings. |
| `manageKits` (permission action) | Manage kits | Add/remove kits in bookings. |
| `changeRole` (permission action) | Change role | Admin ability to change team member roles. |
| Bulk actions (various `api+/assets.bulk-*`) | Bulk actions | Website mentions bulk operations but doesn't enumerate all. Code supports: assign custody, release custody, assign tags, remove tags, update category, update location, mark availability, add to kit, remove from kits, download QR. |

---

## Booking Statuses

| Code Status | Website Term | Notes |
|-------------|-------------|-------|
| `DRAFT` | Draft | |
| `RESERVED` | Reserved | |
| `ONGOING` | Checked Out | Code uses `ONGOING`, website says "Checked Out." **Terminology mismatch.** |
| `COMPLETE` | Checked In / Completed | |
| `CANCELLED` | Cancelled | |
| `ARCHIVED` | Archived | |
| `OVERDUE` | Overdue | |

---

## Page/Route Naming vs. Website Naming

| Code Route | Website Reference | Notes |
|------------|------------------|-------|
| `_layout+/assets.*` | Assets | |
| `_layout+/bookings.*` | Bookings | |
| `_layout+/kits.*` | Kits | |
| `_layout+/locations.*` | Locations | |
| `_layout+/categories.*` | Categories | |
| `_layout+/tags.*` | Tags | |
| `_layout+/audits.*` | Audits | |
| `_layout+/reminders.*` | Reminders | |
| `_layout+/calendar.*` | Calendar | |
| `_layout+/dashboard.*` | Dashboard | |
| `_layout+/scanner.*` | QR Scanner | |
| `_layout+/settings.general.*` | General Settings | |
| `_layout+/settings.bookings.*` | Booking Settings | |
| `_layout+/settings.custom-fields.*` | Custom Fields | |
| `_layout+/settings.team.*` | Team Settings | |
| `_layout+/settings.emails.*` | Email Settings | |
| `_layout+/account-details.*` | Account Details | |
| `_layout+/me.*` | My Profile / Me | New feature area (Mar 2026). |
| `_layout+/home.*` | Home | |
| `_layout+/admin-dashboard+/*` | (internal only) | Super-admin dashboard. Not on website. |

---

## Custom Field Types

| Code Type | Website Term | Notes |
|-----------|-------------|-------|
| `TEXT` | Text | |
| `TEXTAREA` | Textarea / Multiline Text | |
| `NUMBER` | Number | |
| `DATE` | Date | |
| `SELECT` | Select / Dropdown | |
| `MULTISELECT` | Multi-select | Website says "any data type" which is vague — these are the actual types. |

---

## SSO/Enterprise

| Code Term | Website Term | Notes |
|-----------|-------------|-------|
| SSO (via `ssoDetails`) | SSO / SAML / SCIM | Code maps SSO groups to roles via `adminGroupId`, `selfServiceGroupId`, `baseUserGroupId`. Website lists "SSO / SAML / SCIM" as a Team add-on or Enterprise included feature. |

---

## Key Observations for Auditors

1. **"Workspace" vs. "Organization"**: The code model is `Organization` but the UI and website both say "Workspace." This is intentional and consistent at the user-facing level.
2. **"Personal" vs. "Free"**: Website calls the free tier "Personal." Code calls it `free`. Not a user-facing conflict since users see the marketing name.
3. **"ONGOING" vs. "Checked Out"**: Booking status naming differs between code enum and UI display. The website uses the UI display term.
4. **Bulk actions are extensive**: The code supports 10+ distinct bulk operations. The website mentions bulk actions generically without enumerating them all.
5. **Notes are pervasive but unmarked**: The code supports notes on assets, bookings, locations, audits, and team members. The website doesn't feature notes as a capability.
6. **Visibility overrides are undocumented**: Four org-level settings control what Self-Service and Base users can see (custody, bookings). These aren't documented on the website.
7. **"Non-Registered Members" abbreviation**: Code uses `NRM` internally. Website always spells it out.
