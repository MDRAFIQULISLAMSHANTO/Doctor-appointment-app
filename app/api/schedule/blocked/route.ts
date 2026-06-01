import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/schedule/blocked — block a specific date
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
  if (!doctor) return NextResponse.json({ error: "Not a doctor" }, { status: 403 });

  const { date, reason } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const { error } = await supabase
    .from("doctor_blocked_dates")
    .upsert({ doctor_id: doctor.id, date, reason }, { onConflict: "doctor_id,date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/schedule/blocked?date=2025-05-27 — unblock a date
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
  if (!doctor) return NextResponse.json({ error: "Not a doctor" }, { status: 403 });

  const date = new URL(req.url).searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  await supabase.from("doctor_blocked_dates").delete().eq("doctor_id", doctor.id).eq("date", date);
  return NextResponse.json({ success: true });
}
