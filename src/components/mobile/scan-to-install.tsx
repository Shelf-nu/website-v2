import { cn } from "@/lib/utils";

interface ScanToInstallProps {
    className?: string;
    /** On a dark band the caption needs light text */
    onDark?: boolean;
}

/**
 * "Scan to install": one QR code that opens the right store for the phone
 * that scans it (via /get-app). For visitors reading on a desktop, where a
 * store badge would open the store on the wrong device. Hide it on phones.
 */
export function ScanToInstall({ className, onDark }: ScanToInstallProps) {
    return (
        <div className={cn("items-center gap-4", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/images/mobile-app/get-app-qr.svg"
                alt="QR code linking to Shelf Companion in the App Store and Google Play"
                width={112}
                height={112}
                className="h-28 w-28 shrink-0 rounded-lg bg-white p-1.5 ring-1 ring-black/10"
            />
            <div className="text-sm leading-snug">
                <p className={cn("font-semibold", onDark ? "text-white" : "text-heading")}>Scan to install</p>
                <p className={cn("mt-1 max-w-[22ch]", onDark ? "text-neutral-400" : "text-muted-foreground")}>
                    Point your phone&apos;s camera at the code. It opens the right store for your phone.
                </p>
            </div>
        </div>
    );
}
