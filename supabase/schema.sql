-- Run in Supabase SQL Editor

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  referral_code text not null unique,
  referred_by text,
  position integer not null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_referral_code_idx on public.waitlist(referral_code);
create index if not exists waitlist_position_idx on public.waitlist(position);

alter table public.waitlist enable row level security;

-- No public policies: all access via service role in /api/waitlist
