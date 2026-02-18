export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    price: string; // Default display price (usually monthly)
    priceMonthly: string;
    priceYearly: string; // Display price when billed yearly (e.g. "$49" meaning $49/mo)
    period?: string;
    billing: "monthly" | "custom";
    cta: string;
    href: string;
    secondaryCta?: {
        text: string;
        href: string;
    };
    variant: "default" | "outline";
    popular?: boolean;
    limits: {
        assets: string;
        users: string;
    };
    features: {
        mobileApp: boolean;
        qrCodes: "basic" | "custom";
        custody: boolean;
        fixedPeriodCheckout: boolean;
        bookings: boolean;
        bookingCalendar: boolean;
        maintenanceSchedules: boolean;
        emailSupport: boolean;
        sso: "none" | "add-on" | "included";
        accountManager: boolean;
        sla: boolean;
    };
}

export const pricingPlans: PricingPlan[] = [
    {
        id: "free",
        name: "Personal",
        price: "$0",
        priceMonthly: "$0",
        priceYearly: "$0",
        description: "For private collectors or small businesses.",
        billing: "monthly",
        cta: "Get Started",
        href: "https://app.shelf.nu/register?utm_source=shelf_website&utm_medium=cta&utm_content=pricing_card_free_signup",
        variant: "outline",
        limits: {
            assets: "Unlimited",
            users: "1 User"
        },
        features: {
            mobileApp: true,
            qrCodes: "basic",
            custody: true,
            fixedPeriodCheckout: false,
            bookings: false,
            bookingCalendar: false,
            maintenanceSchedules: false,
            emailSupport: false,
            sso: "none",
            accountManager: false,
            sla: false
        }
    },
    {
        id: "plus",
        name: "Plus",
        price: "$34",
        priceMonthly: "$34",
        priceYearly: "$190",
        period: "/month",
        description: "Perfect for power users.",
        billing: "monthly",
        cta: "Buy Now",
        href: "https://app.shelf.nu/register?plan=plus&utm_source=shelf_website&utm_medium=cta&utm_content=pricing_card_plus_signup",
        variant: "default",
        popular: false,
        limits: {
            assets: "Unlimited",
            users: "1 User"
        },
        features: {
            mobileApp: true,
            qrCodes: "custom",
            custody: true,
            fixedPeriodCheckout: false,
            bookings: false,
            bookingCalendar: false,
            maintenanceSchedules: true,
            emailSupport: true,
            sso: "none",
            accountManager: false,
            sla: false
        }
    },
    {
        id: "team",
        name: "Team",
        price: "$67",
        priceMonthly: "$67",
        priceYearly: "$370",
        period: "/month",
        description: "Perfect for businesses.",
        billing: "monthly",
        cta: "Start Free Trial",
        href: "https://app.shelf.nu/register?plan=team&trial=true&utm_source=shelf_website&utm_medium=cta&utm_content=pricing_card_team_signup",
        secondaryCta: {
            text: "Buy Now",
            href: "https://app.shelf.nu/register?plan=team&utm_source=shelf_website&utm_medium=cta&utm_content=pricing_card_team_buy"
        },
        variant: "default",
        popular: true,
        limits: {
            assets: "Unlimited",
            users: "Unlimited"
        },
        features: {
            mobileApp: true,
            qrCodes: "custom",
            custody: true,
            fixedPeriodCheckout: true,
            bookings: true,
            bookingCalendar: true,
            maintenanceSchedules: true,
            emailSupport: true,
            sso: "add-on",
            accountManager: false,
            sla: false
        }
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        priceMonthly: "Custom",
        priceYearly: "Custom",
        description: "Perfect for large organizations.",
        billing: "custom",
        cta: "Get a demo",
        href: "/demo?utm_source=shelf_website&utm_medium=cta&utm_content=pricing_card_enterprise_demo",
        variant: "outline",
        limits: {
            assets: "Unlimited",
            users: "Unlimited"
        },
        features: {
            mobileApp: true,
            qrCodes: "custom",
            custody: true,
            fixedPeriodCheckout: true,
            bookings: true,
            bookingCalendar: true,
            maintenanceSchedules: true,
            emailSupport: true,
            sso: "included",
            accountManager: true,
            sla: true
        }
    }
];
