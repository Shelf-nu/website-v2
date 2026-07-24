export interface PricingFAQ {
    question: string;
    answer: string;
}

export const pricingFaqs: PricingFAQ[] = [
    {
        question: "What is your pricing?",
        answer: "Shelf offers four plans: Personal (free), Plus ($34/month), Team ($67/month), and Enterprise (custom pricing). The Personal plan is designed for hobbyists and small personal collections. Plus is for power users who need unlimited custom fields and CSV import/export. Team unlocks multi-user collaboration with bookings and reservations. Enterprise adds SSO/SAML, dedicated hosting, custom agreements, and compliance documentation."
    },
    {
        question: "How is an asset defined?",
        answer: "An asset is any item you add to your workspace — laptops, cameras, tools, vehicles, furniture, equipment. Labels are optional: use Shelf QR codes or keep existing barcodes with the Alternative Barcodes add-on. Consumables (like pens or screws) are typically not tracked as individual assets. Every plan includes unlimited assets."
    },
    {
        question: "What does the free plan include?",
        answer: "The Personal plan is free forever — no time limit and no credit card required. It includes unlimited assets, locations, tags, and categories, plus assign custody, kits, and QR code generation. You get 3 custom fields to start. It's designed for personal asset management and small collections."
    },
    {
        question: "Do you charge for team seats?",
        answer: "On the Team plan, user seats are unlimited and included in the base price. You can invite as many team members as you need without per-seat charges. The only seat-based pricing applies to the SSO add-on and Enterprise agreements."
    },
    {
        question: "Do you charge per asset tracked?",
        answer: "No. All Shelf plans include unlimited assets. We believe asset tracking should scale with your needs without penalizing growth. Our goal is to help teams track over 1 billion assets worldwide."
    },
    {
        question: "What does the SSO add-on cost?",
        answer: "SSO (SAML — works with Microsoft Entra, Google Workspace, and other identity providers) is a paid add-on on the Team plan, priced per SSO user. On annual billing: $9/user/mo for the first 15 users, $4/user/mo for users 16–50, $1/user/mo for users 51–250, and $0.05/user/mo beyond 250. (Monthly billing is available at higher per-user rates.) Example: 20 SSO users ≈ $1,860/year on top of your plan. Automatic user provisioning is included with SSO at no extra charge. SSO applies to all users in the workspace. For large organizations we also offer an unlimited-user SSO option — contact us for a quote. Regular username/password users are always unlimited and included in the Team plan."
    },
    {
        question: "What add-ons are available?",
        answer: "Add-ons extend any Team workspace and can be turned on or off anytime from your workspace settings — you're never locked in. Audits ($37/mo or $205/yr): scan your inventory against what should be there and instantly see found, missing, and unexpected items. Alternative Barcodes ($170/yr): keep the labels already on your assets instead of re-tagging. If you add one mid-cycle on annual billing, you are only charged a prorated amount for the time remaining until your renewal."
    },
    {
        question: "Can we run multiple workspaces?",
        answer: "Yes. Each Team workspace is its own subscription at $67/month or $370/year — many organizations run one workspace per school, site, department, or client. Team members can be invited to multiple workspaces, so one person can work across all of them. Need several workspaces on a single annual invoice or PO? We do that — just ask. Running five or more workspaces, or want them under one agreement with SSO? Contact us — that is what our Enterprise agreements are for."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes are reflected in your next billing cycle. You can also switch between monthly and yearly billing to take advantage of our annual discount."
    },
    {
        question: "Do you offer non-profit or education discounts?",
        answer: "Yes. Registered non-profit organizations — including non-profit schools and universities — get 10% off the Team plan, all add-ons, and SSO when billed annually. The discount applies to annual billing only, not monthly. Contact us with your organization details and we will apply it to your subscription."
    },
    {
        question: "Can we pay by invoice or purchase order?",
        answer: "Yes. All paid plans can be paid by card. Annual plans can also be paid by invoice with a PO — via ACH, wire, or SEPA bank transfer. We support formal quotes, W9s, and vendor registration for procurement teams."
    },
    {
        question: "Will you help us switch to Shelf?",
        answer: "Yes. Every paid plan and trial includes free help importing your data via CSV — we will review your file, help with field mapping, and get you set up. If you want us to do the migration for you — data, images, and codes moved into Shelf — one-time Migration Support starts at $175. And if your assets are already labeled from another system, the Alternative Barcodes add-on lets you keep those labels with no re-tagging."
    },
    {
        question: "Is my data secure?",
        answer: "Yes. We use industry-standard TLS/SSL encryption for all data in transit and encryption at rest for stored data. Our Team plan offers SSO as an add-on, and our Enterprise plan includes SSO/SAML, dedicated hosting, and custom security agreements. All plans include automatic upgrades and server maintenance."
    },
    {
        question: "Do you offer a free trial?",
        answer: "Yes — the Team plan comes with a free 7-day trial. No credit card required. The trial includes all Team features, and add-ons like Audits and Alternative Barcodes are free to enable during the trial so you can test your full setup. (SSO is the exception — it is set up together with our team on a paid plan.) Evaluating with a larger team or going through procurement and need more time? Contact us — we're happy to extend your trial. Everything you set up during the trial stays in your workspace when you upgrade."
    },
    {
        question: "What reports does Shelf include?",
        answer: "Shelf ships with ten built-in operational reports across bookings, assets, and custody — Booking Compliance, Top Booked Assets, Monthly Booking Trends, Overdue Items, Asset Inventory, Asset Activity Summary, Asset Utilization, Idle Assets, Asset Distribution, and Custody Snapshot. Each report has timeframe and filter controls; URL state encodes the filters so views are bookmarkable. Every report exports to CSV and chart-based reports also export to PDF. Reports are included on every plan, including the free Personal plan."
    },
    {
        question: "Do I have to install the Shelf Companion app to use Shelf?",
        answer: "No — the app is optional, not required. You have three ways to use Shelf on your phone: (1) the Shelf web app in any modern phone browser, with full access to bookings, custody, audits, and everything else; (2) install the web app as a Progressive Web App (PWA) on your home screen for a native-feeling icon and fullscreen experience, no App Store needed; or (3) Shelf Companion — an optional native app for iPhone and Android, focused on field workflows. Many teams use a mix. Same workspace, same data, same login on every path."
    },
    {
        question: "Is the mobile app included with my plan?",
        answer: "Yes. Shelf Companion (iPhone and Android) is free with any Shelf account, including the free Personal plan. Nothing is sold through the app — it's purely an optional field client for your existing Shelf workspace. Sign in with the credentials you already use on shelf.nu."
    },
    {
        question: "Is there an Android version?",
        answer: "Yes — Shelf Companion is now live on Google Play, free with any Shelf account. You can also use the Shelf web app in any modern phone browser (Android included), or install it as a PWA on the home screen. Get it at https://play.google.com/store/apps/details?id=com.shelf.companion."
    },
    {
        question: "Do I need a separate login for the mobile app?",
        answer: "No. The app connects to your existing Shelf workspace using the same login, the same organizations, and the same permissions as the web app. There is no separate mobile account."
    },
    {
        question: "Can I capture audit evidence (photos, notes) from the mobile app?",
        answer: "Not yet on iOS. Adding notes or photos during an audit scan is currently web-only — the capability is on our roadmap for a future release of the iOS app. You can still run, complete, and review audits from the app today; the per-scan evidence step happens on the web for now."
    }
];
