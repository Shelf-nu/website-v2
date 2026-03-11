import {
  type LucideIcon,
  DollarSign,
  Smartphone,
  Code2,
  CalendarDays,
  Package,
  Users,
  Zap,
  QrCode,
} from "lucide-react";

/** Advantage category — icon + label for each competitive dimension */
export interface AdvantageType {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** All advantage types Shelf can claim over competitors */
const advantageTypes: Record<string, AdvantageType> = {
  "lower-cost": {
    id: "lower-cost",
    label: "Lower cost",
    icon: DollarSign,
  },
  "transparent-pricing": {
    id: "transparent-pricing",
    label: "Transparent pricing",
    icon: DollarSign,
  },
  "flat-pricing": {
    id: "flat-pricing",
    label: "Flat pricing",
    icon: DollarSign,
  },
  "modern-ux": {
    id: "modern-ux",
    label: "Modern UX",
    icon: Smartphone,
  },
  "open-source": {
    id: "open-source",
    label: "Open source",
    icon: Code2,
  },
  bookings: {
    id: "bookings",
    label: "Built-in bookings",
    icon: CalendarDays,
  },
  "kit-tracking": {
    id: "kit-tracking",
    label: "Kit tracking",
    icon: Package,
  },
  "unlimited-users": {
    id: "unlimited-users",
    label: "Unlimited users",
    icon: Users,
  },
  "faster-setup": {
    id: "faster-setup",
    label: "Faster setup",
    icon: Zap,
  },
  "qr-first": {
    id: "qr-first",
    label: "QR-first",
    icon: QrCode,
  },
  "no-hardware": {
    id: "no-hardware",
    label: "No hardware needed",
    icon: QrCode,
  },
};

/** Per-competitor advantage mapping — 2-3 advantage IDs per competitor slug */
const competitorAdvantages: Record<string, string[]> = {
  "snipe-it": ["modern-ux", "bookings", "kit-tracking"],
  cheqroom: ["transparent-pricing", "unlimited-users", "open-source"],
  "asset-panda": ["lower-cost", "unlimited-users", "faster-setup"],
  sortly: ["bookings", "unlimited-users", "open-source"],
  upkeep: ["lower-cost", "faster-setup", "open-source"],
  "asset-guru": ["transparent-pricing", "faster-setup", "open-source"],
  "asset-infinity": ["transparent-pricing", "modern-ux", "open-source"],
  "asset-tiger": ["bookings", "kit-tracking", "open-source"],
  "blue-tally": ["open-source", "kit-tracking", "bookings"],
  "brite-check": ["bookings", "kit-tracking", "open-source"],
  ezofficeinventory: ["flat-pricing", "unlimited-users", "open-source"],
  gocodes: ["flat-pricing", "bookings", "kit-tracking"],
  hardcat: ["faster-setup", "modern-ux", "transparent-pricing"],
  hector: ["flat-pricing", "open-source", "modern-ux"],
  itemit: ["lower-cost", "no-hardware", "open-source"],
  limble: ["lower-cost", "faster-setup", "open-source"],
  "share-my-toolbox": ["lower-cost", "open-source", "kit-tracking"],
  timly: ["lower-cost", "no-hardware", "open-source"],
  wasp: ["modern-ux", "faster-setup", "open-source"],
  webcheckout: ["modern-ux", "qr-first", "open-source"],
};

/** Resolve advantage IDs to full AdvantageType objects for a competitor */
export function getCompetitorAdvantages(slug: string): AdvantageType[] {
  const ids = competitorAdvantages[slug];
  if (!ids) return [];
  return ids.map((id) => advantageTypes[id]).filter(Boolean);
}
