-- Applied to the production project on 2026-09-27.
-- Per-user vocabulary collection, saved text/handwriting drafts and reminder state.

create table if not exists public.user_wordbook_entries (
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id bigint not null references public.vocabulary_words(id) on delete cascade,
  source_context text not null default '',
  note text not null default '',
  added_to_task_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, word_id)
);
create index if not exists user_wordbook_entries_user_created_idx on public.user_wordbook_entries(user_id, created_at desc);
alter table public.user_wordbook_entries enable row level security;
create policy "Users manage own wordbook entries" on public.user_wordbook_entries for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.user_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '未命名便签',
  text_content text not null default '',
  drawing_data text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists user_drafts_user_updated_idx on public.user_drafts(user_id, updated_at desc);
alter table public.user_drafts enable row level security;
create policy "Users manage own drafts" on public.user_drafts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.user_settings add column if not exists reminder_enabled boolean not null default true;

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reminder_date date not null,
  channel text not null default 'email',
  status text not null default 'queued',
  provider_message_id text,
  detail text not null default '',
  created_at timestamptz not null default now(),
  unique(user_id, reminder_date, channel)
);
create index if not exists reminder_logs_user_date_idx on public.reminder_logs(user_id, reminder_date desc);
alter table public.reminder_logs enable row level security;
create policy "Users read own reminder logs" on public.reminder_logs for select to authenticated using ((select auth.uid()) = user_id);
