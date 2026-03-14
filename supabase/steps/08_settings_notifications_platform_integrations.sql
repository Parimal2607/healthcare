-- Step 08: Settings, Notification, and Platform Integration tables

create extension if not exists pgcrypto;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme_preference text not null default 'system' check (theme_preference in ('light', 'dark', 'system')),
  timezone text not null default 'Asia/Calcutta',
  date_format text not null default 'DD/MM/YYYY',
  landing_page text not null default '/dashboard',
  compact_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  in_app_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  security_alerts boolean not null default true,
  consent_updates boolean not null default true,
  claims_updates boolean not null default true,
  integration_alerts boolean not null default true,
  weekly_digest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null default 'general' check (category in ('general', 'security', 'claims', 'consent', 'integration', 'system')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  action_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_integrations (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('Epic', 'Cerner', 'Allscripts', 'FHIR Sandbox')),
  environment text not null default 'sandbox' check (environment in ('sandbox', 'staging', 'production')),
  base_url text not null,
  client_id text not null,
  connection_mode text not null default 'oauth2' check (connection_mode in ('oauth2', 'api_key', 'service_account')),
  status text not null default 'Disconnected' check (status in ('Connected', 'Syncing', 'Disconnected', 'Error')),
  sync_frequency text not null default 'daily' check (sync_frequency in ('realtime', 'hourly', 'daily', 'weekly')),
  is_enabled boolean not null default true,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_now()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row
execute procedure public.set_updated_at_now();

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute procedure public.set_updated_at_now();

drop trigger if exists trg_platform_integrations_updated_at on public.platform_integrations;
create trigger trg_platform_integrations_updated_at
before update on public.platform_integrations
for each row
execute procedure public.set_updated_at_now();

alter table public.user_settings enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.platform_integrations enable row level security;

-- user_settings policies

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- notification_preferences policies

drop policy if exists "Users can read own notification preferences" on public.notification_preferences;
create policy "Users can read own notification preferences"
on public.notification_preferences for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification preferences" on public.notification_preferences;
create policy "Users can insert own notification preferences"
on public.notification_preferences for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
on public.notification_preferences for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- notifications policies

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
on public.notifications for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Manager or admin can insert notifications" on public.notifications;
create policy "Manager or admin can insert notifications"
on public.notifications for insert
with check (public.is_manager_or_admin());

-- platform_integrations policies

drop policy if exists "Authenticated read platform integrations" on public.platform_integrations;
create policy "Authenticated read platform integrations"
on public.platform_integrations for select
using (auth.uid() is not null);

drop policy if exists "Manager insert platform integrations" on public.platform_integrations;
create policy "Manager insert platform integrations"
on public.platform_integrations for insert
with check (public.is_manager_or_admin());

drop policy if exists "Manager update platform integrations" on public.platform_integrations;
create policy "Manager update platform integrations"
on public.platform_integrations for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

drop policy if exists "Admin delete platform integrations" on public.platform_integrations;
create policy "Admin delete platform integrations"
on public.platform_integrations for delete
using (public.is_admin());

-- Seed defaults for existing users
insert into public.user_settings (user_id)
select up.id
from public.user_profiles up
left join public.user_settings us on us.user_id = up.id
where us.user_id is null;

insert into public.notification_preferences (user_id)
select up.id
from public.user_profiles up
left join public.notification_preferences np on np.user_id = up.id
where np.user_id is null;

-- Optional seed for platform integrations
insert into public.platform_integrations (platform, environment, base_url, client_id, connection_mode, status, sync_frequency, is_enabled)
values
  ('Epic', 'sandbox', 'https://api.epic.example.com/fhir', 'epic-sandbox-client', 'oauth2', 'Connected', 'hourly', true),
  ('Cerner', 'sandbox', 'https://api.cerner.example.com/fhir', 'cerner-sandbox-client', 'oauth2', 'Syncing', 'daily', true),
  ('Allscripts', 'sandbox', 'https://api.allscripts.example.com/fhir', 'allscripts-sandbox-client', 'api_key', 'Disconnected', 'daily', false)
on conflict do nothing;