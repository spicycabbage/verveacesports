-- Product reviews: public read of published; new inserts only from verified buyers.

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  author_display_name text not null check (char_length(trim(author_display_name)) between 1 and 120),
  is_verified_purchase boolean not null default false,
  is_published boolean not null default true,
  source text not null default 'storefront'
    check (source in ('storefront', 'legacy', 'import')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_reviews_user_product_uidx
  on public.product_reviews (user_id, product_id)
  where user_id is not null;

create index if not exists product_reviews_product_published_idx
  on public.product_reviews (product_id, created_at desc)
  where is_published = true;

alter table public.product_reviews enable row level security;

drop policy if exists "product_reviews_public_read" on public.product_reviews;
create policy "product_reviews_public_read" on public.product_reviews
  for select using (
    is_published = true
    or user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- New storefront reviews: must be the signed-in buyer with a paid order for this product.
drop policy if exists "product_reviews_insert_verified" on public.product_reviews;
create policy "product_reviews_insert_verified" on public.product_reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and source = 'storefront'
    and is_verified_purchase = true
    and is_published = true
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and oi.product_id = product_reviews.product_id
        and o.financial_status in ('paid', 'partially_refunded')
        and (product_reviews.order_id is null or product_reviews.order_id = o.id)
    )
  );

drop policy if exists "product_reviews_delete_own" on public.product_reviews;
create policy "product_reviews_delete_own" on public.product_reviews
  for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "product_reviews_admin_update" on public.product_reviews;
create policy "product_reviews_admin_update" on public.product_reviews
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create or replace function public.can_review_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and oi.product_id = p_product_id
        and o.financial_status in ('paid', 'partially_refunded')
    )
    and not exists (
      select 1
      from public.product_reviews r
      where r.user_id = auth.uid()
        and r.product_id = p_product_id
    );
$$;

revoke all on function public.can_review_product(uuid) from public;
grant execute on function public.can_review_product(uuid) to authenticated;

-- Seed existing Judge.me storefront reviews (page-1 scrape) onto Standard Lens.
insert into public.product_reviews (
  product_id,
  user_id,
  order_id,
  rating,
  title,
  body,
  author_display_name,
  is_verified_purchase,
  is_published,
  source
)
select
  p.id,
  null,
  null,
  v.rating,
  null,
  v.body,
  v.author_display_name,
  true,
  true,
  'legacy'
from public.products p
cross join (
  values
    (
      5,
      'Yuet ching Lai',
      'Functional products, the good effect and practicality of all kinds of gloves, good photography effect, are sports products worth mentioning and can continue to be used.'
    ),
    (
      5,
      'Natasha Armstrong',
      'This is a great product. I enjoy the whole view it shows when I am looking at the video. Audio sound great as well.'
    ),
    (
      5,
      'Owen Ashley',
      'love these sunglasses.  the fact im playing music and I can record videos is just everything!!! I used them know a bright hot sunshine day in NYC. I was pleased to say the very least. these are worth it!!! I also bought the Bluetooth remote super helpful and worth it to Nd I have the battery pack. I didnt have to use it yet. the battery lastlong for the amount of pics, videos and playing music that I did while bike riding.'
    ),
    (
      4,
      'Mosell',
      'Feels like great quality, definitely not paper thin & flimsy. Sturdy & looks amazing'
    ),
    (
      4,
      'Altius',
      'Nice glasses! Wish it would be easier to switch between modes'
    )
) as v(rating, author_display_name, body)
where p.slug = 'bleequp-ranger-standard-lens'
  and not exists (
    select 1
    from public.product_reviews r
    where r.product_id = p.id
      and r.source = 'legacy'
      and r.author_display_name = v.author_display_name
      and r.body = v.body
  );
