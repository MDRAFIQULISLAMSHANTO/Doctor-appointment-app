"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type PatientUser = { id: string; name: string; phone: string };
type Doctor = { id: string; name: string; slug: string; specialty?: string; hospital?: string; services?: string[] };
type SlotInfo = { slot: string; available: boolean };

export default function BookPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const supabase = createClient();
  const today = new Date();

  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [closedDay, setClosedDay] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ service: "", type: "in-person", problem: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pat } = await supabase.from("patients").select("id, name, phone").eq("user_id", user.id).single();
        if (pat) setPatient(pat as PatientUser);
      }
      const { data: doc } = await supabase.from("doctors").select("id, name, slug, specialty, hospital, services").eq("slug", slug).single();
      if (doc) setDoctor(doc as Doctor);
      setAuthChecked(true);
    };
    init();
  }, [slug]);

  const loadSlots = useCallback(async (d: number) => {
    if (!doctor) return;
    setSlotsLoading(true);
    setSlots([]);
    setClosedDay(false);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const res = await fetch(`/api/slots?doctor_id=${doctor.id}&date=${dateStr}`);
    const data = await res.json();
    if (data.closed) setClosedDay(true);
    else setSlots((data.slots as SlotInfo[]) || []);
    setSlotsLoading(false);
  }, [doctor, month, year]);

  useEffect(() => { if (selectedDate) loadSlots(selectedDate); }, [selectedDate, loadSlots]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelectedDate(null); setSelectedSlot(null); setSlots([]); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelectedDate(null); setSelectedSlot(null); setSlots([]); };
  const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const services = doctor?.services ?? ["General Consultation"];

  const handleConfirm = async () => {
    if (!patient || !doctor || !form.service || !form.problem || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError("");
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(selectedDate).padStart(2,"0")}`;
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor_id: doctor.id, patient_id: patient.id, date: dateStr, time_slot: selectedSlot, service: form.service, visit_type: form.type, problem_text: form.problem, notes: form.notes }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to book"); setSubmitting(false); return; }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (!authChecked) return null;

  // ── NAV ──────────────────────────────────────────────────────────────────────
  const Nav = () => (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href={`/d/${slug}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#14967F] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="font-bold text-[#191919] text-sm">{doctor?.name ?? "..."}</span>
        </Link>
        <div className="flex items-center gap-3">
          {patient ? (
            <div className="flex items-center gap-2 bg-[#e8f5f2] rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold">{patient.name[0]}</div>
              <span className="text-xs font-medium text-[#191919]">{patient.name}</span>
            </div>
          ) : (
            <Link href={`/d/${slug}/patient/login`} className="text-sm text-[#6b7280] hover:text-[#191919]">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );

  // ── LOGIN GATE ────────────────────────────────────────────────────────────────
  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F4F4F5]">
        <Nav />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#191919] mb-2">Sign in to Book</h2>
            <p className="text-[#6b7280] text-sm mb-6">Book with {doctor?.name ?? "your doctor"} in seconds</p>
            <div className="space-y-3">
              <Link href={`/d/${slug}/patient/login?redirect=/d/${slug}/book`}
                className="flex items-center justify-center w-full bg-[#14967F] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#0d7a66] transition-colors">
                Sign In
              </Link>
              <Link href={`/d/${slug}/patient/register?redirect=/d/${slug}/book`}
                className="flex items-center justify-center w-full border-2 border-gray-100 text-[#191919] rounded-xl py-3 font-semibold text-sm hover:border-[#14967F] hover:text-[#14967F] transition-colors">
                New Patient? Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F4F5]">
        <Nav />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#191919] mb-2">Appointment Booked!</h2>
            <p className="text-[#6b7280] text-sm mb-5">For {patient.name} with {doctor?.name}</p>
            <div className="bg-[#F4F4F5] rounded-2xl p-4 mb-5 text-left space-y-2">
              {[
                ["Service", form.service],
                ["Date", `${selectedDate} ${MONTHS[month]} ${year}`],
                ["Time", selectedSlot!],
                ["Type", form.type === "in-person" ? "In-Person" : "Online"],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-[#A3A3A3]">{l}</span>
                  <span className="font-medium text-[#191919]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href={`/d/${slug}/patient/dashboard`} className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-semibold text-center">
                My Appointments
              </Link>
              <Link href={`/d/${slug}`} className="flex-1 border-2 border-gray-100 text-[#191919] rounded-xl py-3 text-sm font-medium text-center">
                Back to Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BOOKING FORM ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <Nav />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-xl font-bold text-[#191919]">Book Appointment</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{doctor?.specialty}{doctor?.hospital ? ` · ${doctor.hospital}` : ""}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-5 max-w-xs">
          {["Date & Time", "Details & Confirm"].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${step > i+1 ? "bg-[#14967F] text-white" : step === i+1 ? "bg-[#14967F] text-white" : "bg-gray-200 text-[#A3A3A3]"}`}>
                {step > i+1 ? "✓" : i+1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? "text-[#191919]" : "text-[#A3A3A3]"}`}>{label}</span>
              {i < 1 && <div className={`flex-1 h-0.5 mx-1 ${step > i+1 ? "bg-[#14967F]" : "bg-gray-200"}`}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#191919]">{MONTHS[month]} {year}</h2>
                <div className="flex gap-1.5">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#14967F] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#14967F] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => <div key={d} className="text-center text-[11px] font-semibold py-2 text-[#A3A3A3]">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`}/>)}
                {Array.from({length:daysInMonth},(_,i)=>i+1).map(d => {
                  const past = isPast(d), sel = selectedDate === d;
                  return (
                    <button key={d} disabled={past}
                      onClick={() => { setSelectedDate(d); setSelectedSlot(null); setSlots([]); setClosedDay(false); }}
                      className={`aspect-square rounded-xl text-xs font-semibold flex items-center justify-center transition-all
                        ${sel ? "bg-[#14967F] text-white shadow-md scale-105" : ""}
                        ${!sel && !past ? "bg-[#f0faf7] text-[#191919] hover:bg-[#d0ede8]" : ""}
                        ${past ? "text-gray-200 cursor-not-allowed" : ""}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {selectedDate ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-[#191919] text-sm mb-0.5">Available Slots</h3>
                  <p className="text-xs text-[#A3A3A3] mb-4">{selectedDate} {MONTHS[month]} {year}</p>
                  {slotsLoading ? (
                    <div className="py-8 text-center"><div className="w-6 h-6 border-2 border-[#14967F] border-t-transparent rounded-full animate-spin mx-auto"/></div>
                  ) : closedDay ? (
                    <div className="py-6 text-center"><p className="text-2xl mb-2">🚫</p><p className="text-sm text-[#A3A3A3]">Not available this day</p></div>
                  ) : slots.length === 0 ? (
                    <div className="py-6 text-center"><p className="text-2xl mb-2">📅</p><p className="text-sm text-[#A3A3A3]">No slots available</p></div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map(({slot, available}) => {
                        const sel = selectedSlot === slot;
                        return (
                          <button key={slot} disabled={!available} onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all
                              ${sel ? "bg-[#14967F] text-white shadow-md" : ""}
                              ${!available ? "bg-red-50 text-red-300 cursor-not-allowed line-through" : ""}
                              ${!sel && available ? "bg-[#f0faf7] text-[#191919] hover:bg-[#d0ede8]" : ""}`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm text-[#A3A3A3]">Pick a date to see slots</p>
                </div>
              )}

              {selectedDate && selectedSlot && (
                <div className="bg-[#14967F] rounded-2xl p-5 text-white">
                  <p className="text-white/60 text-xs font-medium mb-1">SELECTED</p>
                  <p className="font-bold">{selectedDate} {MONTHS[month]} {year}</p>
                  <p className="text-white/80 text-sm mb-4">{selectedSlot}</p>
                  <button onClick={() => setStep(2)} className="w-full bg-[#FAD069] text-[#191919] rounded-xl py-3 font-bold text-sm">
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-7 shadow-sm">
            <h2 className="font-bold text-[#191919] mb-1">Service & Details</h2>
            <p className="text-xs text-[#A3A3A3] mb-5">{selectedDate} {MONTHS[month]} {year} · {selectedSlot}</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Service <span className="text-red-400">*</span></label>
                <select value={form.service} onChange={e => setForm({...form, service: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm bg-white">
                  <option value="">Select...</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-2">Visit Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{value:"in-person",label:"🏥 In-Person"},{value:"online",label:"💻 Online"}].map(t => (
                    <button key={t.value} type="button" onClick={() => setForm({...form, type: t.value})}
                      className={`p-3.5 rounded-xl border-2 text-left transition-colors ${form.type === t.value ? "border-[#14967F] bg-[#e8f5f2]" : "border-gray-100"}`}>
                      <p className="font-semibold text-[#191919] text-sm">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Problem Description <span className="text-red-400">*</span></label>
                <textarea rows={4} placeholder="Describe your symptoms, duration, severity..."
                  value={form.problem} onChange={e => setForm({...form, problem: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Additional Notes <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
                <textarea rows={2} placeholder="Allergies, current medications..."
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
              </div>

              <div className="bg-[#F4F4F5] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#14967F] uppercase tracking-wider mb-3">Summary</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                  {[
                    ["Doctor", doctor?.name ?? ""],
                    ["Service", form.service || "—"],
                    ["Date", `${selectedDate} ${MONTHS[month]} ${year}`],
                    ["Time", selectedSlot!],
                    ["Type", form.type === "in-person" ? "In-Person" : "Online"],
                    ["Patient", patient.name],
                  ].map(([l,v]) => (
                    <span key={l} className="contents">
                      <span className="text-[#A3A3A3]">{l}</span>
                      <span className="font-semibold text-[#191919]">{v}</span>
                    </span>
                  ))}
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-100 text-[#A3A3A3] rounded-xl py-3 text-sm font-medium">← Back</button>
              <button onClick={handleConfirm} disabled={!form.service || !form.problem || submitting}
                className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#0d7a66] disabled:opacity-40 transition-colors">
                {submitting ? "Booking..." : "Confirm ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
