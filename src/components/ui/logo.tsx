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
import { useRouter } from "next/navigation";

export function Logo({ className = "" }: Omit<LogoProps, "showText" | "variant">) {
    const router = useRouter();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <ContextMenu modal={false}>
                <ContextMenuTrigger>
                    <div className="relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                        <Image
                            src="/logo-dark.png"
                            alt="Shelf Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain block dark:hidden"
                            priority
                        />
                        <Image
                            src="/logo-light.png"
                            alt="Shelf Logo (Dark)"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain hidden dark:block"
                            priority
                        />
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                    <ContextMenuLabel>Brand Assets</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => router.push("/brand-assets")}>
                        <Download className="mr-2 h-4 w-4" />
                        Brand Guidelines
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => router.push("/")}>
                        <Home className="mr-2 h-4 w-4" />
                        Home Page
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
    );
}
