import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// GET /api/schedule?doctor_id=xxx  — public, returns weekly schedule + blocked dates
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctor_id = searchParams.get("doctor_id");
  if (!doctor_id) return NextResponse.json({ error: "doctor_id required" }, { status: 400 });

  const supabase = await createClient();
  const [schedRes, blockedRes] = await Promise.all([
    supabase.from("doctor_schedule").select("*").eq("doctor_id", doctor_id).order("id"),
    supabase.from("doctor_blocked_dates").select("date, reason").eq("doctor_id", doctor_id),
  ]);

  return NextResponse.json({
    schedule: schedRes.data ?? [],
    blocked_dates: blockedRes.data ?? [],
  });
}

// POST /api/schedule — doctor saves their full weekly schedule
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
  if (!doctor) return NextResponse.json({ error: "Not a doctor" }, { status: 403 });

  const body = await req.json();
  const { schedule } = body as {
    schedule: { day_of_week: string; is_open: boolean; start_time: string; end_time: string; slot_minutes: number; max_patients: number }[]
  };

  if (!Array.isArray(schedule)) return NextResponse.json({ error: "schedule array required" }, { status: 400 });

  const rows = schedule
    .filter(s => DAYS.includes(s.day_of_week))
    .map(s => ({ ...s, doctor_id: doctor.id }));

  const { error } = await supabase
    .from("doctor_schedule")
    .upsert(rows, { onConflict: "doctor_id,day_of_week" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
