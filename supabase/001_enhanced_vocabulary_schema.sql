-- Run once in Supabase SQL Editor before the import script.
-- The existing vocabulary tables are preserved; this only adds the comparison table.

create table if not exists public.word_comparisons (
  word_id bigint primary key references public.vocabulary_words(id) on delete cascade,
  similar_words jsonb not null default '[]'::jsonb,
  distinction text not null default '',
  contrast_example text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.word_comparisons enable row level security;

drop policy if exists "Authenticated users can read word comparisons" on public.word_comparisons;
create policy "Authenticated users can read word comparisons"
on public.word_comparisons for select to authenticated using (true);
