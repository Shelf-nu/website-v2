import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 *
 * Uses the service_role key — bypasses RLS.
 * The `server-only` import guarantees a build error if this module
 * is ever accidentally imported from a client component.
 *
 * SUPABASE_SERVICE_KEY must NEVER be exposed to the browser.
 */

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (client) return client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.",
        );
    }

    client = createClient(url, key, {
        auth: { persistSession: false },
    });

    return client;
}
