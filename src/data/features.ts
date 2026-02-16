import { Box, Users, Layers, BarChart2, Smartphone, RefreshCw, CheckSquare } from "lucide-react";

export const productFeatures = [
    {
        title: "Workspaces",
        description: "Organize assets by team or location.",
        icon: Box,
        href: "/features/workspaces"
    },
    {
        title: "Custody & Checkouts",
        description: "Track who has what, when, and where.",
        icon: Users,
        href: "/features/custody"
    },
    {
        title: "Bookings",
        description: "Reserve equipment in advance.",
        icon: Layers,
        href: "/features/bookings"
    },
    {
        title: "Dashboard",
        description: "Real-time insights at a glance.",
        icon: BarChart2,
        href: "/features/dashboard"
    },
    {
        title: "Location Tracking",
        description: "Pinpoint assets on a map.",
        icon: Smartphone,
        href: "/features/location-tracking"
    },
    {
        title: "Asset Reminders",
        description: "Never miss a maintenance deadline.",
        icon: RefreshCw,
        href: "/features/asset-reminders"
    },
    {
        title: "Kits",
        description: "Bundle items for quick checkout.",
        icon: CheckSquare,
        href: "/features/kits"
    },
    {
        title: "Mobile App",
        description: "Scan tags and manage on the go.",
        icon: Smartphone,
        href: "/features/mobile-app"
    }
];
