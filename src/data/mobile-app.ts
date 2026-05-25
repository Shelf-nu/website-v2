import {
    QrCode,
    ClipboardCheck,
    Users,
    CalendarCheck,
    BarChart2,
    WifiOff,
    type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Feature cards                                                      */
/* ------------------------------------------------------------------ */

export interface MobileAppFeature {
    title: string;
    description: string;
    icon: LucideIcon;
}

export const mobileAppFeatures: MobileAppFeature[] = [
    {
        title: "QR & Barcode Scanning",
        description:
            "Scan Shelf QR labels and standard barcodes (Code128, EAN-13, DataMatrix) to instantly pull up any asset.",
        icon: QrCode,
    },
    {
        title: "Field Audits",
        description:
            "Walk an audit on-site — scan assets, watch found/expected counts update in real time, see urgency surface as you go, complete the audit when done.",
        icon: ClipboardCheck,
    },
    {
        title: "Custody Management",
        description:
            "Assign or release asset custody right from the field — hand off equipment to a teammate with a few taps.",
        icon: Users,
    },
    {
        title: "Booking Checkout & Checkin",
        description:
            "Check booked equipment out to team members, or check items back in when they return.",
        icon: CalendarCheck,
    },
    {
        title: "Live Dashboard",
        description:
            "See asset counts, active bookings, overdue items, and status breakdowns at a glance.",
        icon: BarChart2,
    },
    {
        title: "Built for the Floor",
        description:
            "Tap a Shelf QR with the phone camera and jump straight to the asset. Walk, scan, act — the app is built for moments away from the desk.",
        icon: WifiOff,
    },
];

/* ------------------------------------------------------------------ */
/*  Built-for comparison columns                                       */
/* ------------------------------------------------------------------ */

export const builtForApp = [
    "Field audits and inventory walks",
    "Scanning QR codes and barcodes on-site",
    "Quick asset lookups and status checks",
    "Custody handoffs between team members",
    "Booking checkout/checkin at the point of use",
    "On-the-go dashboard monitoring",
];

export const bestOnWeb = [
    "Creating and configuring audits",
    "Adding notes or photos to an audit scan",
    "Bulk asset imports and complex edits",
    "Custom field setup and administration",
    "User/role management and permissions",
    "Reporting, analytics, and exports",
    "Integrations (Slack, webhooks, etc.)",
];

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

export interface MobileAppFAQ {
    question: string;
    answer: string;
}

export const mobileAppFaqs: MobileAppFAQ[] = [
    {
        question: "Where can I get the app?",
        answer: "Shelf Companion for iPhone is live on the App Store. Search for \"Shelf Companion\" or download it directly from https://apps.apple.com/app/id6765639874. Sign in with your existing Shelf account.",
    },
    {
        question: "Do I need a Shelf account?",
        answer: "Yes. The app connects to your existing Shelf workspace — same login, same organizations, same data, same permissions. You don't create a separate account.",
    },
    {
        question: "Is it free?",
        answer: "Yes. The app is free with any Shelf account, including the free tier. Nothing is sold through the app. Pricing for the web platform stays exactly the same.",
    },
    {
        question: "Will it be available on Android?",
        answer: "Android is in development. We don't have a release date yet. We'll announce it when it's ready — you can sign up below to get notified.",
    },
    {
        question: "Can I capture audit evidence (photos, notes) from the app?",
        answer: "Not yet on iOS. Adding notes or photos during an audit scan is currently web-only. The capability is on our roadmap for a future release of the iOS app. You can still run, complete, and review audits from the app today — the per-scan evidence step happens on the web for now.",
    },
    {
        question: "Can I manage my whole organization from the app?",
        answer: "The app is purpose-built for field operations — scanning, audits, custody, bookings. Admin tasks like user management, bulk imports, custom fields, and reporting stay on the web app. They work together.",
    },
];
