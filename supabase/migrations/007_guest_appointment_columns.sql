-- Guest booking columns on appointments table
alter table appointments add column if not exists is_guest boolean default false;
alter table appointments add column if not exists guest_name text;
alter table appointments add column if not exists guest_phone text;
alter table appointments add column if not exists guest_age integer;
alter table appointments add column if not exists guest_gender text;
