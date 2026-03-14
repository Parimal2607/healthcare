-- Step 07: Admin-focused table view for manager/member accounts

create or replace view public.admin_team_members_v as
select
  id,
  full_name,
  email,
  organization,
  role,
  status,
  created_at,
  updated_at
from public.user_profiles
where role in ('manager', 'member');

grant select on public.admin_team_members_v to authenticated;
