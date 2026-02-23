"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

import {
    Menu,
    X,
    BarChart2,
    Link as LinkIcon,
    Users,
    CheckSquare,
    Settings,
    BookOpen,
    FileText,
    Code2,
    Layers,
    Box,
    RefreshCw,
    Smartphone,
    ArrowRight,
    Wrench,
} from "lucide-react";
import { useState, useEffect, startTransition } from "react";
import {
    AnimatePresence,
    motion,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

import { TopBanner } from "@/components/layout/top-banner";
import { SearchDialog } from "@/components/search/search-dialog";

/* ------------------------------------------------------------------ */
/*  ListItem                                                           */
/* ------------------------------------------------------------------ */

const ListItem = React.forwardRef<
    React.ElementRef<typeof Link>,
    React.ComponentPropsWithoutRef<typeof Link> & { icon?: React.ElementType }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref}
                    className={cn(
                        "group/item flex items-start gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-muted/60 border-l-2 border-transparent hover:border-orange-500",
                        className
                    )}
                    {...props}
                >
                    {Icon && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-orange-600 transition-colors group-hover/item:bg-orange-50 group-hover/item:text-orange-600">
                            <Icon className="h-4 w-4" />
                        </span>
                    )}
                    <div className="space-y-1 pt-0.5">
                        <div className="text-sm font-medium leading-none text-foreground">
                            {title}
                        </div>
                        <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
                            {children}
                        </p>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

/* ------------------------------------------------------------------ */
/*  Highlight Card (left column of mega menus)                         */
/* ------------------------------------------------------------------ */

