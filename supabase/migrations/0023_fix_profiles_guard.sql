-- Fix 0018: the guard was SECURITY DEFINER, so current_user inside the trigger
-- was always the function owner (postgres) and the privileged-role check passed
-- for every caller — the guard never blocked anything. SECURITY INVOKER makes
-- current_user the role actually executing the UPDATE (e.g. `authenticated`
-- via PostgREST), while trusted paths still pass:
--   - service_role (server actions / webhooks)  -> current_user = service_role
--   - SECURITY DEFINER fns owned by postgres (handle_new_user,
--     award_loyalty_on_paid_order, adjust/redeem loyalty RPCs) -> postgres
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

  return new;
end;
$$;
