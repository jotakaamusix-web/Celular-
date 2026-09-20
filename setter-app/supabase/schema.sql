-- Setter Diagnostic App — Supabase schema
-- Run this once in the Supabase SQL editor of a new project.

create extension if not exists "pgcrypto";

-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'setter' check (role in ('owner','setter')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

create policy "profiles: authenticated can read"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles: self can update own name"
  on public.profiles for update
  using (auth.uid() = id);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ businesses ============
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  phone_number text not null default '',
  color_primary text not null default '#2563eb',
  color_secondary text not null default '#1e3a8a',
  color_accent text not null default '#f59e0b',
  font_heading text not null default 'Inter',
  font_body text not null default 'Inter',
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "businesses: authenticated can read"
  on public.businesses for select
  using (auth.role() = 'authenticated');

create policy "businesses: owner can write"
  on public.businesses for all
  using (public.is_owner()) with check (public.is_owner());

-- ============ business_info (protocols, prices, services, negotiation notes) ============
create table public.business_info (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  section text not null check (section in ('protocolo','servicios','precios','negociacion','otros')),
  title text not null,
  content text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.business_info enable row level security;

create policy "business_info: authenticated can read"
  on public.business_info for select
  using (auth.role() = 'authenticated');

create policy "business_info: owner can write"
  on public.business_info for all
  using (public.is_owner()) with check (public.is_owner());

-- ============ chat_messages (AI chat log, per business + author) ============
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages: owner reads all, users read own"
  on public.chat_messages for select
  using (public.is_owner() or author_id = auth.uid());

create policy "chat_messages: users insert own turns"
  on public.chat_messages for insert
  with check (author_id = auth.uid());

-- ============ daily_diagnostics (one entry per business per day) ============
create table public.daily_diagnostics (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null default current_date,
  summary text not null,
  issues text not null default '',
  next_steps text not null default '',
  created_at timestamptz not null default now()
);

alter table public.daily_diagnostics enable row level security;

create policy "daily_diagnostics: authenticated can read"
  on public.daily_diagnostics for select
  using (auth.role() = 'authenticated');

create policy "daily_diagnostics: authenticated can insert own"
  on public.daily_diagnostics for insert
  with check (author_id = auth.uid());

-- ============ seed: the two business lines ============
insert into public.businesses (slug, name, phone_number, color_primary, color_secondary, color_accent, font_heading, font_body) values
  ('negocio-a', 'Negocio A', '+00 000 000 0001', '#2563eb', '#1e293b', '#f59e0b', 'Fraunces', 'Inter'),
  ('negocio-b', 'Negocio B', '+00 000 000 0002', '#be123c', '#1c1917', '#22c55e', 'Sora', 'Inter')
on conflict (slug) do nothing;

-- ============ after running this ============
-- 1. Create your two users in Authentication > Users (owner + setter), with a password each.
-- 2. In the SQL editor, promote yourself to owner:
--      update public.profiles set role = 'owner', full_name = 'Tu nombre' where id = '<tu-user-id>';
--      update public.profiles set full_name = 'Nombre de tu setter' where id = '<user-id-de-tu-setter>';
-- 3. Edit the seed row above (or use the app's Protocolo/Info screen once logged in as owner)
--    to rename "Negocio A" / "Negocio B" and set the real phone numbers and colors.
