-- Expo push tokens for the Android POS app. Service role only (API routes).

create table if not exists public.admin_expo_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  unique (token)
);

create index if not exists admin_expo_push_tokens_user_idx
  on public.admin_expo_push_tokens (user_id);

alter table public.admin_expo_push_tokens enable row level security;

revoke all on public.admin_expo_push_tokens from anon, authenticated;
grant all on public.admin_expo_push_tokens to service_role;
