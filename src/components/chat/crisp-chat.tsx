"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  configureCrispTheme,
  updateCrispSessionData,
  updateCrispSegments,
} from "@/lib/crisp";
import { trackEvent } from "@/lib/analytics";

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

export function CrispChat() {
  const pathname = usePathname();
  const initialized = useRef(false);

  /* ---- One-time setup: theme, dark mode observer, analytics bridge ---- */
  useEffect(() => {
    if (!CRISP_WEBSITE_ID || initialized.current) return;
    initialized.current = true;

    // Initialize Crisp globals (queued commands replay once SDK loads)
    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Brand color + current dark/light mode
    const isDark = document.documentElement.classList.contains("dark");
    configureCrispTheme(isDark);

    // Watch for dark mode toggles (CrispChat is outside ThemeProvider,
    // so we observe the class attribute on <html> instead of useTheme)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          const nowDark = document.documentElement.classList.contains("dark");
          configureCrispTheme(nowDark);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    // Bridge Crisp chat events → Supabase analytics
    window.$crisp.push(["on", "chat:opened", () => {
      trackEvent("chat_opened", { page: window.location.pathname });
    }]);
    window.$crisp.push(["on", "message:sent", () => {
      trackEvent("chat_message_sent", { page: window.location.pathname });
    }]);

    return () => observer.disconnect();
  }, []);

  /* ---- On every route change: update session data + segments ---- */
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) return;

    updateCrispSessionData(pathname);
    updateCrispSegments(pathname);

    // Push a page_viewed event to the Crisp timeline so agents
    // can see the visitor's navigation journey
    window.$crisp?.push(["set", "session:event", [[
      ["page_viewed", { page: pathname }, "blue"],
    ]]]);
  }, [pathname]);

  if (!CRISP_WEBSITE_ID) return null;

  return (
    <Script
      id="crisp-widget"
      strategy="afterInteractive"
      src="https://client.crisp.chat/l.js"
    />
  );
}
