# Shelf FAQ for the ChatGPT Business Agent

These are the 36 questions buyers ask most, taken from Sales deal notes, email threads and Crisp chats (about 225 threads read on 2026-11-11). They're ranked roughly by how often each one came up. Customer names are left out on purpose, because this repo is public.

Every answer was checked on 2026-11-11 against at least one of these:
- the live shelf.nu pages (pricing, terms, security, mobile app, open source, knowledge base)
- the website pricing source in this repo
- the shelf.nu app code on origin/main
- the production plan limits

The section at the end lists what was left out because it couldn't be checked.

---

## Pricing and plans

**1. How much does Shelf cost?**
There are four plans. Personal is free for one user. Plus is 34 USD a month or 190 USD a year, for one user. Team is 67 USD a month or 370 USD a year, with unlimited users. Enterprise is custom-priced. Every plan has unlimited assets. Full details: https://www.shelf.nu/pricing

**2. Do you charge per user or per asset?**
No. The Team plan is one flat price per workspace with unlimited users and unlimited assets. The only per-user price is the SSO add-on.

**3. Is the Team plan enough, or do we need Enterprise?**
Team covers one workspace with unlimited users, bookings, the calendar and the add-ons. Enterprise is for organisations that need SSO included, custom agreements (MSA, DPA, SLA), dedicated single-tenant hosting, compliance documents or a dedicated account manager. To work out which fits, book a demo: https://cal.com/shelf/demo

**4. What does SSO cost?**
SSO is priced per user who signs in through it. On annual billing, per user per month: 9 USD for the first 15 users, 4 USD for users 16 to 50, 1 USD for users 51 to 250, and 0.05 USD from user 251 up. The bands add up, so 20 SSO users cost 1,860 USD a year on top of the plan. On monthly billing, the first 15 users are 15 USD each per month, and the higher bands are annual only. Above roughly 100 users, an unlimited-user licence usually works out cheaper. The team quotes it: https://cal.com/shelf/demo

**5. Which identity providers work with SSO?**
Microsoft Entra, Google Workspace, Okta and other providers that support SAML 2.0. SSO is set up together with the Shelf team on a paid plan. It applies to everyone on your organisation's email domain: once it's on, people on that domain sign in through your identity provider.

**6. Can we get a formal quote or proposal for procurement?**
Yes. Formal quotes, W-9s and vendor registration are supported. Ask through https://cal.com/shelf/demo or support@shelf.nu.

**7. How can we pay? Do you accept purchase orders?**
Card on every paid plan. Annual plans can also be paid by invoice with a PO, by ACH, wire or SEPA transfer.

**8. Monthly or annual billing?**
Both. Annual is cheaper: Team is 370 USD a year instead of 67 USD a month (about 54% less). You can switch between them from your account.

**9. Do you have non-profit or education discounts?**
Registered non-profits, including non-profit schools and universities, get 10% off the Team plan, add-ons and SSO on annual billing. The discount doesn't apply to monthly billing. Contact support@shelf.nu to have it applied.

**10. What does an extra workspace cost?**
Each Team workspace is its own subscription, at 67 USD a month or 370 USD a year. Many organisations run one per site, school or department. People can be invited to several workspaces. Several workspaces can go on one annual invoice. For five or more, or several under one agreement with SSO, talk to the team: https://cal.com/shelf/demo

**11. Does it renew automatically? Can we cancel?**
Subscriptions renew until you cancel. You can cancel or change your plan from your account, and add-ons can be switched off anytime in workspace settings. Payments made after a trial aren't refunded, renewals included (terms, section 14: https://www.shelf.nu/terms).

**12. Can I get a refund?**
Payments made after a trial aren't refunded, and that includes renewals. To test before you pay, use the free plan or the 7-day Team trial.

## Trial and getting started

**13. Is there a free trial? Do I need a credit card?**
Yes. The Team plan has a 7-day free trial with no credit card, and it includes all Team features. The Personal plan is free forever for one user. Sign up: https://app.shelf.nu/join

**14. Can the trial be extended?**
Each account gets one Team trial. If you need more time to evaluate, email support@shelf.nu. The trial can't be reset from inside the app.

**15. Does my data carry over when I start paying?**
Yes. Everything you set up during the trial stays in your workspace when you upgrade. If the trial ends without payment, the workspace pauses until you add payment.

**16. Can I see a demo?**
Yes. Book one at https://cal.com/shelf/demo

**17. How do I bring in our existing asset list?**
Import a CSV file. That's included on Plus, Team and Enterprise (the free plan has no import). The import can create the categories, tags, locations and kits your file mentions. Guides:
- https://www.shelf.nu/knowledge-base/importing-assets-to-shelf-csv-guide
- https://www.shelf.nu/knowledge-base/switching-from-another-asset-tool

**18. Can you migrate us from Cheqroom, Snipe-IT, Asset Panda or a spreadsheet?**
You can do it yourself with CSV import. You can also have the Shelf team do it with Migration Support, a one-time service from 175 USD that moves your data, images and codes. To keep the labels already on your gear, add Alternative Barcodes (question 20).

## Labels, barcodes and scanning

**19. Do you sell QR labels?**
Yes, at https://store.shelf.nu/. You can also print Shelf QR codes yourself: bulk-download them, for example onto Avery sheets (https://www.shelf.nu/knowledge-base/using-shelf-qr-codes-with-avery-label-sheets). Shelf QR codes, printing them and scanning them are included in every plan.

