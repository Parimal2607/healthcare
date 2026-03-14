-- Step 4: Seed sample healthcare data for dashboard/admin APIs

insert into public.providers (provider_code, name, specialty, organization, patients_managed, status)
values
  ('PR-001', 'Dr. Hannah Lee', 'Cardiology', 'Mercy Health Network', 182, 'active'),
  ('PR-002', 'Dr. Arjun Mehta', 'Endocrinology', 'Northwell Partners', 146, 'active'),
  ('PR-003', 'Dr. Alicia Gomez', 'Family Medicine', 'CityCare Group', 210, 'onboarding')
on conflict (provider_code) do nothing;

insert into public.patients (patient_code, name, age, gender, last_visit, status, provider_id)
values
  ('PT-1001', 'Emma Carter', 45, 'Female', '2026-03-03', 'Active', (select id from public.providers where provider_code = 'PR-001')),
  ('PT-1002', 'Noah Bennett', 62, 'Male', '2026-03-10', 'Critical', (select id from public.providers where provider_code = 'PR-002')),
  ('PT-1003', 'Sophia Ramos', 31, 'Female', '2026-02-24', 'Active', (select id from public.providers where provider_code = 'PR-003')),
  ('PT-1004', 'Liam Shah', 52, 'Male', '2026-01-15', 'Inactive', (select id from public.providers where provider_code = 'PR-001')),
  ('PT-1005', 'Olivia Brooks', 27, 'Female', '2026-03-05', 'Active', (select id from public.providers where provider_code = 'PR-002')),
  ('PT-1006', 'James Nguyen', 39, 'Male', '2026-02-26', 'Active', (select id from public.providers where provider_code = 'PR-003'))
on conflict (patient_code) do nothing;

insert into public.encounters (encounter_code, patient_id, type, date, summary)
values
  ('EN-9001', (select id from public.patients where patient_code = 'PT-1001'), 'Outpatient', '2026-03-03', 'Blood pressure follow-up.'),
  ('EN-9002', (select id from public.patients where patient_code = 'PT-1002'), 'Emergency', '2026-03-10', 'Acute chest pain assessment.'),
  ('EN-9003', (select id from public.patients where patient_code = 'PT-1003'), 'Outpatient', '2026-02-24', 'Annual wellness check.'),
  ('EN-9004', (select id from public.patients where patient_code = 'PT-1002'), 'Inpatient', '2026-03-11', 'Observation and monitoring.')
on conflict (encounter_code) do nothing;

insert into public.observations (observation_code, patient_id, type, value, unit, date)
values
  ('OB-1001', (select id from public.patients where patient_code = 'PT-1001'), 'Blood Pressure', '128/82', 'mmHg', '2026-03-03'),
  ('OB-1002', (select id from public.patients where patient_code = 'PT-1002'), 'Troponin', '0.04', 'ng/mL', '2026-03-10'),
  ('OB-1003', (select id from public.patients where patient_code = 'PT-1003'), 'HbA1c', '5.8', '%', '2026-02-24')
on conflict (observation_code) do nothing;

insert into public.consents (consent_code, patient_name, organization, permission, status, granted_date)
values
  ('CS-001', 'Emma Carter', 'Mercy Health Network', 'Share CCD', 'Granted', '2026-02-10'),
  ('CS-002', 'Noah Bennett', 'Northwell Partners', 'Claims Access', 'Pending', '2026-03-08'),
  ('CS-003', 'Olivia Brooks', 'CityCare Group', 'FHIR API Read', 'Granted', '2026-01-22')
on conflict (consent_code) do nothing;

insert into public.claims (claim_code, patient_id, amount, status, submitted_at)
values
  ('CL-001', (select id from public.patients where patient_code = 'PT-1001'), 420.00, 'Approved', '2026-03-04'),
  ('CL-002', (select id from public.patients where patient_code = 'PT-1002'), 1860.50, 'Pending', '2026-03-10'),
  ('CL-003', (select id from public.patients where patient_code = 'PT-1003'), 230.00, 'Denied', '2026-02-24')
on conflict (claim_code) do nothing;

insert into public.integrations (vendor, status, last_sync, health)
values
  ('Epic', 'Connected', now() - interval '2 hours', 'Healthy'),
  ('Cerner', 'Syncing', now() - interval '30 minutes', 'Warning'),
  ('Allscripts', 'Disconnected', now() - interval '1 day', 'Critical')
on conflict (vendor) do nothing;
