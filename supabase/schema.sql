-- ============================================================
-- Doctor SaaS Platform — Supabase Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── DOCTORS (one per tenant) ─────────────────────────────────────────────────
create table doctors (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade unique,
  slug        text unique not null,          -- e.g. "dr-jahangir"
  name        text not null,
  specialty   text not null,
  email       text unique not null,
  phone       text,
  hospital    text,
  address     text,
  city        text default 'Chittagong',
  bio         text,
  photo_url   text,
  hours       jsonb default '{"Sat":"9:00 AM - 5:00 PM","Sun":"9:00 AM - 12:00 PM","Mon":"9:00 AM - 5:00 PM","Tue":"9:00 AM - 5:00 PM","Wed":"9:00 AM - 5:00 PM","Thu":"9:00 AM - 5:00 PM","Fri":"Closed"}',
  services    text[] default array['General Consultation'],
  stats       jsonb default '{"patients":"0","experience":"0","rating":"5.0","reviews":"0"}',
  plan        text default 'free' check (plan in ('free','starter','pro')),
  features    jsonb default '{"appointments":30,"prescriptions":false,"shop":false,"blog":false,"custom_domain":false,"max_patients":50}',
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ── PATIENTS ─────────────────────────────────────────────────────────────────
create table patients (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade unique,
  phone       text unique not null,
  name        text not null,
  age         int,
  gender      text check (gender in ('male','female','other')),
  created_at  timestamptz default now()
);

-- ── DOCTOR ↔ PATIENT (which patients belong to which doctor) ─────────────────
create table doctor_patients (
  doctor_id   uuid references doctors(id) on delete cascade,
  patient_id  uuid references patients(id) on delete cascade,
  first_visit timestamptz default now(),
  primary key (doctor_id, patient_id)
);

-- ── APPOINTMENTS ─────────────────────────────────────────────────────────────
create table appointments (
  id            uuid primary key default uuid_generate_v4(),
  doctor_id     uuid references doctors(id) on delete cascade not null,
  patient_id    uuid references patients(id) on delete cascade not null,
  date          date not null,
  time_slot     text not null,
  service       text not null,
  visit_type    text default 'in-person' check (visit_type in ('in-person','online')),
  status        text default 'scheduled' check (status in ('scheduled','checked-in','checked-out','cancelled')),
  problem_text  text,
  notes         text,
  report_urls   text[],
  fee           int default 500,
  created_at    timestamptz default now()
);

-- ── PRESCRIPTIONS ────────────────────────────────────────────────────────────
create table prescriptions (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid references appointments(id) on delete cascade not null,
  doctor_id       uuid references doctors(id) on delete cascade not null,
  patient_id      uuid references patients(id) on delete cascade not null,
  diagnosis       text not null,
  file_url        text,
  notes           text,
  created_at      timestamptz default now()
);

-- ── BOOKED SLOTS (real availability per doctor) ───────────────────────────────
create table booked_slots (
  id          uuid primary key default uuid_generate_v4(),
  doctor_id   uuid references doctors(id) on delete cascade not null,
  date        date not null,
  time_slot   text not null,
  unique (doctor_id, date, time_slot)
);

-- ── BLOG POSTS ───────────────────────────────────────────────────────────────
create table blog_posts (
  id          uuid primary key default uuid_generate_v4(),
  doctor_id   uuid references doctors(id) on delete cascade not null,
  title       text not null,
  excerpt     text,
  content     text,
  category    text,
  emoji       text default '📄',
  published   boolean default false,
  created_at  timestamptz default now()
);

-- ── SHOP PRODUCTS ────────────────────────────────────────────────────────────
create table products (
  id          uuid primary key default uuid_generate_v4(),
  doctor_id   uuid references doctors(id) on delete cascade not null,
  name        text not null,
  description text,
  price       int not null,
  category    text,
  emoji       text default '📦',
  stock       int default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ── OTP STORE (phone login) ───────────────────────────────────────────────────
create table otp_codes (
  id          uuid primary key default uuid_generate_v4(),
  phone       text not null,
  code        text not null,
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table doctors        enable row level security;
alter table patients       enable row level security;
alter table doctor_patients enable row level security;
alter table appointments   enable row level security;
alter table prescriptions  enable row level security;
alter table booked_slots   enable row level security;
alter table blog_posts     enable row level security;
alter table products       enable row level security;
alter table otp_codes      enable row level security;

-- Doctors: read own row, update own row
create policy "doctor_read_own"   on doctors for select using (auth.uid() = user_id);
create policy "doctor_update_own" on doctors for update using (auth.uid() = user_id);
-- Public can read active doctors (for /d/[slug] pages)
create policy "public_read_doctors" on doctors for select using (active = true);

-- Patients: read/update own row
create policy "patient_read_own"   on patients for select using (auth.uid() = user_id);
create policy "patient_update_own" on patients for update using (auth.uid() = user_id);
create policy "patient_insert_own" on patients for insert with check (auth.uid() = user_id);

-- Appointments: patient sees own, doctor sees their doctor_id
create policy "patient_read_appointments" on appointments for select using (
  patient_id in (select id from patients where user_id = auth.uid())
);
create policy "doctor_read_appointments" on appointments for select using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);
create policy "patient_insert_appointment" on appointments for insert with check (
  patient_id in (select id from patients where user_id = auth.uid())
);
create policy "doctor_update_appointment" on appointments for update using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);

-- Prescriptions: patient sees own, doctor sees theirs
create policy "patient_read_rx" on prescriptions for select using (
  patient_id in (select id from patients where user_id = auth.uid())
);
create policy "doctor_manage_rx" on prescriptions for all using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);

-- Booked slots: public readable (for calendar), doctor manages own
create policy "public_read_slots" on booked_slots for select using (true);
create policy "doctor_manage_slots" on booked_slots for all using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);

-- Blog + products: public read published, doctor manages own
create policy "public_read_posts" on blog_posts for select using (published = true);
create policy "doctor_manage_posts" on blog_posts for all using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);
create policy "public_read_products" on products for select using (active = true);
create policy "doctor_manage_products" on products for all using (
  doctor_id in (select id from doctors where user_id = auth.uid())
);

-- OTP: service role only (API routes)
create policy "service_manage_otp" on otp_codes for all using (true);
