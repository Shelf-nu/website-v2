# Marketing Form Submissions

All marketing forms submit to a single generic Supabase Postgres table (`form_submissions`). Each form is distinguished by a `form_key` column (e.g. `demo`, `contact`, `migrate`).

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (server-only — **never expose to client**) |
| `FORMS_IP_SALT` | Random 32+ char string used to hash visitor IPs before storage |

## Database

### Table: `form_submissions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, auto-generated |
| `created_at` | `timestamptz` | Auto-set to `now()` |
| `form_key` | `text` | **Required.** Identifies the form (e.g. `demo`) |
| `name` | `text` | Combined full name |
| `email` | `text` | Submitter's email |
| `company` | `text` | Company name |
| `message` | `text` | Free-text message |
| `source_url` | `text` | Full URL the user submitted from |
| `referrer` | `text` | HTTP Referer header |
| `utm_source` | `text` | UTM source param |
| `utm_medium` | `text` | UTM medium param |
| `utm_campaign` | `text` | UTM campaign param |
| `utm_term` | `text` | UTM term param |
| `utm_content` | `text` | UTM content param |
| `user_agent` | `text` | Browser user-agent |
| `ip_hash` | `text` | SHA-256 hash of IP + salt (raw IP never stored) |
| `metadata` | `jsonb` | Arbitrary extra data for form-specific fields |
| `status` | `text` | Defaults to `new`. Can be updated to `contacted`, `closed`, etc. |

### Running the migration

The SQL file is at `supabase/migrations/001_form_submissions.sql`. Run it via:

- **Supabase SQL Editor**: paste the contents and execute
- **Supabase CLI**: `supabase db push`

### Indexes

- `created_at desc` — for listing recent submissions
- `form_key` — for filtering by form type
- `email` — for looking up submissions by email

## Deployment

Form submission **requires an SSR/Node runtime** (Fly.io, VPS, etc.) because it uses Next.js server actions. In static export mode (`npm run build:static` for Cloudflare Pages), the form UI renders but submissions won't function.

## Anti-spam

- **Honeypot field**: a hidden input named `website`. Bots auto-fill it; humans never see it. If filled, the server action silently returns success without inserting a row.
- **Rate limiting**: in-memory, 10 submissions per minute per IP hash (per server instance). Exceeding the limit silently returns success.
- **Future hardening**: persistent rate limiting (Redis), CAPTCHA, email verification.

## How to add a new form

1. **Create a Zod schema** for the new form's fields (see `src/app/(marketing)/demo/actions.ts` as a template)
2. **Write a server action** (`"use server"`) that validates with Zod and calls `insertFormSubmission()` from `src/lib/forms.ts` with a new `form_key` value
3. **Build a client component** (`"use client"`) with `useActionState()` bound to the action, field error rendering, loading/success/error states
4. **Import it** into the page

The shared infra (`form_submissions` table, `insertFormSubmission()`, IP hashing, UTM capture) is reused — you only write the Zod schema, server action, and client form.

## Key files

| File | Purpose |
|------|---------|
| `supabase/migrations/001_form_submissions.sql` | Table DDL + indexes |
| `src/lib/supabase-server.ts` | Supabase admin client (server-only guarded) |
| `src/lib/forms.ts` | Generic `insertFormSubmission()` helper |
| `src/lib/hash-ip.ts` | SHA-256 IP hashing utility |
| `src/app/(marketing)/demo/actions.ts` | Demo form server action |
| `src/components/forms/demo-form.tsx` | Demo form client component |
| `src/app/(marketing)/demo/page.tsx` | Demo page (imports DemoForm) |

## Security notes

- `SUPABASE_SERVICE_KEY` bypasses Row Level Security (RLS). All server-side modules importing it are protected by `import "server-only"` which causes a build error if accidentally bundled into client code.
- Raw IP addresses are never stored. Only a salted SHA-256 hash is persisted.
- The honeypot field name (`website`) and rate limit thresholds are intentionally not documented publicly.
