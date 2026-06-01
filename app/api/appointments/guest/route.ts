import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/appointments/guest — no auth required
// body: { doctor_id, date, time_slot, service, visit_type, problem_text, notes, guest_name, guest_phone, guest_age, guest_gender }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { doctor_id, date, time_slot, service, visit_type, problem_text, guest_name, guest_phone, guest_age, guest_gender, notes } = body;

  if (!doctor_id || !date || !time_slot || !service || !guest_name || !guest_phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Check slot not already taken
  const { data: existing } = await supabase
    .from("booked_slots")
    .select("id").eq("doctor_id", doctor_id).eq("date", date).eq("time_slot", time_slot).maybeSingle();
  if (existing) return NextResponse.json({ error: "Slot already booked. Choose another time." }, { status: 409 });

  // Check blocked date
  const { data: blocked } = await supabase
    .from("doctor_blocked_dates").select("id").eq("doctor_id", doctor_id).eq("date", date).maybeSingle();
  if (blocked) return NextResponse.json({ error: "This date is not available." }, { status: 409 });

  // Serial number for this doctor + date
  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor_id)
    .eq("date", date);

  const serial_number = (count ?? 0) + 1;

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      doctor_id,
      patient_id: null,
      date,
      time_slot,
      service,
      visit_type: visit_type ?? "in-person",
      problem_text: problem_text ?? "",
      notes: notes ?? "",
      serial_number,
      is_guest: true,
      guest_name,
      guest_phone: guest_phone.replace(/\D/g, ""),
      guest_age: guest_age ? parseInt(guest_age) : null,
      guest_gender: guest_gender ?? null,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("booked_slots").insert({ doctor_id, date, time_slot });

  return NextResponse.json({ appointment }, { status: 201 });
}
