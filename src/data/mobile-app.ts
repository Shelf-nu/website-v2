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
            "Walk through audit checklists on-site — scan assets, mark found or unexpected, complete audits with offline persistence.",
        icon: ClipboardCheck,
    },
    {
        title: "Custody Management",
        description:
            "Assign or release asset custody in bulk right from the field — hand off equipment with a few taps.",
        icon: Users,
    },
    {
        title: "Booking Checkout & Checkin",
        description:
            "Check out reserved equipment to team members, or check items back in — full or partial.",
        icon: CalendarCheck,
    },
    {
        title: "Live Dashboard",
        description:
            "See asset counts, active bookings, overdue items, and status breakdowns at a glance.",
        icon: BarChart2,
    },
    {
        title: "Scan Without Wi-Fi",
        description:
            "Audit scans are saved to your device and sync when you're back online. No signal on the job site? Keep scanning — your work won't be lost.",
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
        question: "When will the app be available?",
        answer: "We're currently in closed beta testing. iOS TestFlight access comes first, with Android following shortly after. Join the waitlist to be notified when it's your turn.",
    },
    {
        question: "Do I need a Shelf account?",
        answer: "Yes. The app connects to your existing Shelf workspace — same login, same organizations, same data.",
    },
    {
        question: "Will it work offline?",
        answer: "Audit scanning works without a connection — scans are saved to your device and sync when you reconnect. Other actions (custody, bookings, asset creation) require an internet connection.",
    },
    {
        question: "Is it free?",
        answer: "The mobile app is included with Shelf Team and Business plans at no extra cost. Free-tier access details will be announced closer to launch.",
    },
    {
        question: "Can I manage my whole organization from the app?",
        answer: "The app is purpose-built for field operations — scanning, audits, custody, bookings. Admin tasks like user management, bulk imports, custom fields, and reporting stay on the web app. They work together.",
    },
    {
        question: "Will it be available on Android?",
        answer: "Yes! Android is confirmed. iOS beta launches first, with Android following shortly after. We know this is highly requested — it's a top priority.",
    },
];
