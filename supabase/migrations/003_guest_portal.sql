-- Guest booking support on appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_guest      boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_manual     boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_name    text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_phone   text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_age     integer;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_gender  text;

-- Fee column (may already exist; ADD COLUMN IF NOT EXISTS is safe)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS fee           integer DEFAULT 0;

-- Patient portal access control
ALTER TABLE patients ADD COLUMN IF NOT EXISTS has_portal_access    boolean DEFAULT true;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by_doctor_id uuid REFERENCES doctors(id);

-- Prescription rich text fields
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS rx_notes     text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medications  jsonb;  -- [{name, dose, frequency, duration}]
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS bill_amount  integer DEFAULT 0;

-- Allow guest appointments (no patient_id required)
ALTER TABLE appointments ALTER COLUMN patient_id DROP NOT NULL;

-- RLS: allow unauthenticated inserts for guest appointments
-- (is_guest = true, patient_id is NULL)
DROP POLICY IF EXISTS "guest_insert_appointments" ON appointments;
CREATE POLICY "guest_insert_appointments" ON appointments
  FOR INSERT TO anon
  WITH CHECK (is_guest = true AND patient_id IS NULL);

-- Allow anyone to read doctor info for booking
DROP POLICY IF EXISTS "public_read_doctors" ON doctors;
CREATE POLICY "public_read_doctors" ON doctors
  FOR SELECT TO anon, authenticated
  USING (active = true);
