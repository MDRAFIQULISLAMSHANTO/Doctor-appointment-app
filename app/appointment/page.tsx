"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type PatientUser = { id: string; name: string; phone: string; user_id: string };
type Doctor = { id: string; name: string; slug: string; services?: string[] };
type SlotInfo = { slot: string; available: boolean };

export default function AppointmentPageWrapper() {
  return (
    <Suspense fallback={null}>
      <AppointmentPage />
    </Suspense>
  );
}

function AppointmentPage() {
  const today = new Date();
  const supabase = createClient();
  const searchParams = useSearchParams();

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
        const { data: pat } = await supabase.from("patients").select("id, name, phone, user_id").eq("user_id", user.id).single();
        if (pat) setPatient(pat);
      }
      const slug = searchParams.get("doctor") || "dr-jahangir";
      const { data: doc } = await supabase.from("doctors").select("id, name, slug, services").eq("slug", slug).single();
      if (doc) setDoctor(doc as Doctor);
      setAuthChecked(true);
    };
    init();
  }, []);

  const loadSlots = useCallback(async (d: number) => {
    if (!doctor) return;
    setSlotsLoading(true);
    setSlots([]);
    setClosedDay(false);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const res = await fetch(`/api/slots?doctor_id=${doctor.id}&date=${dateStr}`);
    const data = await res.json();
    if (data.closed) {
      setClosedDay(true);
    } else {
      setSlots((data.slots as SlotInfo[]) || []);
    }
    setSlotsLoading(false);
  }, [doctor, month, year]);

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDate(null); setSelectedSlot(null); setSlots([]); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDate(null); setSelectedSlot(null); setSlots([]); };
  const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const services: string[] = doctor?.services ?? ["General Consultation"];

  const handleConfirm = async () => {
    if (!patient || !doctor || !form.service || !form.problem || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError("");

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_id: patient.id,
        date: dateStr,
        time_slot: selectedSlot,
        service: form.service,
        visit_type: form.type,
        problem_text: form.problem,
        notes: form.notes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to book appointment");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (!authChecked) return null;

  // ── LOGIN GATE ───────────────────────────────────────────────────────────────
  if (!patient) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-[#F4F4F5]">
          <div className="max-w-lg mx-auto px-4 py-20">
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-[#e8f5f2] flex items-center justify-center mx-auto mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#191919] mb-2">Sign in to Book</h2>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
                Create a patient account or sign in to book your appointment and track your visits.
              </p>
              <div className="space-y-3 mb-6">
                <Link href="/patient/login?redirect=/appointment"
                  className="flex items-center justify-center gap-2 w-full bg-[#14967F] text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#0d7a66] transition-colors">
                  Sign In
                </Link>
                <Link href="/patient/register?redirect=/appointment"
                  className="flex items-center justify-center gap-2 w-full border-2 border-gray-100 text-[#191919] rounded-xl py-3.5 font-semibold text-sm hover:border-[#14967F] hover:text-[#14967F] transition-colors">
                  Create Account
                </Link>
              </div>
              <div className="bg-[#F4F4F5] rounded-2xl p-4 text-left space-y-2.5">
                <p className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">Why register?</p>
                {["Track all your appointments","Download prescriptions","Submit symptoms with reports","Easy visit history access"].map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#14967F] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-xs text-[#6b7280]">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] pt-16 px-4">
          <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-[#191919] mb-2">Appointment Confirmed!</h2>
            <p className="text-[#6b7280] text-sm mb-6">Booked for {patient.name}</p>
            <div className="bg-[#F4F4F5] rounded-2xl p-4 mb-6 text-left space-y-2">
              {[
                ["Service", form.service],
                ["Date", `${selectedDate} ${MONTHS[month]} ${year}`],
                ["Time", selectedSlot!],
                ["Type", form.type === "in-person" ? "In-Person Visit" : "Online Consultation"],
                ["Patient", patient.name],
                ["Mobile", patient.phone],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[#A3A3A3]">{label}</span>
                  <span className="font-medium text-[#191919]">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#14967F] bg-[#e8f5f2] rounded-xl px-4 py-3 mb-6">Confirmation call within 2 hours on your registered number.</p>
            <div className="flex gap-3">
              <Link href="/patient/dashboard" className="flex-1 border-2 border-gray-100 text-[#191919] rounded-xl py-3 text-sm font-medium hover:border-[#14967F] text-center">
                View Dashboard
              </Link>
              <button onClick={() => { setSubmitted(false); setStep(1); setSelectedDate(null); setSelectedSlot(null); setForm({service:"",type:"in-person",problem:"",notes:""}); }}
                className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#0d7a66]">
                Book Another
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── BOOKING FORM ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F4F5]">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center border border-gray-200 rounded-full px-3 py-1 text-xs text-[#A3A3A3] mb-2">Appointment</span>
                <h1 className="text-2xl font-bold text-[#191919]">Schedule Your Visit</h1>
              </div>
              <div className="flex items-center gap-2.5 bg-[#e8f5f2] rounded-xl px-4 py-2.5">
                <div className="w-7 h-7 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold">{patient.name.charAt(0)}</div>
                <div>
                  <p className="text-xs font-semibold text-[#191919]">{patient.name}</p>
                  <p className="text-[10px] text-[#A3A3A3]">{patient.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* 2-step progress */}
          <div className="flex items-center gap-2 mb-6 max-w-xs">
            {["Select Date & Time", "Details & Confirm"].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i+1 ? "bg-[#14967F] text-white" : step === i+1 ? "bg-[#14967F] text-white" : "bg-gray-200 text-[#A3A3A3]"}`}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? "text-[#191919]" : "text-[#A3A3A3]"}`}>{label}</span>
                {i < 1 && <div className={`flex-1 h-0.5 mx-1 ${step > i+1 ? "bg-[#14967F]" : "bg-gray-200"}`}></div>}
              </div>
            ))}
          </div>

          {/* STEP 1 — Calendar */}
          {step === 1 && (
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-[#191919]">{MONTHS[month]} {year}</h2>
                  <div className="flex gap-1.5">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#14967F] hover:text-[#14967F] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#14967F] hover:text-[#14967F] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map(d => (
                    <div key={d} className={`text-center text-[11px] font-semibold py-2 ${d==="Fri"?"text-red-400":"text-[#A3A3A3]"}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                  {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
                    const past=isPast(d), sel=selectedDate===d;
                    return (
                      <button key={d} disabled={past} onClick={()=>{setSelectedDate(d);setSelectedSlot(null);setSlots([]);setClosedDay(false);}}
                        title={past?"Past date":"Select date"}
                        className={`aspect-square rounded-xl text-xs font-semibold flex items-center justify-center transition-all
                          ${sel?"bg-[#14967F] text-white shadow-md scale-105":""}
                          ${!sel&&!past?"bg-[#f0faf7] text-[#191919] hover:bg-[#d0ede8] hover:text-[#14967F]":""}
                          ${past?"text-gray-200 cursor-not-allowed":""}`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100">
                  {[
                    {color:"bg-[#f0faf7] border border-[#14967F]/20",label:"Available"},
                    {color:"bg-[#14967F]",label:"Selected"},
                    {color:"bg-red-50",label:"Slot Booked"},
                    {color:"bg-gray-100",label:"Past Date"},
                  ].map((l,i)=>(
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded ${l.color}`}/>
                      <span className="text-[10px] text-[#A3A3A3]">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slots + CTA */}
              <div className="space-y-4">
                {selectedDate ? (
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#191919] text-sm mb-0.5">Time Slots</h3>
                    <p className="text-xs text-[#A3A3A3] mb-4">{selectedDate} {MONTHS[month]} {year}</p>
                    {slotsLoading ? (
                      <div className="py-8 text-center">
                        <div className="w-6 h-6 border-2 border-[#14967F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : closedDay ? (
                      <div className="py-6 text-center">
                        <p className="text-2xl mb-2">🚫</p>
                        <p className="text-sm text-[#A3A3A3]">Doctor is not available on this day</p>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-2xl mb-2">📅</p>
                        <p className="text-sm text-[#A3A3A3]">No available slots for this date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map(({slot, available})=>{
                          const sel=selectedSlot===slot;
                          return (
                            <button key={slot} disabled={!available} onClick={()=>setSelectedSlot(slot)}
                              className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all
                                ${sel?"bg-[#14967F] text-white shadow-md":""}
                                ${!available?"bg-red-50 text-red-300 cursor-not-allowed line-through":""}
                                ${!sel&&available?"bg-[#f0faf7] text-[#191919] hover:bg-[#d0ede8]":""}`}>
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
                    <p className="text-sm text-[#A3A3A3]">Select a date to see available time slots</p>
                  </div>
                )}

                {selectedDate && selectedSlot && (
                  <div className="bg-[#14967F] rounded-2xl p-5 text-white">
                    <p className="text-white/60 text-xs font-medium mb-2">YOUR SELECTION</p>
                    <p className="font-bold text-lg">{selectedDate} {MONTHS[month]} {year}</p>
                    <p className="text-white/80 text-sm mb-4">{selectedSlot}</p>
                    <button onClick={()=>setStep(2)} className="w-full bg-[#FAD069] text-[#191919] rounded-xl py-3 font-bold text-sm hover:bg-[#e8bb45] transition-colors">
                      Continue →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Details & Confirm */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-7 shadow-sm">
              <h2 className="font-bold text-[#191919] mb-1">Service & Details</h2>
              <p className="text-xs text-[#A3A3A3] mb-5">{selectedDate} {MONTHS[month]} {year} · {selectedSlot}</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Service Required <span className="text-red-400">*</span></label>
                  <select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm bg-white">
                    <option value="">Select a service...</option>
                    {services.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-2">Visit Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{value:"in-person",label:"🏥 In-Person",desc:"Chittagong clinic visit"},{value:"online",label:"💻 Online",desc:"Submit & get prescription"}].map(t=>(
                      <button key={t.value} type="button" onClick={()=>setForm({...form,type:t.value})}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${form.type===t.value?"border-[#14967F] bg-[#e8f5f2]":"border-gray-100 hover:border-gray-200"}`}>
                        <p className="font-semibold text-[#191919] text-sm">{t.label}</p>
                        <p className="text-xs text-[#A3A3A3] mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Describe Your Problem <span className="text-red-400">*</span></label>
                  <textarea placeholder="Describe symptoms — location, duration, severity, and any previous treatments..." rows={4}
                    value={form.problem} onChange={e=>setForm({...form,problem:e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Attach Reports <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
                  <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#14967F] hover:bg-[#e8f5f2] transition-colors">
                    <div className="text-xl mb-1">📎</div>
                    <p className="text-sm text-[#A3A3A3]">Upload test reports, X-rays, MRI scans</p>
                    <p className="text-xs text-[#A3A3A3] mt-0.5">PDF, JPG, PNG — max 10MB each</p>
                    <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png"/>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Additional Notes <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
                  <textarea placeholder="Allergies, current medications, or any other relevant information..." rows={2}
                    value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
                </div>

                <div className="bg-[#F4F4F5] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#14967F] uppercase tracking-wider mb-3">Confirm Booking</p>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                    {[
                      ["Service", form.service || "—"],
                      ["Date", `${selectedDate} ${MONTHS[month]} ${year}`],
                      ["Time", selectedSlot!],
                      ["Type", form.type === "in-person" ? "In-Person" : "Online"],
                      ["Patient", patient.name],
                      ["Mobile", patient.phone],
                    ].map(([l,v])=>(
                      <span key={l} className="contents">
                        <span className="text-[#A3A3A3]">{l}</span>
                        <span className="font-semibold text-[#191919]">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={()=>setStep(1)} className="flex-1 border-2 border-gray-100 text-[#A3A3A3] rounded-xl py-3 text-sm font-medium hover:border-gray-200">← Back</button>
                <button
                  onClick={handleConfirm}
                  disabled={!form.service || !form.problem || submitting}
                  className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#0d7a66] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {submitting ? "Booking..." : "Confirm Appointment ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
