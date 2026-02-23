// SSR-only — not used in static export build.
// Preserved for future SSR deployment. Do not import from client components.
import "server-only";

import { getSupabaseAdmin } from "./supabase-server";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FormSubmissionData {
    formKey: string;
    name?: string | null;
    email?: string | null;
    company?: string | null;
    message?: string | null;
    sourceUrl?: string | null;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
    userAgent?: string | null;
    ipHash?: string | null;
    metadata?: Record<string, unknown> | null;
}

export type FormResult =
    | { success: true }
    | { success: false; error: string };

/* ------------------------------------------------------------------ */
/*  Insert                                                             */
/* ------------------------------------------------------------------ */

/**
 * Insert a row into the generic `form_submissions` table.
 *
 * Every marketing form calls this with its own `formKey` value
 * (e.g. "demo", "contact", "migrate"). The table schema is shared;
 * form-specific extra data goes into the `metadata` JSONB column.
 */
export async function insertFormSubmission(
    data: FormSubmissionData,
): Promise<FormResult> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("form_submissions").insert({
        form_key: data.formKey,
        name: data.name ?? null,
        email: data.email ?? null,
        company: data.company ?? null,
        message: data.message ?? null,
        source_url: data.sourceUrl ?? null,
        referrer: data.referrer ?? null,
        utm_source: data.utmSource ?? null,
        utm_medium: data.utmMedium ?? null,
        utm_campaign: data.utmCampaign ?? null,
        utm_term: data.utmTerm ?? null,
        utm_content: data.utmContent ?? null,
        user_agent: data.userAgent ?? null,
        ip_hash: data.ipHash ?? null,
        metadata: data.metadata ?? null,
    });

    if (error) {
        console.error("[forms] insert failed:", error.message);
        return { success: false, error: "Failed to save submission." };
    }

    return { success: true };
}
