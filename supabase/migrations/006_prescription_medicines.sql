-- Add medicine list and extended fields to prescriptions
alter table prescriptions add column if not exists medicines jsonb default '[]';
alter table prescriptions add column if not exists fee integer default 0;
alter table prescriptions add column if not exists next_appointment_date date;
alter table prescriptions add column if not exists next_appointment_time text;
