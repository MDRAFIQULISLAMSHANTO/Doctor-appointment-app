-- Allow prescriptions for guest appointments (no patient row).
alter table prescriptions alter column patient_id drop not null;

-- Ensure prescription detail columns exist (idempotent — safe if already run).
alter table prescriptions add column if not exists medicines jsonb default '[]';
alter table prescriptions add column if not exists fee integer default 0;
alter table prescriptions add column if not exists next_appointment_date date;
alter table prescriptions add column if not exists next_appointment_time text;
