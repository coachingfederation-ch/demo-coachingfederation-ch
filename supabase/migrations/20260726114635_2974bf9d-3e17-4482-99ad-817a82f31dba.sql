-- 1. Roles
create type public.app_role as enum ('admin', 'editor', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.user_roles (user_id, role)
select id, r.role from auth.users, (values ('admin'::public.app_role), ('editor'::public.app_role)) as r(role)
on conflict do nothing;

create or replace function public.is_editor(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin') or public.has_role(_user_id, 'editor')
$$;

-- 2. Profiles: remove email PII, restrict reads
alter table public.profiles drop column if exists email;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''), ' ', 1), ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULLIF(substr(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''), strpos(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''), ' ') + 1), COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')), ''),
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

drop policy if exists "profiles public read" on public.profiles;

create policy "profiles public read published authors" on public.profiles
  for select to anon
  using (exists (select 1 from public.articles a where a.author_id = profiles.id and a.status = 'published'));

create policy "profiles authenticated read" on public.profiles
  for select to authenticated using (true);

-- 3. Categories: editors only for writes
drop policy if exists "categories editors write" on public.categories;

create policy "categories editors write" on public.categories
  for all to authenticated
  using (public.is_editor(auth.uid()))
  with check (public.is_editor(auth.uid()));

-- 4. Translations: author or editor
drop policy if exists "translations editors read" on public.article_translations;
drop policy if exists "translations editors insert" on public.article_translations;
drop policy if exists "translations editors update" on public.article_translations;
drop policy if exists "translations editors delete" on public.article_translations;

create policy "translations author or editor read" on public.article_translations
  for select to authenticated
  using (
    public.is_editor(auth.uid())
    or exists (select 1 from public.articles a where a.id = article_translations.article_id and a.author_id = auth.uid())
    or exists (select 1 from public.articles a where a.id = article_translations.article_id and a.status = 'published')
  );

create policy "translations author or editor insert" on public.article_translations
  for insert to authenticated
  with check (
    public.is_editor(auth.uid())
    or exists (select 1 from public.articles a where a.id = article_translations.article_id and a.author_id = auth.uid())
  );

create policy "translations author or editor update" on public.article_translations
  for update to authenticated
  using (
    public.is_editor(auth.uid())
    or exists (select 1 from public.articles a where a.id = article_translations.article_id and a.author_id = auth.uid())
  )
  with check (
    public.is_editor(auth.uid())
    or exists (select 1 from public.articles a where a.id = article_translations.article_id and a.author_id = auth.uid())
  );

create policy "translations author or editor delete" on public.article_translations
  for delete to authenticated
  using (
    public.is_editor(auth.uid())
    or exists (select 1 from public.articles a where a.id = article_translations.article_id and a.author_id = auth.uid())
  );