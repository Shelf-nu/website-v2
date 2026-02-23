// SSR-only — not used in static export build.
// Preserved for future SSR deployment. Do not import from client components.
import "server-only";

import { createHash } from "node:crypto";

/**
 * Hash an IP address with a server-side salt.
 * Returns a hex SHA-256 digest, or null if no IP could be determined.
 *
 * Parses `x-forwarded-for` (comma-separated, first entry = client IP)
 * and falls back to `x-real-ip`.
 */
export function hashIp(
    xForwardedFor: string | null,
    xRealIp: string | null,
): string | null {
    const salt = process.env.FORMS_IP_SALT;
    if (!salt) return null;

    // x-forwarded-for can be "client, proxy1, proxy2"
    const raw =
        xForwardedFor?.split(",")[0]?.trim() || xRealIp?.trim() || null;

    if (!raw) return null;

    return createHash("sha256").update(`${raw}${salt}`).digest("hex");
}
