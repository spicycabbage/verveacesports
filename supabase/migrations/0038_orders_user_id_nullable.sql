-- Walk-in POS sales have no customer account.
alter table public.orders
  alter column user_id drop not null;
