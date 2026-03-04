// Supabase Edge Function — receives analytics events from the website.
// Public endpoint (no auth headers needed — same pattern as form submissions).
//
// Deploy: supabase functions deploy analytics --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }

    try {
        const body = await req.json();

        // Basic validation
        if (!body.event_name || typeof body.event_name !== "string") {
            return new Response(
                JSON.stringify({ error: "event_name is required" }),
                {
                    status: 400,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                },
            );
        }

        // Insert into analytics_events table
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );

        const { error } = await supabase.from("analytics_events").insert({
            event_name: body.event_name,
            page_path: body.page_path || null,
            properties: body.properties || {},
            session_id: body.session_id || null,
            referrer: body.referrer || null,
        });

        if (error) {
            console.error("Insert error:", error);
            return new Response(
                JSON.stringify({ error: "Failed to store event" }),
                {
                    status: 500,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                },
            );
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Parse error:", err);
        return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            },
        );
    }
});
