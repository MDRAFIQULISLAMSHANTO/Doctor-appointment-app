import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");

  let query = supabase
    .from("prescriptions")
    .select(`
      id, diagnosis, notes, file_url, created_at,
      appointments ( date, service ),
      doctors ( name, specialty )
    `)
    .order("created_at", { ascending: false });

  if (patientId) query = query.eq("patient_id", patientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { appointment_id, patient_id, doctor_id, diagnosis, notes, file_url, medicines, fee, next_appointment_date, next_appointment_time } = body;

  if (!appointment_id || !doctor_id || !diagnosis) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("prescriptions")
    .insert({
      appointment_id, patient_id: patient_id ?? null, doctor_id, diagnosis, notes, file_url,
      medicines: medicines ?? [],
      fee: fee ?? 0,
      next_appointment_date: next_appointment_date ?? null,
      next_appointment_time: next_appointment_time ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
