-- Step 2: Create healthcare domain tables

create extension if not exists pgcrypto;

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  provider_code text not null unique,
  name text not null,
  specialty text not null,
  organization text not null,
  patients_managed integer not null default 0,
  status text not null default 'active' check (status in ('active', 'onboarding', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  patient_code text not null unique,
  name text not null,
  age integer not null check (age > 0),
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  last_visit date,
  status text not null default 'active' check (status in ('Active', 'Critical', 'Inactive')),
  provider_id uuid references public.providers(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  encounter_code text not null unique,
  patient_id uuid not null references public.patients(id) on delete cascade,
  type text not null check (type in ('Inpatient', 'Outpatient', 'Emergency')),
  date date not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  observation_code text not null unique,
  patient_id uuid not null references public.patients(id) on delete cascade,
  type text not null,
  value text not null,
  unit text,
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  consent_code text not null unique,
  patient_name text not null,
  organization text not null,
  permission text not null,
  status text not null check (status in ('Granted', 'Pending', 'Revoked')),
  granted_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  claim_code text not null unique,
  patient_id uuid not null references public.patients(id) on delete cascade,
  amount numeric(12,2) not null,
  status text not null check (status in ('Approved', 'Pending', 'Denied')),
  submitted_at date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  vendor text not null unique,
  status text not null check (status in ('Connected', 'Syncing', 'Disconnected')),
  last_sync timestamptz,
  health text not null check (health in ('Healthy', 'Warning', 'Critical')),
  created_at timestamptz not null default now()
);
