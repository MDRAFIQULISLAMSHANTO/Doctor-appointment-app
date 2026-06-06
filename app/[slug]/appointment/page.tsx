"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type PatientUser = { id: string; name: string; phone: string };
type Doctor = { id: string; name: string; slug: string; specialty?: string; hospital?: string; services?: string[] };
type SlotInfo = { slot: string; available: boolean };
type BookingMode = "portal" | "guest";

function AppointmentContent() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const initType = searchParams.get("type") ?? "in-person";
  const supabase = createClient();
  const today = new Date();

  // Parse date/time pre-selected from landing page
  const dateParam = searchParams.get("date"); // YYYY-MM-DD
  const timeParam = searchParams.get("time"); // HH:MM (24h)

  function parseSlotParam(t: string): string {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
  }

  const initDate = dateParam ? new Date(dateParam + "T00:00:00") : null;

  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Booking mode
  const [bookingMode, setBookingMode] = useState<BookingMode | null>(null);
  const [showAuthChoice, setShowAuthChoice] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "", age: "", gender: "" });

  // Calendar — pre-seed from URL if available
  const [month, setMonth] = useState(initDate ? initDate.getMonth() : today.getMonth());
  const [year, setYear] = useState(initDate ? initDate.getFullYear() : today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(initDate ? initDate.getDate() : null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(timeParam ? parseSlotParam(timeParam) : null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [closedDay, setClosedDay] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Steps
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ service: "", type: initType, problem: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let hasPatient = false;
      if (user) {
        const { data: pat } = await supabase.from("patients").select("id, name, phone").eq("user_id", user.id).single();
        if (pat) { setPatient(pat as PatientUser); setBookingMode("portal"); hasPatient = true; }
      }
      const { data: doc } = await supabase.from("doctors").select("id, name, slug, specialty, hospital, services").eq("slug", slug).single();
      if (doc) {
        setDoctor(doc as Doctor);
        setForm(f => ({ ...f, service: (doc as Doctor).specialty ?? (doc as Doctor).services?.[0] ?? "Consultation" }));
      }
      setAuthChecked(true);
      // If landing pre-selected date+time, skip calendar step
      if (dateParam && timeParam) {
        if (hasPatient) { setStep(2); }
        else { setShowAuthChoice(true); }
      }
    };
    init();
  }, [slug]);

  const loadSlots = useCallback(async (d: number) => {
    if (!doctor) return;
    setSlotsLoading(true); setSlots([]); setClosedDay(false);
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const res = await fetch(`/api/slots?doctor_id=${doctor.id}&date=${dateStr}`);
    const data = await res.json();
    if (data.closed) setClosedDay(true);
    else setSlots((data.slots as SlotInfo[]) || []);
    setSlotsLoading(false);
  }, [doctor, month, year]);

  useEffect(() => { if (selectedDate) loadSlots(selectedDate); }, [selectedDate, loadSlots]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const prevMonth = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); setSelectedDate(null);setSelectedSlot(null);setSlots([]); };
  const nextMonth = () => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); setSelectedDate(null);setSelectedSlot(null);setSlots([]); };
  const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const handleContinueFromStep1 = () => {
    if (!selectedDate || !selectedSlot) return;
    if (patient) { setStep(2); return; }
    setShowAuthChoice(true);
  };

  const handleGuestContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestInfo.name || guestInfo.phone.replace(/\D/g,"").length < 10) {
      setError("Name and valid phone number required"); return;
    }
    setError("");
    setBookingMode("guest");
    setShowAuthChoice(false);
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!doctor || !selectedDate || !selectedSlot) return;
    setSubmitting(true); setError("");
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(selectedDate).padStart(2,"0")}`;

    let res: Response;
    if (bookingMode === "guest") {
      res = await fetch("/api/appointments/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id, date: dateStr, time_slot: selectedSlot,
          service: form.service, visit_type: form.type,
          problem_text: form.problem, notes: form.notes,
          guest_name: guestInfo.name,
          guest_phone: guestInfo.phone.replace(/\D/g,""),
          guest_age: guestInfo.age || null,
          guest_gender: guestInfo.gender || null,
        }),
      });
    } else {
      res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id, patient_id: patient!.id, date: dateStr,
          time_slot: selectedSlot, service: form.service,
          visit_type: form.type, problem_text: form.problem, notes: form.notes,
        }),
      });
    }
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to book"); setSubmitting(false); return; }
    setSubmitted(true); setSubmitting(false);
  };

  if (!authChecked) return null;

  const Nav = () => (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href={`/${slug}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#14967F] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="font-bold text-[#191919] text-sm">{doctor?.name ?? "..."}</span>
        </Link>
        <div className="flex items-center gap-2">
          {patient ? (
            <div className="flex items-center gap-2 bg-[#e8f5f2] rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold">{patient.name[0]}</div>
              <span className="text-xs font-medium text-[#191919]">{patient.name}</span>
            </div>
          ) : (
            <>
              <Link href={`/${slug}/login?redirect=/${slug}/appointment`} className="text-sm text-[#6b7280] hover:text-[#191919] hidden sm:block">Sign In</Link>
              <Link href={`/${slug}/register?redirect=/${slug}/appointment`} className="text-sm bg-[#191919] text-white rounded-xl px-3 py-1.5 hover:bg-[#2a2a2a]">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  // SUCCESS
  if (submitted) {
    const isGuest = bookingMode === "guest";
    return (
      <div className="min-h-screen bg-[#F4F4F5]"><Nav />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#191919] mb-1">Appointment Booked!</h2>
            <p className="text-[#6b7280] text-sm mb-5">
              For {isGuest ? guestInfo.name : patient?.name} with {doctor?.name}
            </p>
            <div className="bg-[#F4F4F5] rounded-2xl p-4 mb-5 text-left space-y-2">
              {[
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
            {isGuest ? (
              <div className="bg-[#e8f5f2] rounded-xl px-4 py-3 mb-5 text-left">
                <p className="text-xs font-semibold text-[#14967F] mb-1">Want to track this appointment?</p>
                <p className="text-xs text-[#6b7280] mb-2">Register a free account to view your appointment history and prescriptions.</p>
                <Link href={`/${slug}/register`} className="text-xs font-bold text-[#14967F] hover:underline">Register for free →</Link>
              </div>
            ) : (
              <p className="text-xs text-[#14967F] bg-[#e8f5f2] rounded-xl px-4 py-3 mb-5">
                Confirmation call within 2 hours on your registered number.
              </p>
            )}
            <div className="flex gap-3">
              {!isGuest && (
                <Link href={`/${slug}/patient/dashboard`} className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-semibold text-center">
                  My Appointments
                </Link>
              )}
              <Link href={`/${slug}`} className={`${isGuest ? "w-full" : "flex-1"} border-2 border-gray-100 text-[#191919] rounded-xl py-3 text-sm font-medium text-center`}>
                Back to Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTH CHOICE (step 1 done, no patient logged in)
  if (showAuthChoice) {
    return (
      <div className="min-h-screen bg-[#F4F4F5]"><Nav />
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-[#e8f5f2] rounded-2xl px-5 py-3 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#14967F] flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-sm font-medium text-[#14967F]">
              {selectedDate} {MONTHS[month]} {year} · {selectedSlot} selected
            </p>
          </div>

          <h2 className="text-xl font-bold text-[#191919] mb-1">How would you like to book?</h2>
          <p className="text-sm text-[#6b7280] mb-6">Choose guest booking or sign in for full access</p>

          {/* Guest booking */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-xl">👤</div>
              <div>
                <h3 className="font-bold text-[#191919] text-sm">Book as Guest</h3>
                <p className="text-xs text-[#A3A3A3]">Quick booking — no account needed</p>
              </div>
            </div>
            <form onSubmit={handleGuestContinue} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7280] mb-1">Full Name *</label>
                  <input type="text" required value={guestInfo.name}
                    onChange={e => setGuestInfo(g => ({...g, name: e.target.value}))}
                    placeholder="Your name"
                    className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7280] mb-1">Phone *</label>
                  <input type="tel" required value={guestInfo.phone}
                    onChange={e => setGuestInfo(g => ({...g, phone: e.target.value}))}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7280] mb-1">Age</label>
                  <input type="number" value={guestInfo.age} min="1" max="120"
                    onChange={e => setGuestInfo(g => ({...g, age: e.target.value}))}
                    placeholder="25"
                    className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7280] mb-1">Gender</label>
                  <select value={guestInfo.gender} onChange={e => setGuestInfo(g => ({...g, gender: e.target.value}))}
                    className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]">
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit"
                className="w-full bg-[#14967F] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#0d7a66]">
                Continue as Guest →
              </button>
            </form>
          </div>

          {/* Or divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs text-[#A3A3A3] font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          {/* Registered options */}
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/${slug}/login?redirect=/${slug}/appointment`}
              className="flex items-center justify-center gap-2 bg-[#191919] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#2a2a2a]">
              🔑 Sign In
            </Link>
            <Link href={`/${slug}/register?redirect=/${slug}/appointment`}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 text-[#191919] rounded-xl py-3 text-sm font-semibold hover:border-[#14967F] hover:text-[#14967F]">
              📋 Register
            </Link>
          </div>
          <p className="text-center text-xs text-[#A3A3A3] mt-3">Registered patients get appointment history & prescriptions</p>

          <button onClick={() => { setShowAuthChoice(false); setSelectedSlot(null); }}
            className="w-full mt-4 text-center text-sm text-[#6b7280] hover:text-[#191919]">
            ← Back to date selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <Nav />
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
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

        {/* STEP 1 — Calendar */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#191919]">{MONTHS[month]} {year}</h2>
                <div className="flex gap-1.5">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#14967F]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#14967F]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => <div key={d} className="text-center text-[11px] font-semibold py-2 text-[#A3A3A3]">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
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
                  <button onClick={handleContinueFromStep1}
                    className="w-full bg-[#FAD069] text-[#191919] rounded-xl py-3 font-bold text-sm">
                    Continue →
                  </button>
                </div>
              )}

              {/* Booking mode badge */}
              {bookingMode === "guest" && (
                <div className="bg-white rounded-2xl p-4 text-center border-2 border-[#FAD069]">
                  <p className="text-xs font-semibold text-[#191919] mb-0.5">Booking as Guest</p>
                  <p className="text-[10px] text-[#A3A3A3]">{guestInfo.name} · {guestInfo.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-[#191919] mb-0.5">Appointment Details</h2>
                <p className="text-xs text-[#A3A3A3]">{selectedDate} {MONTHS[month]} {year} · {selectedSlot}</p>
              </div>
              {bookingMode === "guest" && (
                <div className="bg-[#F4F4F5] rounded-xl px-3 py-2 text-right">
                  <p className="text-[10px] text-[#A3A3A3]">Guest</p>
                  <p className="text-xs font-bold text-[#191919]">{guestInfo.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-5">
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
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Problem Description <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
                <textarea rows={4} placeholder="Describe your symptoms, duration, severity..."
                  value={form.problem} onChange={e => setForm({...form, problem: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Notes <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
                <textarea rows={2} placeholder="Allergies, current medications..."
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
              </div>

              <div className="bg-[#F4F4F5] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#14967F] uppercase tracking-wider mb-3">Summary</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                  {[
                    ["Patient", bookingMode === "guest" ? guestInfo.name : (patient?.name ?? "")],
                    ["Doctor", doctor?.name ?? ""],
                    ["Date", `${selectedDate} ${MONTHS[month]} ${year}`],
                    ["Time", selectedSlot!],
                    ["Type", form.type === "in-person" ? "In-Person" : "Online"],
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
              <button onClick={() => { setStep(1); if (bookingMode === "guest") { setShowAuthChoice(false); } }}
                className="flex-1 border-2 border-gray-100 text-[#A3A3A3] rounded-xl py-3 text-sm font-medium">← Back</button>
              <button onClick={handleConfirm} disabled={submitting}
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

export default function AppointmentPage() {
  return <Suspense fallback={null}><AppointmentContent /></Suspense>;
}
