# Shelf Terminology Map

**Generated**: 2026-03-25
**Product repo**: Shelf-nu/shelf.nu @ `41327af`
**Website repo**: Shelf-nu/website-v2 @ `de57476`

This map reconciles how the **code** names things vs. how the **marketing website** names them.

---

## Part 1: Database Models → Website Terms

Every Prisma model in `packages/database/prisma/schema.prisma`, mapped to the website term(s) used for that concept.

| # | Prisma Model | Code Usage | Website Term(s) | Website Location(s) | Notes |
|---|-------------|------------|-----------------|---------------------|-------|
| 1 | `User` | The authenticated user account | User, You | pricing.ts (`1 User`), KB articles | |
| 2 | `UserContact` | Phone, address fields on user profile | (not on website) | — | Internal data; not a marketed feature |
| 3 | `UserBusinessIntel` | Onboarding survey answers (job title, team size, company) | (not on website) | — | Internal analytics |
| 4 | `Asset` | Primary inventory item; fields: title, description, mainImage, status, valuation, availableToBook, sequentialId | Asset, Equipment, Item, Gear, Inventory | Everywhere — features/, solutions/, KB | Website uses synonyms by industry context |
| 5 | `AssetFilterPreset` | Saved filter configurations per user per org | (not on website) | — | Feature exists but not documented |
| 6 | `AssetIndexSettings` | Per-user column visibility, sort, mode (SIMPLE/ADVANCED) | Advanced Asset Index | KB: `advanced-asset-index-complete-guide.mdx`, `how-to-enable-advanced-index.mdx` | |
| 7 | `Category` | Classification with name, description, color | Category, Categories | KB: `using-categories-to-organize-your-asset-inventory.mdx`, pricing.features.ts (`Tags & Categories`) | |
| 8 | `Tag` | Label with name, color; `useFor: ASSET \| BOOKING` | Tag, Tags | KB: `what-is-a-tag-in-shelf-and-what-can-they-be-used-for.mdx`, pricing.features.ts | Tags can apply to both assets AND bookings in code |
| 9 | `Note` | Text note on an asset; type: COMMENT or UPDATE | (not prominently on website) | — | Notes exist in product but not marketed as a feature |
| 10 | `BookingNote` | Text note on a booking; type: COMMENT or UPDATE | Activity Log | KB: `activity-logs-for-bookings.mdx` | Website calls the booking notes feed "Activity Logs" |
| 11 | `LocationNote` | Text note on a location | (not on website) | — | Feature exists but not documented |
| 12 | `AuditNote` | Text note on an audit session | (not explicitly named) | features/audits.mdx mentions "notes and photos during audit" | |
| 13 | `TeamMemberNote` | Admin notes on team member profiles | Admin Notes on Team Members | KB: `admin-notes-on-team-members.mdx` | Brand new feature (Mar 2026) — KB article already exists |
| 14 | `Qr` | QR code entity; linked to asset or kit; has version, errorCorrection | QR Code, QR Label, Asset Label, Asset QR Codes | pricing.features.ts, KB: `understanding-qr-code-swapping-and-management-in-shelf.mdx`, `what-to-do-after-purchasing-assets-tags.mdx` | |
| 15 | `Barcode` | Alternative barcode; value + type (Code128, Code39, etc.); org-scoped unique | Barcode, Alternative Barcode, External Barcode | KB: `alternative-barcodes.mdx`, pricing.features.ts (`Import External Barcodes`) | |
| 16 | `PrintBatch` | Groups QR codes for bulk printing | (not on website) | — | Internal mechanism for label printing |
| 17 | `ReportFound` | Report submitted when someone finds a lost asset via QR scan | (not on website) | — | Lost-and-found feature; not documented |
| 18 | `Scan` | Record of a QR code scan; includes GPS coords, userAgent | Scan, QR Scan | KB: `scanning-an-asset.mdx` | |
| 19 | `Location` | Place with name, address, GPS coords, image; self-referencing parent/children hierarchy | Location, Locations | features/location-tracking.mdx, KB: `sublocations-organize-locations-into-hierarchies.mdx` | |
| 20 | `Role` | System-level role (USER or ADMIN) | (not on website) | — | System admin role, not exposed to users |
| 21 | `TeamMember` | Workspace-scoped identity; may or may not have a linked User | Team Member, User, Non-Registered Member | KB: `onboarding-your-team-members.mdx`, `converting-non-registered-members-nrms-to-users.mdx` | If `userId` is null → NRM |
| 22 | `Custody` | Links a TeamMember to an Asset as custodian | Custody, Asset Custody, Chain of Custody | features/custody.mdx, KB: `custody-feature-for-long-term-equipment-lend-outs.mdx` | |
| 23 | `Organization` | Workspace entity; type: PERSONAL or TEAM; has visibility overrides, addon flags | Workspace, Organization | features/workspaces.mdx, KB: `introduction-to-workspaces.mdx`, `how-to-create-additional-workspaces.mdx` | Code model is `Organization`; UI and website both say "Workspace" |
| 24 | `UserOrganization` | Join table: User ↔ Organization with roles[] | (not on website) | — | Internal join table |
| 25 | `SsoDetails` | SSO config: domain, group→role mappings | SSO, SAML, SCIM | pricing.features.ts (`SSO / SAML / SCIM`), KB: `sso-with-google-workspace.mdx` | |
| 26 | `Tier` | Subscription product (free, tier_1, tier_2, custom) | Plan | pricing.tiers.ts (Personal, Plus, Team, Enterprise) | See Tier ID mapping below |
| 27 | `TierLimit` | Feature gates per tier: canImport, canExport, maxCustomFields, etc. | (pricing table features) | pricing.features.ts | Individual limits surfaced as pricing table rows |
| 28 | `CustomTierLimit` | Custom limits for enterprise users | Enterprise (custom) | pricing.tiers.ts | Has `isEnterprise` flag |
| 29 | `CustomField` | User-defined field on assets; types: TEXT, OPTION, BOOLEAN, DATE, MULTILINE_TEXT, AMOUNT, NUMBER | Custom Field, Custom Fields, Custom Properties | features/asset-pages.mdx, KB: `adding-additional-fields-to-assets.mdx`, `custom-field-types-in-shelf.mdx`, `linking-custom-fields-to-categories.mdx` | |
| 30 | `AssetCustomFieldValue` | Actual value of a custom field on a specific asset | (not named separately) | — | Implementation detail |
| 31 | `Invite` | Workspace invitation; status: PENDING/ACCEPTED/REJECTED/INVALIDATED | Invite, Invitation | KB: `onboarding-your-team-members.mdx`, `inviting-users-via-csv-upload.mdx` | |
| 32 | `Announcement` | System-wide announcements (admin feature) | (not on website) | — | Internal admin tool |
| 33 | `Booking` | Reservation with from/to dates, status, custodian | Booking, Reservation | features/bookings.mdx, KB: `introduction-to-bookings.mdx`, `how-to-create-a-booking.mdx`, solutions/equipment-reservations.mdx | Website uses both "Booking" and "Reservation" |
| 34 | `BookingSettings` | Per-org booking config: buffer time, tags required, max length, auto-archive, explicit checkin | Booking Settings | KB: `working-hours-set-operating-schedules-for-your-workspace.mdx` | |
| 35 | `PartialBookingCheckin` | Records partial asset returns within a booking | Partial Check-in | KB: `partial-check-ins-efficiently-handle-incomplete-returns.mdx` | |
| 36 | `Kit` | Bundle of assets; has name, description, status, category, location | Kit, Kits | features/kits.mdx, KB: `kits.mdx` | |
| 37 | `KitCustody` | Links a TeamMember to a Kit as custodian | Kit Custody | (mentioned in features/custody.mdx context) | |
| 38 | `AssetReminder` | Scheduled alert for an asset; has name, message, alertDateTime, teamMembers | Asset Reminder, Reminder | features/asset-reminders.mdx, KB: `asset-reminders.mdx` | |
| 39 | `WorkingHours` | Per-org weekly schedule (JSON); enabled flag | Working Hours | KB: `working-hours-set-operating-schedules-for-your-workspace.mdx`, pricing.features.ts | |
| 40 | `WorkingHoursOverride` | Date-specific overrides (holidays, closures) | Holiday Override | KB: `working-hours-set-operating-schedules-for-your-workspace.mdx` | Website says "holiday overrides" |
| 41 | `Update` | In-app product update/changelog entry; targeted by role | Updates | Route: `updates.tsx` | Not prominently on website |
| 42 | `UserUpdateRead` | Tracks which users read which updates | (not on website) | — | Internal tracking |
| 43 | `AuditSession` | Audit instance; has scope, status, asset counts, assignments | Audit | features/audits.mdx, KB (no dedicated KB article yet) | |
| 44 | `AuditAssignment` | Links user to audit with role (LEAD or PARTICIPANT) | Auditor, Audit Assignment | features/audits.mdx ("assign auditors") | |
| 45 | `AuditAsset` | Asset within an audit; status: PENDING/FOUND/MISSING/UNEXPECTED | Audit Asset, Found/Missing/Unexpected | features/audits.mdx | |
| 46 | `AuditScan` | Individual scan event within an audit | Audit Scan | features/audits.mdx ("scan workflows") | |
| 47 | `AuditImage` | Photo attached to an audit or audit asset | Audit Photo/Image | features/audits.mdx ("notes and photos") | |
| 48 | `RoleChangeLog` | Audit trail of role changes (who changed whom, when) | (not on website) | — | Internal audit trail |
| 49 | `Image` | Blob storage for location/org images | (not named separately) | — | Infrastructure model |

