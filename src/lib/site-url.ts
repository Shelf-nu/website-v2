/**
 * The site's canonical origin, resolved once.
 *
 * Previously this fallback was written out in four places (seo.ts, sitemap.ts
 * and both llms route handlers). Duplicating it means a missing or
 * misconfigured NEXT_PUBLIC_APP_URL silently produces correct-looking output
 * in some generators and not others — and the deploy workflow applies the same
 * fallback again, so nothing ever surfaces the misconfiguration.
 *
 * No trailing slash: every caller composes `${BASE_URL}/path`.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.shelf.nu";
