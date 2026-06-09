import Link from "next/link";
import { Smartphone } from "lucide-react";
import { Container } from "@/components/ui/container";


export function TopBanner() {
    return (
        <div className="bg-muted border-b border-border text-muted-foreground text-[11px] font-medium py-1.5 relative z-50 transition-colors duration-300">
            <Container className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground tracking-tight">Shelf™</span>
                    <span className="opacity-40">|</span>
                    <span className="opacity-90 hidden sm:inline font-normal">everything has a place.</span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    <Link
                        href="/mobile-app"
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                        <Smartphone className="h-3 w-3 text-orange-500" aria-hidden="true" />
                        <span className="hidden sm:inline">Now on Android</span>
                        <span className="sm:hidden">Android</span>
                    </Link>

                    <Link href="/migrate" className="hover:text-foreground transition-colors">
                        Migrate
                    </Link>

                    <Link
                        href="https://shelf.openstatus.dev"
                        target="_blank"
                        className="flex items-center gap-2 hover:text-foreground transition-colors group"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="hidden sm:inline">Status</span>
                    </Link>


                </div>
            </Container>
        </div>
    );
}
