import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/appointments — fetch patient's appointments
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: patient } = await supabase
    .from("patients").select("id").eq("user_id", user.id).single();
  if (!patient) return NextResponse.json({ appointments: [] });

  const { data } = await supabase
    .from("appointments")
    .select("*, doctors(name, specialty), prescriptions(id, diagnosis, file_url)")
    .eq("patient_id", patient.id)
    .order("date", { ascending: false });

  return NextResponse.json({ appointments: data ?? [] });
}

// POST /api/appointments — book appointment + assign serial number
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { doctor_id, date, time_slot, service, visit_type, problem_text, notes } = body;

  if (!doctor_id || !date || !time_slot || !service) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: patient } = await supabase
    .from("patients").select("id").eq("user_id", user.id).single();
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  // Check slot not already taken
  const { data: existing } = await supabase
    .from("booked_slots")
    .select("id").eq("doctor_id", doctor_id).eq("date", date).eq("time_slot", time_slot).maybeSingle();
  if (existing) return NextResponse.json({ error: "Slot already booked. Please choose another time." }, { status: 409 });

  // Check blocked date
  const { data: blocked } = await supabase
    .from("doctor_blocked_dates").select("id").eq("doctor_id", doctor_id).eq("date", date).maybeSingle();
  if (blocked) return NextResponse.json({ error: "This date is not available." }, { status: 409 });

  // Count existing appointments for this doctor on this date → serial number
  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor_id)
    .eq("date", date);

  const serial_number = (count ?? 0) + 1;

  // Create appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({ doctor_id, patient_id: patient.id, date, time_slot, service, visit_type, problem_text, notes, serial_number })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark slot as booked
  await supabase.from("booked_slots").insert({ doctor_id, date, time_slot });

  // Link patient to doctor
  await supabase.from("doctor_patients")
    .upsert({ doctor_id, patient_id: patient.id }, { onConflict: "doctor_id,patient_id" });

  return NextResponse.json({ appointment }, { status: 201 });
}
