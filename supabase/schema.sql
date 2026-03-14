-- Run this SQL in Supabase SQL Editor.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  organization text not null,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view their own profile"
on public.user_profiles
for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.user_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row
execute procedure public.set_profile_updated_at();
