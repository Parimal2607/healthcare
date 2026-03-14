-- Step 06: Allow manager write access (insert/update), member read-only, admin full access

create or replace function public.is_manager_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('admin', 'manager')
      and up.status = 'active'
  );
$$;

revoke all on function public.is_manager_or_admin() from public;
grant execute on function public.is_manager_or_admin() to authenticated;

-- providers

drop policy if exists "Manager insert providers" on public.providers;
create policy "Manager insert providers"
on public.providers for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update providers" on public.providers;
create policy "Manager update providers"
on public.providers for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

-- patients

drop policy if exists "Manager insert patients" on public.patients;
create policy "Manager insert patients"
on public.patients for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update patients" on public.patients;
create policy "Manager update patients"
on public.patients for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

-- encounters

drop policy if exists "Manager insert encounters" on public.encounters;
create policy "Manager insert encounters"
on public.encounters for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update encounters" on public.encounters;
create policy "Manager update encounters"
on public.encounters for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

-- observations

drop policy if exists "Manager insert observations" on public.observations;
create policy "Manager insert observations"
on public.observations for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update observations" on public.observations;
create policy "Manager update observations"
on public.observations for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

-- consents

drop policy if exists "Manager insert consents" on public.consents;
create policy "Manager insert consents"
on public.consents for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update consents" on public.consents;
create policy "Manager update consents"
on public.consents for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

-- claims

drop policy if exists "Manager insert claims" on public.claims;
create policy "Manager insert claims"
on public.claims for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update claims" on public.claims;
create policy "Manager update claims"
on public.claims for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

-- integrations

drop policy if exists "Manager insert integrations" on public.integrations;
create policy "Manager insert integrations"
on public.integrations for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update integrations" on public.integrations;
create policy "Manager update integrations"
on public.integrations for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());
