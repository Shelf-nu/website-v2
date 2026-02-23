# Marketing Form Submissions

The demo form at `/demo` submits to an external endpoint via client-side `fetch()`. This keeps the entire site compatible with static export (Cloudflare Pages, S3, any CDN).

## How it works

1. User fills form → client-side Zod validation runs
2. Honeypot field (`website`) checked — if filled, silently "succeeds" (bot trap)
3. `fetch()` POST to `NEXT_PUBLIC_FORM_ENDPOINT` with JSON body
4. External endpoint handles storage, rate limiting, IP hashing, notifications

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_FORM_ENDPOINT` | Yes (for submissions) | External endpoint URL for form POST |

If `NEXT_PUBLIC_FORM_ENDPOINT` is not set, the form shows success without submitting (graceful degradation for dev/preview).

## Form payload (JSON)

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@company.com",
  "company": "Acme Inc.",
  "message": "Tell us about your use case...",
  "sourceUrl": "https://shelf.nu/demo?utm_source=google",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "",
  "utmTerm": "",
  "utmContent": ""
}
```

## Anti-spam

- **Honeypot field**: hidden input named `website`. Bots auto-fill it; humans never see it. If filled, the form silently shows success without sending.
- **Rate limiting**: must be handled at the external endpoint level (not client-side).

## External endpoint options

Choose one:
- **Supabase Edge Function** — writes to `form_submissions` table (migration at `supabase/migrations/001_form_submissions.sql`)
- **Cloudflare Worker** — lightweight, pairs well with Cloudflare Pages hosting
- **Formspree / Formspark** — zero-code SaaS option
- Any HTTP endpoint that accepts POST with JSON body

## SSR-only files (preserved, not used in static build)

These files are from the previous server action implementation. They are NOT imported by anything in the static build and will NOT be bundled. Kept for reference if you ever switch back to SSR.

| File | Purpose |
|------|---------|
| `src/lib/supabase-server.ts` | Supabase admin client (service role key) |
| `src/lib/forms.ts` | Generic `insertFormSubmission()` helper |
| `src/lib/hash-ip.ts` | SHA-256 IP hashing utility |
| `supabase/migrations/001_form_submissions.sql` | Table DDL + indexes |

## Key files (active)

| File | Purpose |
|------|---------|
| `src/components/forms/demo-form.tsx` | Client-only form with Zod validation + fetch POST |
| `src/app/(marketing)/demo/page.tsx` | Demo page (imports DemoForm) |
