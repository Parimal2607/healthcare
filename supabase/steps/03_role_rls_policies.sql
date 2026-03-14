-- Step 3: Role helpers + RLS policies

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'admin'
      and up.status = 'active'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admin can view all user profiles
alter table public.user_profiles enable row level security;

drop policy if exists "Admins can view all profiles" on public.user_profiles;
create policy "Admins can view all profiles"
on public.user_profiles
for select
using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.user_profiles;
create policy "Admins can update all profiles"
on public.user_profiles
for update
using (public.is_admin())
with check (public.is_admin());

-- Apply RLS to all domain tables
alter table public.providers enable row level security;
alter table public.patients enable row level security;
alter table public.encounters enable row level security;
alter table public.observations enable row level security;
alter table public.consents enable row level security;
alter table public.claims enable row level security;
alter table public.integrations enable row level security;

-- Read access for all authenticated users

drop policy if exists "Authenticated read providers" on public.providers;
create policy "Authenticated read providers" on public.providers for select using (auth.uid() is not null);

drop policy if exists "Authenticated read patients" on public.patients;
create policy "Authenticated read patients" on public.patients for select using (auth.uid() is not null);

drop policy if exists "Authenticated read encounters" on public.encounters;
create policy "Authenticated read encounters" on public.encounters for select using (auth.uid() is not null);

drop policy if exists "Authenticated read observations" on public.observations;
create policy "Authenticated read observations" on public.observations for select using (auth.uid() is not null);

drop policy if exists "Authenticated read consents" on public.consents;
create policy "Authenticated read consents" on public.consents for select using (auth.uid() is not null);

drop policy if exists "Authenticated read claims" on public.claims;
create policy "Authenticated read claims" on public.claims for select using (auth.uid() is not null);

drop policy if exists "Authenticated read integrations" on public.integrations;
create policy "Authenticated read integrations" on public.integrations for select using (auth.uid() is not null);

-- Write access for admin only

drop policy if exists "Admin manage providers" on public.providers;
create policy "Admin manage providers" on public.providers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage patients" on public.patients;
create policy "Admin manage patients" on public.patients for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage encounters" on public.encounters;
create policy "Admin manage encounters" on public.encounters for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage observations" on public.observations;
create policy "Admin manage observations" on public.observations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage consents" on public.consents;
create policy "Admin manage consents" on public.consents for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage claims" on public.claims;
create policy "Admin manage claims" on public.claims for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage integrations" on public.integrations;
create policy "Admin manage integrations" on public.integrations for all using (public.is_admin()) with check (public.is_admin());