---

## Part 1b: Enums → Website Terms

Every Prisma enum, mapped to website terminology.

| # | Prisma Enum | Values | Website Term(s) | Notes |
|---|------------|--------|-----------------|-------|
| 1 | `AssetStatus` | `AVAILABLE`, `IN_CUSTODY`, `CHECKED_OUT` | Available, In Custody, Checked Out | Website uses same terms; features/custody.mdx |
| 2 | `AssetIndexMode` | `SIMPLE`, `ADVANCED` | Simple mode, Advanced mode | KB: `advanced-asset-index-complete-guide.mdx` |
| 3 | `TagUseFor` | `ASSET`, `BOOKING` | (not explicit on website) | Website doesn't mention that tags can be booking-scoped |
| 4 | `NoteType` | `COMMENT`, `UPDATE` | Note, System Update | KB: `activity-logs-for-bookings.mdx` distinguishes "Team Notes" from "System Updates" |
| 5 | `BarcodeType` | `Code128`, `Code39`, `DataMatrix`, `ExternalQR`, `EAN13` | Code128, Code39, EAN-13, DataMatrix, QR | KB: `alternative-barcodes.mdx`; website adds "QR codes" to the list. `ExternalQR` in code = external QR codes imported |
| 6 | `ErrorCorrection` | `L`, `M`, `Q`, `H` | (not on website) | QR technical detail |
| 7 | `Currency` | 160+ ISO 4217 codes | (not on website) | Org-level currency setting; not marketed |
| 8 | `InviteStatuses` | `PENDING`, `ACCEPTED`, `REJECTED`, `INVALIDATED` | Pending, Accepted | KB: `onboarding-your-team-members.mdx` shows pending invites UI |
| 9 | `BookingStatus` | `DRAFT`, `RESERVED`, `ONGOING`, `OVERDUE`, `COMPLETE`, `ARCHIVED`, `CANCELLED` | Draft, Reserved, Checked Out, Overdue, Completed/Checked In, Archived, Cancelled | **Key mismatch**: Code says `ONGOING`, UI and website say "Checked Out". Code says `COMPLETE`, website says "Checked In" or "Completed" |
| 10 | `OrganizationType` | `PERSONAL`, `TEAM` | Personal workspace, Team workspace | pricing.features.ts: some features `requiresTeamOrg` |
| 11 | `QrIdDisplayPreference` | `QR_ID`, `SAM_ID` | QR ID, Sequential ID (SAM ID) | KB: `sequential-asset-ids-simplifying-asset-identification.mdx` |
| 12 | `OrganizationRoles` | `OWNER`, `ADMIN`, `BASE`, `SELF_SERVICE` | Owner, Admin, Base, Self-service | pricing.features.ts, KB: `user-roles-and-their-permissions.mdx`, `changing-user-roles-in-shelf.mdx` |
| 13 | `Roles` (system) | `USER`, `ADMIN` | (not on website) | System-level superadmin; not user-facing |
| 14 | `TierId` | `free`, `tier_1`, `tier_2`, `custom` | Personal, Plus, Team, Enterprise | pricing.tiers.ts. **Key mapping**: `free`→Personal, `tier_1`→Plus, `tier_2`→Team, `custom`→Enterprise |
| 15 | `CustomFieldType` | `TEXT`, `OPTION`, `BOOLEAN`, `DATE`, `MULTILINE_TEXT`, `AMOUNT`, `NUMBER` | Text, Option (Select), Yes/No (Boolean), Date, Multiline Text, Currency (Amount), Number | KB: `custom-field-types-in-shelf.mdx`. **Note**: Code says `OPTION`, website may say "Select" or "Dropdown". Code says `BOOLEAN`, website says "Yes/No". Code says `AMOUNT`, website may say "Currency". |
| 16 | `KitStatus` | `AVAILABLE`, `IN_CUSTODY`, `CHECKED_OUT` | Available, In Custody, Checked Out | Same as AssetStatus |
| 17 | `AuditStatus` | `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED` | Pending, Active, Completed, Cancelled | features/audits.mdx |
| 18 | `AuditAssetStatus` | `PENDING`, `FOUND`, `MISSING`, `UNEXPECTED` | Pending, Found, Missing, Unexpected | features/audits.mdx ("found/missing/unexpected detection") |
| 19 | `AuditAssignmentRole` | `LEAD`, `PARTICIPANT` | Lead, Participant | features/audits.mdx ("assign auditors") |
| 20 | `UpdateStatus` | `DRAFT`, `PUBLISHED` | (not on website) | In-app updates system |

