-- Track which storefront a user originally signed up on.
alter table public.profiles
  add column if not exists site_id text not null default 'verveace';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_site_id_check'
  ) then
    alter table public.profiles
      add constraint profiles_site_id_check
      check (site_id in ('verveace', 'bleeq-ca'));
  end if;
end $$;

create index if not exists profiles_site_id_idx
  on public.profiles (site_id);

comment on column public.profiles.site_id is
  'Storefront where the account was created: verveace | bleeq-ca';

-- Backfill from earliest order when available.
update public.profiles p
set site_id = o.site_id
from (
  select distinct on (user_id) user_id, site_id
  from public.orders
  where user_id is not null
    and site_id in ('verveace', 'bleeq-ca')
  order by user_id, created_at asc
) o
where p.id = o.user_id
  and p.site_id = 'verveace'
  and o.site_id is distinct from p.site_id;

-- Persist site_id from auth metadata on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  ref_code text;
  referrer_id uuid;
  attempt int := 0;
  fn text;
  ln text;
  combo text;
  legacy text;
  full_display text;
  grant_admin boolean;
  origin_site text;
begin
  grant_admin := lower(coalesce(new.email, '')) = 'tubandzits@gmail.com';

  origin_site := lower(nullif(trim(coalesce(new.raw_user_meta_data->>'site_id', '')), ''));
  if origin_site is distinct from 'verveace' and origin_site is distinct from 'bleeq-ca' then
    origin_site := 'verveace';
  end if;

  loop
    new_code := gen_referral_code();
    exit when not exists (select 1 from public.profiles where referral_code = new_code);
    attempt := attempt + 1;
    if attempt > 10 then raise exception 'could not generate unique referral code'; end if;
  end loop;

  ref_code := nullif(upper(coalesce(new.raw_user_meta_data->>'ref','')), '');
  if ref_code is not null then
    select id into referrer_id from public.profiles where referral_code = ref_code;
  end if;

  fn := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'given_name', '')), '')
  );

  ln := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'family_name', '')), '')
  );

  combo := nullif(trim(concat_ws(' ', fn, ln)), '');
  legacy := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');
  full_display := coalesce(combo, legacy);

  insert into public.profiles (
    id, email, full_name, first_name, last_name, referral_code, referred_by, is_admin, site_id
  )
  values (
    new.id,
    new.email,
    full_display,
    fn,
    ln,
    new_code,
    referrer_id,
    grant_admin,
    origin_site
  );

  if referrer_id is not null then
    insert into public.referrals (referrer_id, referee_id, status)
    values (referrer_id, new.id, 'pending')
    on conflict (referee_id) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Users must not rewrite their own origin.
create or replace function public.enforce_profile_column_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Not allowed to modify is_admin';
  end if;
  if new.loyalty_points is distinct from old.loyalty_points then
    raise exception 'Not allowed to modify loyalty_points';
  end if;
  if new.referral_code is distinct from old.referral_code then
    raise exception 'Not allowed to modify referral_code';
  end if;
  if new.referred_by is distinct from old.referred_by then
    raise exception 'Not allowed to modify referred_by';
  end if;
  if new.email is distinct from old.email then
    raise exception 'Not allowed to modify email';
  end if;
  if new.id is distinct from old.id then
    raise exception 'Not allowed to modify id';
  end if;
  if new.site_id is distinct from old.site_id then
    raise exception 'Not allowed to modify site_id';
  end if;

  return new;
end;
$$;
