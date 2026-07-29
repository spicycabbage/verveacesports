-- Segment newsletter signups by storefront (verveace vs bleeq-ca).
alter table public.newsletter_subscribers
  add column if not exists site_id text not null default 'verveace';

alter table public.newsletter_subscribers
  drop constraint if exists newsletter_subscribers_email_unique;

alter table public.newsletter_subscribers
  drop constraint if exists newsletter_subscribers_email_site_unique;

alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_email_site_unique unique (email, site_id);

create index if not exists newsletter_subscribers_site_id_idx
  on public.newsletter_subscribers (site_id);

comment on column public.newsletter_subscribers.site_id is
  'Storefront that collected the email: verveace | bleeq-ca';
