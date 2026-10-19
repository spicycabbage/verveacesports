-- Storefront pageviews for Admin → Analytics. No PII (no IP, no user id).
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  site_id text not null
    check (site_id in ('verveace', 'bleeq-ca')),
  path text not null
    check (char_length(path) between 1 and 200),
  referrer_host text
    check (referrer_host is null or char_length(referrer_host) between 1 and 253),
  country text
    check (country is null or char_length(country) = 2),
  session_id text not null
    check (char_length(session_id) between 8 and 64),
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx
  on public.page_views (created_at desc);

create index if not exists page_views_site_created_idx
  on public.page_views (site_id, created_at desc);

comment on table public.page_views is
  'Anonymous storefront pageviews for admin traffic analytics';

alter table public.page_views enable row level security;

drop policy if exists "page_views_admin_read" on public.page_views;
create policy "page_views_admin_read" on public.page_views
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

create or replace function public.analytics_traffic_rollup(
  p_from timestamptz,
  p_to timestamptz,
  p_site_id text default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select *
    from public.page_views
    where created_at >= p_from
      and created_at <= p_to
      and (p_site_id is null or site_id = p_site_id)
  ),
  summary as (
    select
      count(*)::int as pageviews,
      count(distinct session_id)::int as visitors
    from filtered
  ),
  daily as (
    select
      to_char(created_at at time zone 'America/Los_Angeles', 'YYYY-MM-DD') as day,
      count(*)::int as pageviews,
      count(distinct session_id)::int as visitors
    from filtered
    group by 1
  ),
  paths as (
    select
      path,
      count(*)::int as pageviews,
      count(distinct session_id)::int as visitors
    from filtered
    group by path
    order by pageviews desc
    limit 15
  ),
  referrers as (
    select
      coalesce(nullif(referrer_host, ''), '(direct)') as host,
      count(*)::int as pageviews
    from filtered
    group by 1
    order by pageviews desc
    limit 10
  ),
  countries as (
    select
      coalesce(country, '—') as country,
      count(*)::int as pageviews,
      count(distinct session_id)::int as visitors
    from filtered
    group by 1
    order by pageviews desc
    limit 10
  )
  select jsonb_build_object(
    'pageviews', coalesce((select pageviews from summary), 0),
    'visitors', coalesce((select visitors from summary), 0),
    'daily', coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from daily d), '[]'::jsonb),
    'paths', coalesce((select jsonb_agg(to_jsonb(p)) from paths p), '[]'::jsonb),
    'referrers', coalesce((select jsonb_agg(to_jsonb(r)) from referrers r), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(to_jsonb(c)) from countries c), '[]'::jsonb)
  );
$$;

revoke all on function public.analytics_traffic_rollup(timestamptz, timestamptz, text) from public;
grant execute on function public.analytics_traffic_rollup(timestamptz, timestamptz, text) to service_role;
