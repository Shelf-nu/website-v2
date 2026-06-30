import { LucideIcon, Box, Boxes, Users, Layers, BarChart2, BarChart3, RefreshCw, CheckSquare, MapPin, CalendarDays, Search, FileText, ClipboardCheck } from "lucide-react";

export const featureIcons: Record<string, LucideIcon> = {
    "workspaces": Box,
    "custody": Users,
    "bookings": Layers,
    "consumables-tracking": Boxes,
    "dashboard": BarChart2,
    "location-tracking": MapPin,
    "asset-reminders": RefreshCw,
    "kits": CheckSquare,
    "calendar": CalendarDays,
    "asset-search": Search,
    "asset-pages": FileText,
    "audits": ClipboardCheck,
    "reports": BarChart3,
};
