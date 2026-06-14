-- Per-doctor currency for fees, bills, prescriptions, and patient portal.
alter table doctors add column if not exists currency text default 'USD';
