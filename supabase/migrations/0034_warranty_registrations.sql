-- Warranty product registrations submitted from /warranty (both storefronts).
create table if not exists public.warranty_registrations (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  full_name text not null,
  email text not null,
  order_number text not null,
  product_slug text not null,
  product_label text not null,
  serial_number text,
  purchase_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists warranty_registrations_created_at_idx
  on public.warranty_registrations (created_at desc);

create index if not exists warranty_registrations_site_id_idx
  on public.warranty_registrations (site_id);

create index if not exists warranty_registrations_email_idx
  on public.warranty_registrations (email);

comment on table public.warranty_registrations is
  'Customer warranty registration submissions from the storefront warranty page';

comment on column public.warranty_registrations.site_id is
  'Storefront that collected the registration: verveace | bleeq-ca';

alter table public.warranty_registrations enable row level security;

create policy "warranty_registrations_admin_read" on public.warranty_registrations
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );
