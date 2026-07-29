-- Log chatbot user questions for admin review, segmented by storefront.
create table if not exists public.chat_questions (
  id uuid primary key default gen_random_uuid(),
  site_id text not null default 'verveace'
    check (site_id in ('verveace', 'bleeq-ca')),
  question text not null
    check (char_length(question) between 1 and 8000),
  locale text,
  country text
    check (country is null or country in ('US', 'CA')),
  currency text
    check (currency is null or currency in ('USD', 'CAD')),
  user_id uuid references auth.users (id) on delete set null,
  message_count integer
    check (message_count is null or message_count > 0),
  created_at timestamptz not null default now()
);

create index if not exists chat_questions_created_idx
  on public.chat_questions (created_at desc);

create index if not exists chat_questions_site_created_idx
  on public.chat_questions (site_id, created_at desc);

comment on table public.chat_questions is
  'User questions submitted to storefront support chatbots';
comment on column public.chat_questions.site_id is
  'Storefront that received the question: verveace | bleeq-ca';

alter table public.chat_questions enable row level security;

drop policy if exists "chat_questions_admin_read" on public.chat_questions;
create policy "chat_questions_admin_read" on public.chat_questions
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );
