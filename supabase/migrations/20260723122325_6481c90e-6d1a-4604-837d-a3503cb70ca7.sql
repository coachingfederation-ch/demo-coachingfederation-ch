
create type public.article_status as enum ('draft','scheduled','published','unpublished');
create type public.article_lang as enum ('en','fr','de','it');

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  language public.article_lang not null,
  title text not null default '',
  excerpt text not null default '',
  content text not null default '',
  status public.article_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  first_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;

create policy "authors read own" on public.articles for select to authenticated using (auth.uid() = author_id);
create policy "authors insert own" on public.articles for insert to authenticated with check (auth.uid() = author_id);
create policy "authors update own" on public.articles for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "authors delete own" on public.articles for delete to authenticated using (auth.uid() = author_id);

create or replace function public.tg_articles_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_touch_updated_at
before update on public.articles
for each row execute function public.tg_articles_touch_updated_at();
