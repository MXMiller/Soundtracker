-- Run once in the Supabase SQL Editor after selecting the app's project.
-- The browser only uses the publishable key; Row Level Security protects data.

create or replace function public.create_soundtracker_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(new.email, '@', 1)
  );
  insert into public.profiles (id, username, email)
  values (new.id, requested_username, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_soundtracker on auth.users;
create trigger on_auth_user_created_soundtracker
  after insert on auth.users
  for each row execute procedure public.create_soundtracker_profile();

alter table public.profiles enable row level security;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- This view exposes profile details without exposing email addresses.
create or replace view public.public_profiles
with (security_barrier = true)
as select id, username, description, profile_image_file_path
from public.profiles;
grant select on public.public_profiles to authenticated;
grant select, update on public.profiles to authenticated;

create table if not exists public.soundtracker_soundtrack_documents (
  id text primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  owner_name text not null,
  name text not null,
  visibility text not null check (visibility in ('open', 'public', 'private')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists soundtracker_documents_owner_idx
  on public.soundtracker_soundtrack_documents(owner_id);
create index if not exists soundtracker_documents_visibility_idx
  on public.soundtracker_soundtrack_documents(visibility);

create table if not exists public.soundtracker_document_access (
  soundtrack_id text not null references public.soundtracker_soundtrack_documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission text not null check (permission in ('view', 'edit')),
  granted_by uuid not null references public.profiles(id) on delete cascade,
  primary key (soundtrack_id, user_id)
);

create table if not exists public.soundtracker_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  soundtrack_id text not null references public.soundtracker_soundtrack_documents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, soundtrack_id)
);

grant select, insert, update, delete on public.soundtracker_soundtrack_documents to authenticated;
grant select, insert, update, delete on public.soundtracker_document_access to authenticated;
grant select, insert, update, delete on public.soundtracker_favorites to authenticated;

alter table public.soundtracker_soundtrack_documents enable row level security;
drop policy if exists "Visible soundtracks can be read" on public.soundtracker_soundtrack_documents;
create policy "Visible soundtracks can be read" on public.soundtracker_soundtrack_documents
  for select to authenticated using (
    owner_id = (select auth.uid())
    or visibility in ('public', 'open')
    or exists (
      select 1 from public.soundtracker_document_access a
      where a.soundtrack_id = id and a.user_id = (select auth.uid())
    )
  );
drop policy if exists "Owners and open soundtrack editors can update" on public.soundtracker_soundtrack_documents;
create policy "Owners and open soundtrack editors can update" on public.soundtracker_soundtrack_documents
  for update to authenticated using (
    owner_id = (select auth.uid()) or visibility = 'open'
    or exists (select 1 from public.soundtracker_document_access a
      where a.soundtrack_id = id and a.user_id = (select auth.uid()) and a.permission = 'edit')
  ) with check (
    owner_id = (select auth.uid()) or visibility = 'open'
    or exists (select 1 from public.soundtracker_document_access a
      where a.soundtrack_id = id and a.user_id = (select auth.uid()) and a.permission = 'edit')
  );
create or replace function public.prevent_soundtracker_document_owner_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.owner_id <> (select auth.uid()) and new.owner_id <> old.owner_id then
    raise exception 'Only a soundtrack owner can transfer ownership';
  end if;
  return new;
end;
$$;
drop trigger if exists soundtracker_documents_owner_immutable on public.soundtracker_soundtrack_documents;
create trigger soundtracker_documents_owner_immutable
  before update on public.soundtracker_soundtrack_documents
  for each row execute function public.prevent_soundtracker_document_owner_change();
drop policy if exists "Users can create their own soundtracks" on public.soundtracker_soundtrack_documents;
create policy "Users can create their own soundtracks" on public.soundtracker_soundtrack_documents
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "Owners can delete soundtracks" on public.soundtracker_soundtrack_documents;
create policy "Owners can delete soundtracks" on public.soundtracker_soundtrack_documents
  for delete to authenticated using (owner_id = (select auth.uid()));

alter table public.soundtracker_document_access enable row level security;
drop policy if exists "Users can read their access grants" on public.soundtracker_document_access;
create policy "Users can read their access grants" on public.soundtracker_document_access
  for select to authenticated using (
    user_id = (select auth.uid()) or granted_by = (select auth.uid())
  );
drop policy if exists "Soundtrack owners can manage access grants" on public.soundtracker_document_access;
create policy "Soundtrack owners can manage access grants" on public.soundtracker_document_access
  for all to authenticated using (exists (
    select 1 from public.soundtracker_soundtrack_documents d
    where d.id = soundtrack_id and d.owner_id = (select auth.uid())
  )) with check (exists (
    select 1 from public.soundtracker_soundtrack_documents d
    where d.id = soundtrack_id and d.owner_id = (select auth.uid())
  ));

alter table public.soundtracker_favorites enable row level security;
drop policy if exists "Users manage their own favorites" on public.soundtracker_favorites;
create policy "Users manage their own favorites" on public.soundtracker_favorites
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
