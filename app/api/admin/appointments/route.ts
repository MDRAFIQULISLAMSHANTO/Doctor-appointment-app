import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

/*
POST /api/admin/appointments
Doctor-authenticated. Creates appointment + optional new patient + optional prescription.

body: {
  // Patient — one of:
  patient_id?: string                   // existing patient
  patient_phone?: string                // look up or create
  patient_name?: string
  patient_age?: number
  patient_gender?: string
  portal_access?: boolean               // give portal login (default false for manual)
  portal_password?: string              // password if portal_access=true

  // Appointment
  date: string                          // YYYY-MM-DD
  time_slot: string                     // "10:00 AM"
  service: string
  visit_type: "in-person" | "online"
  problem_text?: string
  notes?: string
  fee?: number

  // Prescription (optional)
  prescription?: {
    diagnosis: string
    rx_notes?: string
    medications?: { name: string; dose: string; frequency: string; duration: string }[]
    bill_amount?: number
  }
}
*/
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doctor } = await supabase
    .from("doctors").select("id, name").eq("user_id", user.id).single();
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const body = await req.json();
  const {
    patient_id: provided_patient_id,
    patient_phone,
    patient_name,
    patient_age,
    patient_gender,
    portal_access = false,
    portal_password,
    date,
    time_slot,
    service,
    visit_type = "in-person",
    problem_text = "",
    notes = "",
    fee = 0,
    prescription,
  } = body;

  if (!date || !time_slot || !service) {
    return NextResponse.json({ error: "date, time_slot and service are required" }, { status: 400 });
  }

  const svc = createServiceClient();

  // ── Resolve patient ──────────────────────────────────────────────────────────
  let patient_id: string | null = provided_patient_id ?? null;
  let portal_credentials: { phone: string; password: string } | null = null;

  if (!patient_id && patient_phone) {
    const cleanPhone = patient_phone.replace(/\D/g, "");

    // Check if patient already exists by phone
    const { data: existing } = await svc
      .from("patients").select("id, has_portal_access").eq("phone", cleanPhone).maybeSingle();

    if (existing) {
      patient_id = existing.id;
    } else {
      // Create new patient record
      const validGender = ["male", "female", "other"].includes(patient_gender) ? patient_gender : null;
      const newPatient: Record<string, unknown> = {
        phone: cleanPhone,
        name: patient_name ?? "Unknown",
        age: patient_age ? parseInt(String(patient_age)) : null,
        gender: validGender,
        has_portal_access: portal_access,
        created_by_doctor_id: doctor.id,
      };

      if (portal_access && portal_password) {
        // Create Supabase auth user so patient can log in
        const email = `${cleanPhone}@patient.docapp.local`;
        const { data: authData, error: authErr } = await svc.auth.admin.createUser({
          email,
          password: portal_password,
          email_confirm: true,
        });
        if (!authErr && authData?.user) {
          newPatient.user_id = authData.user.id;
          portal_credentials = { phone: cleanPhone, password: portal_password };
        }
      }

      const { data: created, error: patErr } = await svc
        .from("patients").insert(newPatient).select("id").single();
      if (patErr) return NextResponse.json({ error: patErr.message }, { status: 500 });
      patient_id = created.id;
    }
  }

  // ── Check slot availability ──────────────────────────────────────────────────
  const { data: slotTaken } = await svc
    .from("booked_slots")
    .select("id").eq("doctor_id", doctor.id).eq("date", date).eq("time_slot", time_slot).maybeSingle();
  if (slotTaken) return NextResponse.json({ error: "Slot already booked." }, { status: 409 });

  // ── Serial number ────────────────────────────────────────────────────────────
  const { count } = await svc
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor.id)
    .eq("date", date);
  const serial_number = (count ?? 0) + 1;

  // ── Create appointment ───────────────────────────────────────────────────────
  const { data: appointment, error: aptErr } = await svc
    .from("appointments")
    .insert({
      doctor_id: doctor.id,
      patient_id,
      date,
      time_slot,
      service,
      visit_type,
      problem_text,
      notes,
      fee,
      serial_number,
      is_manual: true,
      status: "scheduled",
    })
    .select().single();
  if (aptErr) return NextResponse.json({ error: aptErr.message }, { status: 500 });

  await svc.from("booked_slots").insert({ doctor_id: doctor.id, date, time_slot });

  // Link patient to doctor (if real patient)
  if (patient_id) {
    await svc.from("doctor_patients")
      .upsert({ doctor_id: doctor.id, patient_id }, { onConflict: "doctor_id,patient_id" });
  }

  // ── Optional prescription ────────────────────────────────────────────────────
  let rx = null;
  if (prescription?.diagnosis) {
    // Map incoming medication shape -> stored medicine shape.
    const medicines = (prescription.medications ?? []).map((m: { name: string; dose?: string; frequency?: string; duration?: string }) => ({
      name: m.name, dosage: m.dose ?? "", frequency: m.frequency ?? "", duration: m.duration ?? "", instructions: "",
    }));
    const { data: rxData, error: rxErr } = await svc
      .from("prescriptions")
      .insert({
        appointment_id: appointment.id,
        doctor_id: doctor.id,
        patient_id,
        diagnosis: prescription.diagnosis,
        notes: prescription.rx_notes ?? "",
        medicines,
        fee: prescription.bill_amount ?? 0,
      })
      .select().single();
    if (rxErr) return NextResponse.json({ error: `Appointment created but prescription failed: ${rxErr.message}` }, { status: 500 });
    rx = rxData;
  }

  return NextResponse.json({ appointment, prescription: rx, portal_credentials }, { status: 201 });
}

// GET /api/admin/appointments — fetch doctor's appointments with patient info
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const svc = createServiceClient();
  const { data } = await svc
    .from("appointments")
    .select("*, patients(id, name, phone, age, gender)")
    .eq("doctor_id", doctor.id)
    .order("date", { ascending: false });

  return NextResponse.json({ appointments: data ?? [] });
}
