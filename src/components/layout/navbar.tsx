"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

import { Menu, X, BarChart2, Link as LinkIcon, Users, CheckSquare, Settings, BookOpen, FileText, Code2, Layers, Box, RefreshCw, Smartphone, HelpCircle, ArrowRight, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
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

const navLinks = [
    { href: "/pricing", label: "Pricing" },
    { href: "/customers", label: "Customers" },
];

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
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-orange-600 focus:bg-muted focus:text-orange-600",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-2 mb-1">
                        {Icon && <Icon className="h-4 w-4 text-orange-600" />}
                        <div className="text-sm font-medium leading-none text-foreground">{title}</div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

import React from "react";

import { TopBanner } from "@/components/layout/top-banner";

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [showTopBanner, setShowTopBanner] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const shouldShow = latest < 50;
        if (shouldShow !== showTopBanner) {
            setShowTopBanner(shouldShow);
        }
    });

    // Close mobile menu when route changes
    useEffect(() => {
        if (isOpen) {
            setIsOpen(false);
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
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    return (
        <header className="fixed top-0 z-50 w-full flex flex-col transition-all duration-300">
            <AnimatePresence>
                {navState && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[-1]"
                    />
                )}
            </AnimatePresence>
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
            <div className="border-b border-border bg-background w-full shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:shadow-none">
                <Container className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Logo />
                        </Link>

                        {/* Desktop Mega Menu */}
                        <div className="hidden md:flex">
                            <NavigationMenu value={navState} onValueChange={setNavState}>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-full">
                                                <Container>
                                                    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 py-8">
                                                        <li className="col-span-full border-b border-border/40 pb-4 mb-2 flex items-center justify-between">
                                                            <h4 className="font-medium leading-none text-muted-foreground text-xs uppercase tracking-wider">Features</h4>
                                                            <Link href="/features" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center">
                                                                View all features <ArrowRight className="ml-1 h-3 w-3" />
                                                            </Link>
                                                        </li>
                                                        <ListItem href="/features/workspaces" title="Workspaces" icon={Box}>
                                                            Organize assets by team or location.
                                                        </ListItem>
                                                        <ListItem href="/features/custody" title="Custody & Checkouts" icon={Users}>
                                                            Track who has what, when, and where.
                                                        </ListItem>
                                                        <ListItem href="/features/bookings" title="Bookings" icon={Layers}>
                                                            Reserve equipment in advance.
                                                        </ListItem>
                                                        <ListItem href="/features/dashboard" title="Dashboard" icon={BarChart2}>
                                                            Real-time insights at a glance.
                                                        </ListItem>
                                                        <ListItem href="/features/location-tracking" title="Location Tracking" icon={Smartphone}>
                                                            Pinpoint assets on a map.
                                                        </ListItem>
                                                        <ListItem href="/features/asset-reminders" title="Asset Reminders" icon={RefreshCw}>
                                                            Never miss a maintenance deadline.
                                                        </ListItem>
                                                        <ListItem href="/features/kits" title="Kits" icon={CheckSquare}>
                                                            Bundle items for quick checkout.
                                                        </ListItem>
                                                        <ListItem href="/features/mobile-app" title="Mobile App" icon={Smartphone}>
                                                            Scan tags and manage on the go.
                                                        </ListItem>
                                                    </ul>
                                                </Container>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-full">
                                                <Container>
                                                    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 py-8">
                                                        <li className="col-span-full border-b border-border/40 pb-4 mb-2 flex items-center justify-between">
                                                            <h4 className="font-medium leading-none text-muted-foreground text-xs uppercase tracking-wider">Solutions</h4>
                                                            <Link href="/solutions" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center">
                                                                View all solutions <ArrowRight className="ml-1 h-3 w-3" />
                                                            </Link>
                                                        </li>
                                                        <ListItem href="/solutions/asset-tracking" title="Asset Tracking" icon={LinkIcon}>
                                                            Universal tracking for any item.
                                                        </ListItem>
                                                        <ListItem href="/solutions/tool-tracking" title="Tool Tracking" icon={Settings}>
                                                            Manage construction & trade tools.
                                                        </ListItem>
                                                        <ListItem href="/solutions/it-asset-management" title="IT Asset Management" icon={Code2}>
                                                            Track laptops, servers, and software.
                                                        </ListItem>
                                                        <ListItem href="/solutions/fixed-asset-tracking" title="Fixed Asset Tracking" icon={BarChart2}>
                                                            Depreciation and lifecycle management.
                                                        </ListItem>
                                                        <ListItem href="/solutions/equipment-reservations" title="Equipment Reservations" icon={Layers}>
                                                            Streamline lending libraries.
                                                        </ListItem>
                                                        <ListItem href="/solutions/educational-resource-management" title="Education" icon={BookOpen}>
                                                            Resources for schools & universities.
                                                        </ListItem>
                                                        <ListItem href="/solutions/camera-equipment-check-out" title="Media & AV" icon={Smartphone}>
                                                            Check-out workflows for studios.
                                                        </ListItem>
                                                    </ul>
                                                </Container>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-full">
                                                <Container>
                                                    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 py-8">
                                                        <li className="col-span-full border-b border-border/40 pb-4 mb-2">
                                                            <h4 className="font-medium leading-none text-muted-foreground text-xs uppercase tracking-wider">Resources</h4>
                                                        </li>
                                                        <ListItem href="/blog" title="Blog" icon={BookOpen}>
                                                            Latest updates and industry insights.
                                                        </ListItem>
                                                        <ListItem href="https://docs.shelf.nu" title="Documentation" icon={FileText}>
                                                            Guides, API reference, and tutorials.
                                                        </ListItem>
                                                        <ListItem href="/case-studies" title="Case Studies" icon={Layers}>
                                                            See how others use Shelf.
                                                        </ListItem>
                                                        <ListItem href="https://github.com/Shelf-nu/shelf.nu" title="Open Source" icon={Code2}>
                                                            View the code on GitHub.
                                                        </ListItem>
                                                        <ListItem href="/tools" title="Free Tools" icon={Wrench}>
                                                            QR Code Decoder and other utilities.
                                                        </ListItem>
                                                        <ListItem href="/resources" title="Help Center" icon={HelpCircle}>
                                                            Support, sales, and more.
                                                        </ListItem>
                                                    </ul>
                                                </Container>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link href="/pricing" className={navigationMenuTriggerStyle()}>
                                                Pricing
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-4">
                            <Link href="https://app.shelf.nu/login">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="https://app.shelf.nu/register">
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-105">Get Started</Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </Container>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl md:hidden overflow-y-auto pt-32 border-t border-border/40"
                    >
                        <div className="p-6 space-y-6">
                            <nav className="flex flex-col gap-6">
                                <Link href="/features" className="text-2xl font-semibold tracking-tight">Product</Link>
                                <Link href="/solutions" className="text-2xl font-semibold tracking-tight">Solutions</Link>
                                <Link href="/pricing" className="text-2xl font-semibold tracking-tight">Pricing</Link>
                                <Link href="/blog" className="text-2xl font-semibold tracking-tight">Blog</Link>
                                <Link href="/migrate" className="text-2xl font-semibold tracking-tight text-orange-600">Migrate</Link>
                                <Link href="/resources" className="text-2xl font-semibold tracking-tight">Help Center</Link>
                                <Link href="/tools" className="text-2xl font-semibold tracking-tight text-orange-600">Free Tools</Link>
                            </nav>
                            <div className="pt-8 space-y-4 border-t border-border/40">
                                <Link href="https://app.shelf.nu/login" className="block w-full">
                                    <Button variant="outline" className="w-full justify-center">Log in</Button>
                                </Link>
                                <Link href="https://app.shelf.nu/register" className="block w-full">
                                    <Button className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