function HighlightCard({
    href,
    title,
    description,
}: {
    href: string;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group flex h-full flex-col justify-between rounded-xl bg-gradient-to-br from-orange-50/80 to-orange-100/40 p-6 transition-colors hover:from-orange-50 hover:to-orange-100/60"
        >
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                    {title}
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            <span className="mt-4 inline-flex items-center text-xs font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
                Explore
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [showTopBanner, setShowTopBanner] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const shouldShowBanner = latest < 50;
        if (shouldShowBanner !== showTopBanner) {
            setShowTopBanner(shouldShowBanner);
        }
        const scrolled = latest > 10;
        if (scrolled !== hasScrolled) {
            setHasScrolled(scrolled);
        }
    });

    // Close mobile menu when route changes
    useEffect(() => {
        if (isOpen) {
            startTransition(() => {
                setIsOpen(false);
            });
        }
    }, [pathname, isOpen]);

    const [navState, setNavState] = useState<string>("");

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <header className="fixed top-0 z-50 w-full flex flex-col transition-all duration-300">
            {/* Backdrop overlay when mega menu is open */}
            <AnimatePresence>
                {navState && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[-1]"
                    />
                )}
            </AnimatePresence>

            {/* Top Banner */}
            <AnimatePresence>
                {showTopBanner && (
                    <motion.div
                        initial={{ height: "auto", opacity: 1 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <TopBanner />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Nav Bar */}
            <div
                className={cn(
                    "w-full transition-all duration-300 border-b",
                    hasScrolled
                        ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm"
                        : "bg-background border-border/50"
                )}
            >
                <Container className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Logo />
                        </Link>

                        {/* Desktop Mega Menu */}
                        <div className="hidden md:flex">
                            <NavigationMenu
                                value={navState}
                                onValueChange={setNavState}
                            >
                                <NavigationMenuList>
                                    {/* -------- Product -------- */}
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>
                                            Product
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-full">
                                                <Container>
                                                    <div className="grid grid-cols-[240px_1fr] gap-6 py-6">
                                                        {/* Left — Highlight */}
                                                        <HighlightCard
                                                            href="/features"
                                                            title="All Features"
                                                            description="See the full Shelf platform — from asset tracking to QR labels, bookings, custody, and more."
                                                        />
                                                        {/* Right — Feature Grid */}
                                                        <ul className="grid grid-cols-2 gap-1">
                                                            <ListItem
                                                                href="/features/workspaces"
                                                                title="Workspaces"
                                                                icon={Box}
                                                            >
                                                                Organize assets
                                                                by team or
                                                                location.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/custody"
                                                                title="Custody & Checkouts"
                                                                icon={Users}
                                                            >
                                                                Track who has
                                                                what, when, and
                                                                where.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/bookings"
                                                                title="Bookings"
                                                                icon={Layers}
                                                            >
                                                                Reserve
                                                                equipment in
                                                                advance.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/dashboard"
                                                                title="Dashboard"
                                                                icon={BarChart2}
                                                            >
                                                                Real-time
                                                                insights at a
                                                                glance.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/location-tracking"
                                                                title="Location Tracking"
                                                                icon={
                                                                    Smartphone
                                                                }
                                                            >
                                                                Pinpoint assets
                                                                on a map.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/asset-reminders"
                                                                title="Asset Reminders"
                                                                icon={RefreshCw}
                                                            >
                                                                Never miss a
                                                                maintenance
                                                                deadline.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/kits"
                                                                title="Kits"
                                                                icon={
                                                                    CheckSquare
                                                                }
                                                            >
                                                                Bundle items for
                                                                quick checkout.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/features/asset-search"
                                                                title="Asset Search"
                                                                icon={
                                                                    Smartphone
                                                                }
                                                            >
                                                                Find any asset
                                                                instantly.
                                                            </ListItem>
                                                        </ul>
                                                    </div>
                                                </Container>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    {/* -------- Solutions -------- */}
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>
                                            Solutions
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-full">
                                                <Container>
                                                    <div className="grid grid-cols-[240px_1fr] gap-6 py-6">
                                                        {/* Left — Highlight */}
                                                        <HighlightCard
                                                            href="/solutions"
                                                            title="All Solutions"
                                                            description="Discover how Shelf adapts to your industry — from IT and construction to media and education."
                                                        />
                                                        {/* Right — Solutions Grid */}
                                                        <ul className="grid grid-cols-2 gap-1">
                                                            <ListItem
                                                                href="/solutions/asset-tracking"
                                                                title="Asset Tracking"
                                                                icon={LinkIcon}
                                                            >
                                                                Universal
                                                                tracking for any
                                                                item.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/solutions/tool-tracking"
                                                                title="Tool Tracking"
                                                                icon={Settings}
                                                            >
                                                                Manage
                                                                construction &
                                                                trade tools.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/solutions/it-asset-management"
                                                                title="IT Asset Management"
                                                                icon={Code2}
                                                            >
                                                                Track laptops,
                                                                servers, and
                                                                software.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/solutions/fixed-asset-tracking"
                                                                title="Fixed Asset Tracking"
                                                                icon={BarChart2}
                                                            >
                                                                Depreciation and
                                                                lifecycle
                                                                management.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/solutions/equipment-reservations"
                                                                title="Equipment Reservations"
                                                                icon={Layers}
                                                            >
                                                                Streamline
                                                                lending
                                                                libraries.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/solutions/educational-resource-management"
                                                                title="Education"
                                                                icon={BookOpen}
                                                            >
                                                                Resources for
                                                                schools &
                                                                universities.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/solutions/camera-equipment-check-out"
                                                                title="Media & AV"
                                                                icon={
                                                                    Smartphone
                                                                }
                                                            >
                                                                Check-out
                                                                workflows for
                                                                studios.
                                                            </ListItem>
                                                        </ul>
                                                    </div>
                                                </Container>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    {/* -------- Resources -------- */}
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>
                                            Resources
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-full">
                                                <Container>
                                                    <div className="grid grid-cols-[240px_1fr] gap-6 py-6">
                                                        {/* Left — Highlight */}
                                                        <HighlightCard
                                                            href="/knowledge-base"
                                                            title="Knowledge Base"
                                                            description="Guides, tutorials, and how-to articles to help you get the most out of Shelf."
                                                        />
                                                        {/* Right — Resources Grid */}
                                                        <ul className="grid grid-cols-2 gap-1">
                                                            <ListItem
                                                                href="/blog"
                                                                title="Blog"
                                                                icon={BookOpen}
                                                            >
                                                                Latest updates
                                                                and industry
                                                                insights.
                                                            </ListItem>
                                                            <ListItem
                                                                href="https://docs.shelf.nu"
                                                                title="Documentation"
                                                                icon={FileText}
                                                            >
                                                                Guides, API
                                                                reference, and
                                                                tutorials.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/case-studies"
                                                                title="Case Studies"
                                                                icon={Layers}
                                                            >
                                                                See how others
                                                                use Shelf.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/updates"
                                                                title="Updates"
                                                                icon={RefreshCw}
                                                            >
                                                                Product
                                                                changelog and
                                                                new features.
                                                            </ListItem>
                                                            <ListItem
                                                                href="https://github.com/Shelf-nu/shelf.nu"
                                                                title="Open Source"
                                                                icon={Code2}
                                                            >
                                                                View the code on
                                                                GitHub.
                                                            </ListItem>
                                                            <ListItem
                                                                href="/tools"
                                                                title="Free Tools"
                                                                icon={Wrench}
                                                            >
                                                                QR Code Decoder
                                                                and other
                                                                utilities.
                                                            </ListItem>
                                                        </ul>
                                                    </div>
                                                </Container>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    {/* -------- Pricing (direct link) -------- */}
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/pricing"
                                                className={navigationMenuTriggerStyle()}
                                            >
                                                Pricing
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    {/* Right — CTAs */}
                    <div className="flex items-center gap-3">
                        <SearchDialog />
                        <div className="hidden sm:flex items-center gap-3">
                            <Link
                                href="https://app.shelf.nu/login"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Log in
                            </Link>
                            <Link href="https://app.shelf.nu/register?utm_source=shelf_website&utm_medium=cta&utm_content=navbar_signup">
                                <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white ring-1 ring-orange-500/20 transition-all hover:shadow-md hover:shadow-orange-500/10"
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </Container>
            </div>

            {/* ============================================================ */}
            {/*  Mobile Menu                                                  */}
            {/* ============================================================ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="fixed inset-0 z-40 bg-background md:hidden overflow-y-auto pt-28 border-t border-border/40"
                    >
                        <div className="px-6 pb-8 space-y-6">
                            {/* Product Section */}
                            <div>
                                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                    Product
                                </h3>
                                <nav className="flex flex-col gap-0.5">
                                    <MobileLink href="/features">
                                        All Features
                                    </MobileLink>
                                    <MobileLink href="/features/workspaces">
                                        Workspaces
                                    </MobileLink>
                                    <MobileLink href="/features/custody">
                                        Custody & Checkouts
                                    </MobileLink>
                                    <MobileLink href="/features/bookings">
                                        Bookings
                                    </MobileLink>
                                    <MobileLink href="/features/dashboard">
                                        Dashboard
                                    </MobileLink>
                                    <MobileLink href="/features/location-tracking">
                                        Location Tracking
                                    </MobileLink>
                                    <MobileLink href="/features/asset-reminders">
                                        Asset Reminders
                                    </MobileLink>
                                    <MobileLink href="/features/kits">
                                        Kits
                                    </MobileLink>
                                    <MobileLink href="/features/asset-search">
                                        Asset Search
                                    </MobileLink>
                                </nav>
                            </div>

                            <div className="border-t border-border/40" />

                            {/* Solutions Section */}
                            <div>
                                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                    Solutions
                                </h3>
                                <nav className="flex flex-col gap-0.5">
                                    <MobileLink href="/solutions">
                                        All Solutions
                                    </MobileLink>
                                    <MobileLink href="/solutions/asset-tracking">
                                        Asset Tracking
                                    </MobileLink>
                                    <MobileLink href="/solutions/tool-tracking">
                                        Tool Tracking
                                    </MobileLink>
                                    <MobileLink href="/solutions/it-asset-management">
                                        IT Asset Management
                                    </MobileLink>
                                    <MobileLink href="/solutions/fixed-asset-tracking">
                                        Fixed Asset Tracking
                                    </MobileLink>
                                    <MobileLink href="/solutions/equipment-reservations">
                                        Equipment Reservations
                                    </MobileLink>
                                    <MobileLink href="/solutions/educational-resource-management">
                                        Education
                                    </MobileLink>
                                    <MobileLink href="/solutions/camera-equipment-check-out">
                                        Media & AV
                                    </MobileLink>
                                </nav>
                            </div>

                            <div className="border-t border-border/40" />

                            {/* Resources Section */}
                            <div>
                                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                    Resources
                                </h3>
                                <nav className="flex flex-col gap-0.5">
                                    <MobileLink href="/blog">Blog</MobileLink>
                                    <MobileLink href="https://docs.shelf.nu">
                                        Documentation
                                    </MobileLink>
                                    <MobileLink href="/case-studies">
                                        Case Studies
                                    </MobileLink>
                                    <MobileLink href="/updates">
                                        Updates
                                    </MobileLink>
                                    <MobileLink href="https://github.com/Shelf-nu/shelf.nu">
                                        Open Source
                                    </MobileLink>
                                    <MobileLink href="/tools">
                                        Free Tools
                                    </MobileLink>
                                    <MobileLink href="/knowledge-base">
                                        Knowledge Base
                                    </MobileLink>
                                </nav>
                            </div>

                            <div className="border-t border-border/40" />

                            {/* Direct Links */}
                            <nav className="flex flex-col gap-0.5">
                                <MobileLink href="/pricing" highlight>
                                    Pricing
                                </MobileLink>
                                <MobileLink href="/migrate" highlight>
                                    Migrate
                                </MobileLink>
                            </nav>

                            {/* CTAs */}
                            <div className="pt-4 space-y-3">
                                <Link
                                    href="https://app.shelf.nu/login"
                                    className="block w-full"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                                <Link
                                    href="https://app.shelf.nu/register?utm_source=shelf_website&utm_medium=cta&utm_content=navbar_signup"
                                    className="block w-full"
                                >
                                    <Button className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

/* ------------------------------------------------------------------ */
/*  Mobile Link                                                        */
/* ------------------------------------------------------------------ */

function MobileLink({
    href,
    children,
    highlight,
}: {
    href: string;
    children: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted/60",
                highlight
                    ? "text-orange-600 hover:text-orange-700"
                    : "text-foreground"
            )}
        >
            {children}
        </Link>
    );
}
