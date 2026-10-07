"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { PlayStoreBadge } from "@/components/ui/play-store-badge";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/data/companion-screens";
import { trackEvent } from "@/lib/analytics";

type Platform = "ios" | "android" | "other";

/** iPadOS reports itself as a Mac, so the touch-point check is what catches iPads. */
function detectPlatform(): Platform {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "other";
}

/**
 * The target of the "scan to install" QR code. A phone is sent straight to
 * its store; anything else (a desktop that followed the link) gets both
 * stores and the code to scan. The short pause lets the event leave.
 */
const noSubscription = () => () => {};
const serverSnapshot = (): Platform | null => null;

export function GetAppRedirect() {
    // The platform is read from the browser, so the server renders nothing
    // platform-specific and the client fills it in after hydration.
    const platform = useSyncExternalStore(noSubscription, detectPlatform, serverSnapshot);

    useEffect(() => {
        if (platform !== "ios" && platform !== "android") return;
        trackEvent("app_store_click", { platform, location: "get_app_redirect" });
        const timer = setTimeout(() => {
            window.location.replace(platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL);
        }, 600);
        return () => clearTimeout(timer);
    }, [platform]);

    if (platform === "ios" || platform === "android") {
        const storeName = platform === "ios" ? "the App Store" : "Google Play";
        const storeUrl = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
        return (
            <div className="mx-auto max-w-md text-center">
                <h1 className="text-2xl font-bold tracking-tight text-heading">Opening {storeName}…</h1>
                <p className="mt-3 text-muted-foreground">
                    If nothing happens,{" "}
                    <a href={storeUrl} className="font-medium text-orange-600 underline underline-offset-2">
                        open {storeName} here
                    </a>
                    .
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md text-center">
            <h1 className="text-2xl font-bold tracking-tight text-heading">Get Shelf Companion</h1>
            <p className="mt-3 text-muted-foreground">
                Free with any Shelf account, on iPhone and Android. Scan the code with your phone, or pick a store.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/images/mobile-app/get-app-qr.svg"
                alt="QR code linking to Shelf Companion in the App Store and Google Play"
                width={176}
                height={176}
                className="mx-auto mt-6 h-44 w-44 rounded-xl bg-white p-2 ring-1 ring-border"
            />
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <AppStoreBadge location="get_app_page" />
                <PlayStoreBadge location="get_app_page" />
            </div>
        </div>
    );
}
