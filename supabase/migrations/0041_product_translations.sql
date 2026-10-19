-- Per-locale product name/description. Storefront falls back to name/description
-- (English) and then lib/i18n/catalog/*.ts when a locale key is missing.

alter table public.products
  add column if not exists translations jsonb not null default '{}'::jsonb;
