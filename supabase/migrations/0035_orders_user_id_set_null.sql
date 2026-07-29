-- Allow deleting auth users / profiles without wiping order history.
-- Orders keep their totals/emails; user_id becomes null when the account is removed.

alter table public.orders
  alter column user_id drop not null;

do $$
declare
  fk_name text;
begin
  select con.conname into fk_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'orders'
    and con.contype = 'f'
    and pg_get_constraintdef(con.oid) ilike '%user_id%profiles%';

  if fk_name is not null then
    execute format('alter table public.orders drop constraint %I', fk_name);
  end if;
end $$;

alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete set null;
