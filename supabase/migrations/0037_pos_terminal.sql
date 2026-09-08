-- In-person POS: channel on orders, Stripe Terminal location on warehouse,
-- and skip loyalty when a walk-in order has no customer account.

alter table public.orders
  add column if not exists sales_channel text not null default 'online';

-- Walk-in POS sales have no customer account.
alter table public.orders
  alter column user_id drop not null;

do $$ begin
  alter table public.orders
    add constraint orders_sales_channel_check
    check (sales_channel in ('online', 'pos'));
exception when duplicate_object then null; end $$;

alter table public.locations
  add column if not exists stripe_location_id text,
  add column if not exists stripe_location_id_cad text,
  add column if not exists tax_country text,
  add column if not exists tax_region text;

create or replace function public.award_loyalty_on_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  earn_points integer;
  ref_row public.referrals%rowtype;
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    if new.user_id is null then
      return new;
    end if;

    earn_points := floor(new.subtotal)::int;
    if earn_points > 0 then
      insert into public.loyalty_transactions (user_id, order_id, type, points, note)
      values (new.user_id, new.id, 'earn_purchase', earn_points,
              'Earned on order ' || new.id::text);
      update public.profiles
        set loyalty_points = loyalty_points + earn_points
        where id = new.user_id;
    end if;

    select * into ref_row
      from public.referrals
      where referee_id = new.user_id and status = 'pending'
      limit 1;
    if found then
      update public.referrals
        set status = 'qualified', qualified_at = now()
        where id = ref_row.id;

      insert into public.loyalty_transactions (user_id, order_id, type, points, note)
      values
        (ref_row.referrer_id, new.id, 'earn_referral', 100, 'Referral bonus: friend purchased'),
        (ref_row.referee_id,  new.id, 'earn_referral', 100, 'Welcome bonus: referred signup');
      update public.profiles set loyalty_points = loyalty_points + 100
        where id in (ref_row.referrer_id, ref_row.referee_id);
    end if;
  end if;
  return new;
end;
$$;
