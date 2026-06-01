-- ── DOCTOR WEEKLY SCHEDULE ────────────────────────────────────────────────────
create table if not exists doctor_schedule (
  id           uuid primary key default uuid_generate_v4(),
  doctor_id    uuid references doctors(id) on delete cascade not null,
  day_of_week  text not null check (day_of_week in ('Sun','Mon','Tue','Wed','Thu','Fri','Sat')),
  is_open      boolean default true,
  start_time   text default '9:00 AM',
  end_time     text default '5:00 PM',
  slot_minutes int default 30,
  max_patients int default 20,
  unique (doctor_id, day_of_week)
);

-- ── DOCTOR BLOCKED DATES ─────────────────────────────────────────────────────
create table if not exists doctor_blocked_dates (
  id        uuid primary key default uuid_generate_v4(),
  doctor_id uuid references doctors(id) on delete cascade not null,
  date      date not null,
  reason    text,
  unique (doctor_id, date)
);

-- ── SERIAL NUMBER ON APPOINTMENTS ─────────────────────────────────────────────
alter table appointments add column if not exists serial_number int;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table doctor_schedule enable row level security;
alter table doctor_blocked_dates enable row level security;

-- Schedule: public can read (for booking page), doctor manages own
create policy "public_read_schedule" on doctor_schedule for select using (true);
create policy "doctor_manage_schedule" on doctor_schedule for all using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);

-- Blocked dates: public can read, doctor manages own
create policy "public_read_blocked" on doctor_blocked_dates for select using (true);
create policy "doctor_manage_blocked" on doctor_blocked_dates for all using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);

-- ── SEED DEFAULT SCHEDULE FOR EXISTING DOCTORS ───────────────────────────────
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Sun', true, '9:00 AM', '12:00 PM' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Mon', true, '9:00 AM', '5:00 PM' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Tue', true, '9:00 AM', '5:00 PM' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Wed', true, '9:00 AM', '5:00 PM' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Thu', true, '9:00 AM', '5:00 PM' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Fri', false, '—', '—' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
insert into doctor_schedule (doctor_id, day_of_week, is_open, start_time, end_time)
select id, 'Sat', true, '9:00 AM', '2:00 PM' from doctors
  on conflict (doctor_id, day_of_week) do nothing;
