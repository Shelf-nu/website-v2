"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  configureCrispTheme,
  updateCrispSessionData,
  updateCrispSegments,
} from "@/lib/crisp";
import { trackEvent } from "@/lib/analytics";

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

/**
 * Deferred Crisp Chat — loads the SDK after the browser is idle (or after 4s
 * on Safari which lacks requestIdleCallback), keeping it off the critical path.
 */
export function CrispChat() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  /* ---- Defer loading until browser is idle ---- */
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) return;

    const schedule = typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 4000);

    const id = schedule(() => setShouldLoad(true));

    return () => {
      if (typeof requestIdleCallback === "function") {
        cancelIdleCallback(id as number);
      } else {
        clearTimeout(id as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  /* ---- One-time setup: theme, dark mode observer, analytics bridge ---- */
  useEffect(() => {
    if (!CRISP_WEBSITE_ID || !shouldLoad || initialized.current) return;
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

    // Inject the Crisp script now
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    return () => observer.disconnect();
  }, [shouldLoad]);

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

  return null;
}
