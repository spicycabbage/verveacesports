-- Live-agent support chats. Service role only (API routes).
-- Shoppers never read these tables from the browser; admins go through /api/admin/chat.

create table if not exists public.live_chats (
  id uuid primary key default gen_random_uuid(),
  site_id text not null default 'verveace'
    check (site_id in ('verveace', 'bleeq-ca')),
  status text not null default 'requested'
    check (status in ('requested', 'active', 'closed')),
  customer_user_id uuid references auth.users (id) on delete set null,
  customer_email text,
  customer_name text,
  visitor_token_hash text not null,
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_by_email text,
  accepted_by_name text,
  accepted_at timestamptz,
  closed_by uuid references auth.users (id) on delete set null,
  closed_at timestamptz,
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_chats_status_last_msg_idx
  on public.live_chats (status, last_message_at desc);

create index if not exists live_chats_customer_status_idx
  on public.live_chats (customer_user_id, status)
  where customer_user_id is not null;

create index if not exists live_chats_token_hash_idx
  on public.live_chats (visitor_token_hash);

create table if not exists public.live_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.live_chats (id) on delete cascade,
  sender_role text not null
    check (sender_role in ('customer', 'admin', 'system')),
  sender_user_id uuid references auth.users (id) on delete set null,
  sender_email text,
  body text not null
    check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists live_chat_messages_chat_created_idx
  on public.live_chat_messages (chat_id, created_at);

comment on table public.live_chats is
  'Storefront live-agent requests accepted by admin staff';
comment on table public.live_chat_messages is
  'Messages inside a live-agent conversation';

alter table public.live_chats enable row level security;
alter table public.live_chat_messages enable row level security;

revoke all on public.live_chats from anon, authenticated;
revoke all on public.live_chat_messages from anon, authenticated;
grant all on public.live_chats to service_role;
grant all on public.live_chat_messages to service_role;
