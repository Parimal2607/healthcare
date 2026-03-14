-- Step 5: Promote one account to admin role
-- Replace with your real email used in signup.

update public.user_profiles
set role = 'admin', status = 'active'
where email = 'admin@healthbridge.com';

-- Verify admin user
select id, email, role, status
from public.user_profiles
where email = 'admin@healthbridge.com';
