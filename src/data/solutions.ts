import { LucideIcon, Link as LinkIcon, Settings, Code2, BarChart2, Layers, BookOpen, Smartphone, ArrowLeftRight, Home } from "lucide-react";

export const solutionIcons: Record<string, LucideIcon> = {
    "asset-tracking": LinkIcon,
    "tool-tracking": Settings,
    "it-asset-management": Code2,
    "fixed-asset-tracking": BarChart2,
    "equipment-reservations": Layers,
    "educational-resource-management": BookOpen,
    "camera-equipment-check-out": Smartphone,
    "equipment-check-in": ArrowLeftRight,
    "mobile-asset-auditing": Smartphone,
    "home-inventory-management": Home,
};

export const solutions = [
    {
        title: "Asset Tracking",
        description: "Universal tracking for any item.",
        icon: LinkIcon,
        href: "/solutions/asset-tracking"
    },
    {
        title: "Tool Tracking",
        description: "Manage construction & trade tools.",
        icon: Settings,
        href: "/solutions/tool-tracking"
    },
    {
        title: "IT Asset Management",
        description: "Track laptops, servers, and software.",
        icon: Code2,
        href: "/solutions/it-asset-management"
    },
    {
        title: "Fixed Asset Tracking",
        description: "Depreciation and lifecycle management.",
        icon: BarChart2,
        href: "/solutions/fixed-asset-tracking"
    },
    {
        title: "Equipment Reservations",
        description: "Streamline lending libraries.",
        icon: Layers,
        href: "/solutions/equipment-reservations"
    },
    {
        title: "Education",
        description: "Resources for schools & universities.",
        icon: BookOpen,
        href: "/solutions/educational-resource-management"
    },
    {
        title: "Media & AV",
        description: "Check-out workflows for studios.",
        icon: Smartphone,
        href: "/solutions/camera-equipment-check-out"
    },
    {
        title: "Equipment Check-In/Out",
        description: "QR-based lending workflows.",
        icon: ArrowLeftRight,
        href: "/solutions/equipment-check-in"
    },
    {
        title: "Mobile Auditing",
        description: "Audit assets from any device.",
        icon: Smartphone,
        href: "/solutions/mobile-asset-auditing"
    },
    {
        title: "Home Inventory",
        description: "Track household items with QR tags.",
        icon: Home,
        href: "/solutions/home-inventory-management"
    }
];
