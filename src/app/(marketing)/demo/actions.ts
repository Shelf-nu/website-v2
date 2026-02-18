"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { insertFormSubmission } from "@/lib/forms";
import { hashIp } from "@/lib/hash-ip";

/* ------------------------------------------------------------------ */
/*  Validation schema                                                  */
/* ------------------------------------------------------------------ */

const demoFormSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    company: z.string().min(1, "Company name is required").max(200),
    message: z.string().max(2000).optional().default(""),
    // Honeypot — must be empty (bots auto-fill it)
    website: z.string().max(0).optional().default(""),
    // Hidden client-side fields
    sourceUrl: z.string().optional().default(""),
    utmSource: z.string().optional().default(""),
    utmMedium: z.string().optional().default(""),
    utmCampaign: z.string().optional().default(""),
    utmTerm: z.string().optional().default(""),
    utmContent: z.string().optional().default(""),
});

/* ------------------------------------------------------------------ */
/*  Rate limiting (in-memory, per-instance)                            */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max submissions per window

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    entry.count += 1;
    return entry.count > RATE_LIMIT_MAX;
}

// Periodically clean expired entries to prevent memory leaks
function cleanRateLimitMap() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetAt) rateLimitMap.delete(key);
    }
}
setInterval(cleanRateLimitMap, RATE_LIMIT_WINDOW_MS * 2);

/* ------------------------------------------------------------------ */
/*  Action result type                                                 */
/* ------------------------------------------------------------------ */

export type DemoFormState = {
    success: boolean;
    fieldErrors?: Record<string, string>;
    formError?: string;
} | null;

/* ------------------------------------------------------------------ */
/*  Server action                                                      */
/* ------------------------------------------------------------------ */

export async function submitDemoForm(
    _prevState: DemoFormState,
    formData: FormData,
): Promise<DemoFormState> {
    // -- Extract fields from FormData --
    const raw = {
        firstName: formData.get("firstName") as string ?? "",
        lastName: formData.get("lastName") as string ?? "",
        email: formData.get("email") as string ?? "",
        company: formData.get("company") as string ?? "",
        message: formData.get("message") as string ?? "",
        website: formData.get("website") as string ?? "",
        sourceUrl: formData.get("sourceUrl") as string ?? "",
        utmSource: formData.get("utmSource") as string ?? "",
        utmMedium: formData.get("utmMedium") as string ?? "",
        utmCampaign: formData.get("utmCampaign") as string ?? "",
        utmTerm: formData.get("utmTerm") as string ?? "",
        utmContent: formData.get("utmContent") as string ?? "",
    };

    // -- Validate with zod --
    const parsed = demoFormSchema.safeParse(raw);

    if (!parsed.success) {
        // Check if it's just the honeypot that failed (bot filled it)
        const issues = parsed.error.issues;
        const onlyHoneypot = issues.every((i) => i.path[0] === "website");
        if (onlyHoneypot) {
            // Silent success — don't reveal bot detection
            return { success: true };
        }

        // Real validation errors — return field-level messages
        const fieldErrors: Record<string, string> = {};
        for (const issue of issues) {
            const field = issue.path[0] as string;
            if (field !== "website" && !fieldErrors[field]) {
                fieldErrors[field] = issue.message;
            }
        }
        return { success: false, fieldErrors };
    }

    const data = parsed.data;

    // -- Honeypot check (redundant after zod, but explicit) --
    if (data.website && data.website.length > 0) {
        return { success: true }; // Silent success for bots
    }

    // -- Read request headers --
    const hdrs = await headers();
    const xForwardedFor = hdrs.get("x-forwarded-for");
    const xRealIp = hdrs.get("x-real-ip");
    const userAgent = hdrs.get("user-agent");
    const referer = hdrs.get("referer");

    // -- Hash IP --
    const ipHash = hashIp(xForwardedFor, xRealIp);

    // -- Rate limit --
    // Key: ipHash if available, fallback to "noip:" + userAgent (low threshold)
    const rateLimitKey = ipHash ?? `noip:${userAgent ?? "unknown"}`;
    if (isRateLimited(rateLimitKey)) {
        // Silent success — don't signal to attackers
        console.warn("[demo-form] rate limited:", rateLimitKey.slice(0, 16));
        return { success: true };
    }

    // -- Insert into Supabase --
    const result = await insertFormSubmission({
        formKey: "demo",
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        company: data.company,
        message: data.message || null,
        sourceUrl: data.sourceUrl || null,
        referrer: referer,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        utmTerm: data.utmTerm || null,
        utmContent: data.utmContent || null,
        userAgent: userAgent,
        ipHash: ipHash,
    });

    if (!result.success) {
        return {
            success: false,
            formError: "Something went wrong. Please try again or email us at support@shelf.nu.",
        };
    }

    return { success: true };
}
