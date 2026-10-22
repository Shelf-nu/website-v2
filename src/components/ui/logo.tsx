"use client";

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: "default" | "white" | "icon";
}

import Image from "next/image";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Download, Home } from "lucide-react";

export function Logo({ className = "" }: Omit<LogoProps, "showText" | "variant">) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                        <Image
                            src="/logo-light.png"
                            alt="Shelf Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain block dark:hidden"
                            priority
                        />
                        <Image
                            src="/logo-dark.png"
                            alt="Shelf Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain hidden dark:block"
                            priority
                        />
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                    <ContextMenuLabel>Brand Center</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onSelect={() => {
                            // A full page load on purpose: router.push() from a Radix context-menu
                            // onSelect fetches the page but never navigates (tested 2026-10-07).
                            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                            window.location.href = "/brand-assets";
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Brand Center
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onSelect={() => {
                            // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see above
                            window.location.href = "/";
                        }}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Home Page
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
    );
}