**20. Can we keep the barcodes already on our equipment?**
Yes, with the Alternative Barcodes add-on (18.50 USD a month or 170 USD a year, Team plan). It supports Code128, Code39, EAN-13, DataMatrix and QR codes from another system, so nothing needs re-tagging. Without the add-on, Shelf scans only Shelf's own QR codes.

**21. Can I use a handheld or USB barcode scanner?**
Yes. The web app works with a USB scanner as well as a laptop or phone camera. Setup guide: https://www.shelf.nu/knowledge-base/using-external-barcode-scanners-with-shelf. Scanning barcodes that aren't Shelf QR codes needs Alternative Barcodes.

## Mobile app

**22. Is there a mobile app?**
Yes. Shelf Companion is a native app for iPhone, iPad and Android. It's free with any Shelf account, including the free plan. It scans Shelf QR labels, runs audits (with a note and photo per scan), assigns and releases custody, and creates and checks out bookings.
- App Store: https://apps.apple.com/app/id6765639874
- Google Play: https://play.google.com/store/apps/details?id=com.shelf.companion
- More: https://www.shelf.nu/mobile-app

**23. Do we have to install the app?**
No. The full Shelf web app runs in any modern browser on phones, tablets and computers (Windows, macOS, Linux included), and you can add it to your home screen. The app is optional.

## Product

**24. How do kits work?**
A kit groups assets that travel together, for example a camera body, lenses and a tripod. A kit has its own QR code, can be booked and checked out as one, and its assets share one custodian. Kits can't contain other kits.

**25. What user roles are there?**
Five: Owner, Administrator, Manager, Self-service and Base.
- Self-service users book equipment and check it out and in for themselves only.
- Base users browse and request bookings, and an administrator or manager hands the gear over.
- Managers run everyone's bookings, custody and audits.
Details: https://www.shelf.nu/knowledge-base/user-roles-and-their-permissions

**26. Can admins approve bookings before gear goes out?**
Base users submit booking requests, and an administrator or manager completes the hand-off. You can also require admins or self-service users to scan or select each item at check-out and check-in.

**27. Can we set booking rules?**
Yes, on the Team plan. You can set:
- a maximum booking length
- a minimum notice time before a booking can start
- working hours
- automatic archiving of finished bookings
- who gets booking emails

**28. Is there a calendar or availability view?**
Yes, on the Team plan: a booking calendar with day, week and month views. Bookings can also be added to Google Calendar, Outlook or Apple Calendar as a one-way, read-only feed.

**29. Can we track consumables or quantities?**
Yes. A quantity-tracked item holds a count (cables, batteries, drinks). You can book it by quantity, and what's used comes off stock at check-in. Set a minimum and owners and admins get an email when stock drops to it. Guide: https://www.shelf.nu/knowledge-base/quantity-tracked-assets-and-consumables

**30. What reports are there? Can we export?**
There are eleven built-in reports, for example Overdue Items, Asset Utilization, Idle Assets, Custody Snapshot and Booking Compliance. Every report exports to CSV, and chart-based reports also export to PDF. Reports come with Plus and Team, for owners and administrators. Assets also export to CSV on paid plans.

**31. How many custom fields can we add?**
Three on the free plan, and up to 100 on Plus and Team. The types are text, multi-line text, number, amount, yes/no, date and option lists. Fields can be required and linked to categories.

**32. Can we attach photos and documents to an asset?**
Each asset has one image. Shelf doesn't store document attachments such as manuals or warranty files on an asset. You can record details like warranty dates in custom fields, and set an asset reminder for a date.

**33. Does Shelf do maintenance work orders?**
No. Shelf has no work-order system. Asset reminders send emails for set dates like an inspection, calibration or service, and they can repeat on paid plans.

## Integrations, hosting and security

**34. Is there an API or integrations?**
Shelf doesn't offer a documented public API today. Data moves in and out through CSV import and export, and bookings can feed into calendar apps. For a specific integration need, email support@shelf.nu.

**35. Is Shelf open source? Can we self-host?**
Yes. The platform is open source under AGPL-3.0 (https://github.com/Shelf-nu/shelf.nu) and can be self-hosted with Docker, PostgreSQL and Supabase. Connecting the Companion app to a self-hosted server needs a separate paid licence from Shelf. For self-hosting help or pricing: https://cal.com/shelf/demo

**36. Where is our data stored? Are you SOC 2 certified?**
In the Shelf cloud, data is stored in the EU (Frankfurt, Germany), and the application servers are in Amsterdam, the Netherlands. Data is encrypted in transit and at rest. Shelf isn't yet SOC 2 or ISO 27001 certified (https://www.shelf.nu/security). If your data must stay on your own infrastructure, self-hosting is the option. For security questionnaires, a DPA, or HECVAT and VPAT documents for US education, book a demo or email support@shelf.nu.

---

## Left out on purpose (couldn't be checked, or not for public answers)

- **Offline use.** Code and past replies disagree: the Companion app has some offline audit handling, but there's no clear statement of what works offline. Answer only after checking with the CTO.
- **CSV import size limits.** No published limit was found.
- **MFA / two-factor sign-in.** Sign-in uses email codes, but no MFA claim was checked.
- **Onboarding length.** Any figure would be a made-up timeline.
- **Extended Support and Enterprise support packages, and the unlimited SSO price.** These are sales-quoted and not published on shelf.nu. The repo is public, so the unlimited price stays out.
- **Label sizes, prices and shipping.** These come from the Shopify feed, never from typed text.
- **Languages.** Not verified, so it's left out.
- **Digital signatures at checkout.** Old notes and the KB disagree with the code (the code has no agreement or signature model). Left out.
