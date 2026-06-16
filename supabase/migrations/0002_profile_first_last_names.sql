-- Separate first_name / last_name on profiles + richer handle_new_user (OAuth-friendly).

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;

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
begin
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

  insert into public.profiles (id, email, full_name, first_name, last_name, referral_code, referred_by)
  values (
    new.id,
    new.email,
    full_display,
    fn,
    ln,
    new_code,
    referrer_id
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
