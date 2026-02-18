-- Form submissions table — generic for all marketing forms.
-- Each form is distinguished by `form_key` (e.g. 'demo', 'contact', 'migrate').
-- Run this via the Supabase SQL Editor or `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists form_submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  form_key     text not null,
  name         text,
  email        text,
  company      text,
  message      text,
  source_url   text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text,
  user_agent   text,
  ip_hash      text,
  metadata     jsonb,
  status       text not null default 'new'
);

-- Indexes for common query patterns
create index if not exists idx_form_submissions_created_at on form_submissions (created_at desc);
create index if not exists idx_form_submissions_form_key   on form_submissions (form_key);
create index if not exists idx_form_submissions_email      on form_submissions (email);
