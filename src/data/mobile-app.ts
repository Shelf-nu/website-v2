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
            "Walk an audit on-site — scan assets, watch found/expected counts update in real time, attach a condition note or photo to any scan and read them back later, take a mis-scan back off, and complete the audit when done. Scanned rows say where each asset lives, and anything the audit did not expect is counted separately.",
        icon: ClipboardCheck,
    },
    {
        title: "Custody Management",
        description:
            "Assign or release asset custody right from the field — hand off equipment to a teammate with a few taps.",
        icon: Users,
    },
    {
        title: "Bookings, End to End",
        description:
            "Create, edit, and reserve bookings from the phone with availability-aware asset, kit, and model pickers, then scan the actual units to assign and check out, and record what comes back on return. Read the month as a calendar or the week as a list.",
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
    "Adding notes and photos to an audit scan, and reading them back on the asset",
    "Scanning QR codes and barcodes on-site",
    "Quick asset lookups and status checks",
    "Custody handoffs between team members",
    "Creating, editing, and checking bookings in and out at the point of use",
    "Reading a month of bookings as a calendar and creating one on the day you tapped",
    "Scanning reserved models into a booking to assign and check out",
    "Claiming a brand new QR label into the workspace (admins and owners)",
    "Taking a mis-scan back off a live audit, without losing the notes and photos on it",
    "Signing in against your organization's own Shelf server instead of Shelf Cloud",
    "Correcting stock counts on the shelf, with a reason attached",
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
        question: "Do I have to install the Shelf Companion app to use Shelf?",
        answer: "No — the app is optional, not required. You have three ways to use Shelf on your phone: (1) the Shelf web app in any modern phone browser, with full access to bookings, custody, audits, and everything else; (2) install the web app as a Progressive Web App (PWA) on your home screen for a native-feeling icon and fullscreen experience, no App Store needed; or (3) Shelf Companion — an optional native app for iPhone and Android, focused on field workflows like scanning, audits, and custody handoffs. Many teams use a mix: admins on the web, field crews on the Companion app. Same workspace, same data, same login on every path.",
    },
    {
        question: "Where can I get the app?",
        answer: "Shelf Companion is live on the App Store (iPhone) and Google Play (Android). Search for \"Shelf Companion\", or download directly — iOS: https://apps.apple.com/app/id6765639874 · Android: https://play.google.com/store/apps/details?id=com.shelf.companion. Sign in with your existing Shelf account.",
    },
    {
        question: "Can I use the app with a self-hosted Shelf server?",
        answer: "Yes, from version 1.5.0. Tap \"Connect to a private server\" on the sign-in screen and enter your organization's domain — the field takes your work email, your company's domain, or your Shelf server address. The app then points itself at your instance, and you sign in with your password or your company's single sign-on against your own server. Two things have to be true first: Shelf has to register your domain (that is a change on Shelf's side and needs no new app build), and your instance has to be reachable from the phone over HTTPS. A domain Shelf has not registered is refused rather than quietly sent to Shelf Cloud. You can return to Shelf Cloud at any time from the sign-in screen or from Settings. See: /knowledge-base/connect-shelf-companion-to-your-own-server",
    },
    {
        question: "Can I correct a scan I did not mean to make during an audit?",
        answer: "Yes, from version 1.5.0. Tap the scanned row to open its notes and photos, then tap Remove scan at the foot of the sheet and confirm. An asset the audit expected goes back to Not scanned; an asset that was never on the list leaves the audit, because nothing but the scan put it there. The counts recount from the rows. Notes and photos you already attached stay on the audit, because evidence hangs off the audit's row for the asset rather than off the scan. A Completed or Cancelled audit refuses the change, on the phone and on the web alike.",
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
        question: "Is it available on Android?",
        answer: "Yes — Shelf Companion is now live on Google Play, free with any Shelf account. You can also use Shelf in any Android phone browser, or install it as a PWA on your home screen.",
    },
    {
        question: "Can I capture audit evidence (photos, notes) from the app?",
        answer: "Yes. Each scanned row during an audit carries an Add photo/note action — tap it to write a condition note and attach a photo taken with the camera or picked from your photo library. Once a row holds evidence, the action becomes a count of what it carries, and rows on the audit's asset list say what they hold (\"1 note, 2 photos\") and open the full record: every note and photo, with who recorded it and when. Notes and photos are counted separately. Everything lands on the same audit record you see on the web.",
    },
    {
        question: "Does the app track my location?",
        answer: "Not continuously, and never in the background. The app can attach the phone's location to a QR scan, so an asset's record shows where it was last seen. That is the same thing the web scanner has always done with the browser's location. It asks once, the first time you open the scanner, and declining changes nothing else: scanning keeps working, the scans just carry no coordinates. Location is only read while the app is open, never in the background, and it is never used for advertising or shared with third parties. See the Mobile Application section of our privacy policy for the full disclosure.",
    },
    {
        question: "Can I manage my whole organization from the app?",
        answer: "The app is purpose-built for field operations — scanning, audits, custody, bookings. Admin tasks like user management, bulk imports, custom fields, and reporting stay on the web app. They work together.",
    },
];
