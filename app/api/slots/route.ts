import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseTime(t: string): number {
  const [time, period] = t.trim().split(" ");
  const [h, m] = time.split(":").map(Number);
  let hours = h;
  if (period === "PM" && h !== 12) hours += 12;
  if (period === "AM" && h === 12) hours = 0;
  return hours * 60 + (m ?? 0);
}

function minutesToLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

function generateSlots(startTime: string, endTime: string, slotMinutes = 30): string[] {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const slots: string[] = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    slots.push(minutesToLabel(t));
  }
  return slots;
}

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// GET /api/slots?doctor_id=xxx&date=2025-05-27
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctor_id = searchParams.get("doctor_id");
  const date = searchParams.get("date");

  if (!doctor_id || !date) {
    return NextResponse.json({ error: "doctor_id and date required" }, { status: 400 });
  }

  // Parse date parts directly to avoid UTC timezone shifting the day
  const [y, mo, d] = date.split("-").map(Number);
  const dayIndex = new Date(y, mo - 1, d).getDay();
  const dayName = DAY_NAMES[dayIndex];

  const supabase = await createClient();

  const [schedRes, blockedRes, bookedRes] = await Promise.all([
    supabase
      .from("doctor_schedule")
      .select("is_open, start_time, end_time, slot_minutes, max_patients")
      .eq("doctor_id", doctor_id)
      .eq("day_of_week", dayName)
      .single(),
    supabase
      .from("doctor_blocked_dates")
      .select("date")
      .eq("doctor_id", doctor_id)
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("booked_slots")
      .select("time_slot")
      .eq("doctor_id", doctor_id)
      .eq("date", date),
  ]);

  // Blocked date → always closed
  if (blockedRes.data) {
    return NextResponse.json({ slots: [], closed: true });
  }

  // No schedule row saved yet → use sensible defaults (Mon-Thu/Sat open, Fri closed)
  const DEFAULT_SCHEDULE: Record<string, { is_open: boolean; start_time: string; end_time: string; slot_minutes: number }> = {
    Sun: { is_open: true,  start_time: "9:00 AM",  end_time: "12:00 PM", slot_minutes: 30 },
    Mon: { is_open: true,  start_time: "9:00 AM",  end_time: "5:00 PM",  slot_minutes: 30 },
    Tue: { is_open: true,  start_time: "9:00 AM",  end_time: "5:00 PM",  slot_minutes: 30 },
    Wed: { is_open: true,  start_time: "9:00 AM",  end_time: "5:00 PM",  slot_minutes: 30 },
    Thu: { is_open: true,  start_time: "9:00 AM",  end_time: "5:00 PM",  slot_minutes: 30 },
    Fri: { is_open: false, start_time: "—",        end_time: "—",        slot_minutes: 30 },
    Sat: { is_open: true,  start_time: "9:00 AM",  end_time: "2:00 PM",  slot_minutes: 30 },
  };

  const schedule = schedRes.data ?? DEFAULT_SCHEDULE[dayName];

  if (!schedule.is_open) {
    return NextResponse.json({ slots: [], closed: true });
  }

  const { start_time, end_time, slot_minutes } = schedule;
  const allSlots = generateSlots(start_time, end_time, slot_minutes ?? 30);
  const bookedSet = new Set((bookedRes.data ?? []).map((r: { time_slot: string }) => r.time_slot));

  const slots = allSlots.map(slot => ({ slot, available: !bookedSet.has(slot) }));

  return NextResponse.json({ slots, schedule });
}
