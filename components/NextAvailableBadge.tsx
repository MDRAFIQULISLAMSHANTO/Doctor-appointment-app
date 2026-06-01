"use client";
import Link from "next/link";

const BOOKED_DATES = [3, 7, 11, 14, 18, 21, 25, 28];
const ALL_SLOTS = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
const BOOKED_SLOTS: Record<number, string[]> = {
  4: ["9:00 AM","10:00 AM"],
  8: ["2:00 PM","3:00 PM"],
  12: ["9:00 AM","11:00 AM","2:00 PM"],
  15: ["10:00 AM"],
  19: ["4:00 PM","5:00 PM"],
  22: ["9:00 AM","10:00 AM","11:00 AM"],
};
const SLOT_HOUR: Record<string, number> = {
  "9:00 AM": 9, "10:00 AM": 10, "11:00 AM": 11, "12:00 PM": 12,
  "2:00 PM": 14, "3:00 PM": 15, "4:00 PM": 16, "5:00 PM": 17,
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getNextSlots(count = 3) {
  const now = new Date();
  const results: { label: string; date: number; month: number; slot: string }[] = [];

  for (let offset = 0; offset <= 14 && results.length < count; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const day = d.getDate();
    const month = d.getMonth();
    const isFriday = d.getDay() === 5;
    if (isFriday || BOOKED_DATES.includes(day)) continue;

    for (const slot of ALL_SLOTS) {
      if ((BOOKED_SLOTS[day] || []).includes(slot)) continue;
      if (offset === 0 && SLOT_HOUR[slot] <= now.getHours()) continue;
      const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : `${day} ${MONTHS[month]}`;
      results.push({ label, date: day, month, slot });
      if (results.length >= count) break;
    }
  }
  return results;
}

// ── Compact badge (for Hero page) ────────────────────────────────────────────
export function NextAvailableBadge() {
  const slots = getNextSlots(1);
  if (!slots.length) return null;
  const { label, slot } = slots[0];

  return (
    <Link href="/appointment"
      className="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2 hover:bg-white/90 transition-colors group">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-sm text-[#6b7280]">Next slot:</span>
      <span className="text-sm font-semibold text-[#191919]">{label} · {slot}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </Link>
  );
}

// ── Quick slot row (for Patient Dashboard) ────────────────────────────────────
export function NextAvailableSlots() {
  const slots = getNextSlots(3);
  if (!slots.length) return null;

  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <h3 className="text-sm font-bold text-[#191919]">Next Available Slots</h3>
        </div>
        <Link href="/appointment" className="text-xs text-[#14967F] hover:underline font-medium">See all →</Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(({ label, slot }, i) => (
          <Link key={i} href="/appointment"
            className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-100 hover:border-[#14967F] hover:bg-[#e8f5f2] transition-colors group">
            <span className="text-[10px] font-semibold text-[#14967F] uppercase tracking-wider">{label}</span>
            <span className="text-sm font-bold text-[#191919] mt-0.5">{slot}</span>
            <span className="text-[10px] text-[#A3A3A3] mt-1 group-hover:text-[#14967F]">Book →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
