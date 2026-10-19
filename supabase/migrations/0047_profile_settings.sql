-- Account settings: phone + default address on the profile, and a way for the
-- signed-in user to know whether they have a password (Google-only accounts
-- don't, so Settings shows "Set password" without asking for the current one).
-- Idempotent: safe to re-run.

alter table public.profiles add column if not exists phone text;
-- Same shape as orders.shipping_address minus name/phone/country:
-- { line1, line2, city, state, postal_code }. Country stays in profiles.country.
alter table public.profiles add column if not exists default_address jsonb;

create or replace function public.current_user_has_password()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(u.encrypted_password <> '', false)
  from auth.users u
  where u.id = auth.uid();
$$;

revoke all on function public.current_user_has_password() from public, anon;
grant execute on function public.current_user_has_password() to authenticated;