---

## Part 1c: Key Model Fields → Website Terms

Important individual fields that have specific website naming.

| Model.Field | Code Name | Website Term | Notes |
|-------------|-----------|-------------|-------|
| `Asset.title` | title | Asset Name, Title | |
| `Asset.valuation` | valuation (mapped to DB column `value`) | Value, Asset Value | pricing.features.ts doesn't mention valuation explicitly |
| `Asset.availableToBook` | availableToBook | Availability, Available to Book | |
| `Asset.sequentialId` | sequentialId | Sequential ID, SAM ID | KB: `sequential-asset-ids-simplifying-asset-identification.mdx` |
| `Asset.mainImage` | mainImage | Photo, Asset Photo | |
| `Asset.status` | status | Asset Status | |
| `Booking.from` / `Booking.to` | from, to | Start Date, End Date / From, To | |
| `Booking.custodianUser` / `custodianTeamMember` | custodian | Custodian | |
| `Booking.cancellationReason` | cancellationReason | Cancellation Reason | |
| `Booking.autoArchivedAt` | autoArchivedAt | Auto-archive | KB mentions auto-archive in booking settings context |
| `Organization.type` | type (PERSONAL/TEAM) | Personal / Team workspace | |
| `Organization.selfServiceCanSeeCustody` | selfServiceCanSeeCustody | (visibility override) | KB: `configure-what-self-service-and-base-users-can-see.mdx` |
| `Organization.selfServiceCanSeeBookings` | selfServiceCanSeeBookings | (visibility override) | KB: `configure-what-self-service-and-base-users-can-see.mdx` |
| `Organization.baseUserCanSeeCustody` | baseUserCanSeeCustody | (visibility override) | KB: `configure-what-self-service-and-base-users-can-see.mdx` |
| `Organization.baseUserCanSeeBookings` | baseUserCanSeeBookings | (visibility override) | KB: `configure-what-self-service-and-base-users-can-see.mdx` |
| `Organization.barcodesEnabled` | barcodesEnabled | Alternative Barcodes (add-on) | |
| `Organization.auditsEnabled` | auditsEnabled | Audits (add-on) | |
| `Organization.usedBarcodeTrial` | usedBarcodeTrial | (7-day free trial tracking) | |
| `Organization.usedAuditTrial` | usedAuditTrial | (7-day free trial tracking) | |
| `Organization.showShelfBranding` | showShelfBranding | Remove Shelf Branding | pricing.features.ts |
| `Organization.customEmailFooter` | customEmailFooter | Custom Email Footer | Settings route: `settings.emails.tsx` |
| `Organization.qrIdDisplayPreference` | qrIdDisplayPreference | QR ID Display Preference | |
| `User.usedFreeTrial` | usedFreeTrial | Free Trial | KB: `free-trial.mdx` |
| `User.tierId` | tierId | Plan, Subscription | |
| `TierLimit.canImportAssets` | canImportAssets | Import Assets (CSV) | pricing.features.ts |
| `TierLimit.canExportAssets` | canExportAssets | Export Assets (CSV) | pricing.features.ts |
| `TierLimit.canImportNRM` | canImportNRM | (Import NRM) | KB: `inviting-users-via-csv-upload.mdx` |
| `TierLimit.canHideShelfBranding` | canHideShelfBranding | Remove Shelf Branding | pricing.features.ts |
| `TierLimit.maxCustomFields` | maxCustomFields | Custom Fields limit | pricing.features.ts: "3 custom fields" (free), "Unlimited" (paid) |
| `TierLimit.maxOrganizations` | maxOrganizations | Workspaces limit | pricing.features.ts |
| `BookingSettings.bufferStartTime` | bufferStartTime | Buffer Time | |
| `BookingSettings.tagsRequired` | tagsRequired | Tags Required | |
| `BookingSettings.maxBookingLength` | maxBookingLength | Maximum Booking Length | |
| `BookingSettings.autoArchiveBookings` | autoArchiveBookings | Auto-Archive Bookings | |
| `BookingSettings.autoArchiveDays` | autoArchiveDays | Auto-Archive Days | |
| `BookingSettings.requireExplicitCheckinForAdmin` | requireExplicitCheckinForAdmin | Explicit Check-in (Admin) | |
| `BookingSettings.requireExplicitCheckinForSelfService` | requireExplicitCheckinForSelfService | Explicit Check-in (Self-Service) | |
| `Location.parentId` | parentId (self-relation) | Sublocation, Parent Location | KB: `sublocations-organize-locations-into-hierarchies.mdx` |
| `CustomField.active` | active | Active/Inactive custom field | |
| `CustomField.required` | required | Required field | |
| `CustomField.options` | options (String[]) | Options (for Select/Multi-select) | |
