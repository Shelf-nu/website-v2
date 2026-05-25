export interface PricingFAQ {
    question: string;
    answer: string;
}

export const pricingFaqs: PricingFAQ[] = [
    {
        question: "What is your pricing?",
        answer: "Shelf offers four plans: Personal (free), Plus ($34/month), Team ($67/month), and Enterprise (custom pricing). The Personal plan is designed for hobbyists and small personal collections. Plus is for power users who need unlimited custom fields and CSV import/export. Team unlocks multi-user collaboration with bookings and reservations. Enterprise adds SSO, dedicated hosting, and custom agreements."
    },
    {
        question: "How is an asset defined?",
        answer: "An asset is any item that you have added to your asset database which has a QR code. This includes physical items like laptops, cameras, tools, vehicles, furniture, and equipment. Consumables (like pens or screws) are typically not tracked as individual assets."
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
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes are reflected in your next billing cycle. You can also switch between monthly and yearly billing to take advantage of our annual discount."
    },
    {
        question: "Do you offer discounts for non-profits?",
        answer: "Yes, we offer special pricing for registered non-profit organizations and educational institutions. Get in touch with our team and we'll work out a plan that fits your budget."
    },
    {
        question: "Will you help us switch to Shelf?",
        answer: "Absolutely. We offer free migration assistance to help you move from spreadsheets, other asset management tools, or any existing system. Our team will help you import your data via CSV and get set up quickly. Just reach out to our support team to get started."
    },
    {
        question: "Is my data secure?",
        answer: "Yes. We use industry-standard TLS/SSL encryption for all data in transit and encryption at rest for stored data. Our Team plan offers SSO as an add-on, and our Enterprise plan includes SSO/SAML, dedicated hosting, and custom security agreements. All plans include automatic upgrades and server maintenance."
    },
    {
        question: "Do you offer a free trial?",
        answer: "Yes, the Team plan comes with a free trial so you can test all collaboration features including bookings, calendar, and unlimited user seats. No credit card is required to start your trial."
    },
    {
        question: "What reports does Shelf include?",
        answer: "Shelf ships with ten built-in operational reports across bookings, assets, and custody — Booking Compliance, Top Booked Assets, Monthly Booking Trends, Overdue Items, Asset Inventory, Asset Activity Summary, Asset Utilization, Idle Assets, Asset Distribution, and Custody Snapshot. Each report has timeframe and filter controls; URL state encodes the filters so views are bookmarkable. Every report exports to CSV and chart-based reports also export to PDF. Reports are included on every plan, including the free Personal plan."
    },
    {
        question: "Is the mobile app included with my plan?",
        answer: "Yes. Shelf Companion for iPhone is free with any Shelf account, including the free Personal plan. Nothing is sold through the app — it's purely a field client for your existing Shelf workspace. Sign in with the credentials you already use on shelf.nu."
    },
    {
        question: "Is there an Android version?",
        answer: "Android is in development. We don't have a release date yet — we'll announce it when it's ready. In the meantime, the Shelf web app works in any modern phone browser, and you can sign up to be notified when the Android app lands at https://www.shelf.nu/mobile-app."
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
