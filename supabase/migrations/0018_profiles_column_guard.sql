-- Critical fix: profiles_update_own RLS lets any authenticated user UPDATE their
-- own row with no column restrictions, so a client using the public anon key can
-- self-escalate (is_admin=true) or mint loyalty points via PostgREST directly.
--
-- This trigger blocks changes to privileged columns unless the caller is a
-- privileged DB role (service_role / postgres) or a SECURITY DEFINER function
-- (award_loyalty_on_paid_order, handle_new_user) which run as the table owner.

create or replace function public.enforce_profile_column_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Privileged roles (service_role key, direct postgres, definer functions
  -- owned by postgres) bypass the guard.
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

revoke all on function public.enforce_profile_column_guard() from anon, authenticated;

drop trigger if exists profiles_column_guard on public.profiles;
create trigger profiles_column_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_column_guard();
