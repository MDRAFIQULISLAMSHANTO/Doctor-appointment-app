"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MedicineAutocomplete } from "@/components/MedicineAutocomplete";
import { currencySymbol } from "@/lib/currency";

const SERIF = { fontFamily: "'Noto Serif', ui-serif, Georgia, serif", letterSpacing: "-0.02em" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

type Medicine = { name: string; dosage: string; frequency: string; duration: string; instructions: string };
type Rx = { diagnosis: string; medicines: Medicine[]; notes: string; fee: string; next_date: string; next_time: string };
type HistoryRx = { diagnosis: string; medicines: Medicine[]; fee: number; notes?: string };
type HistoryEntry = { id: string; date: string; time_slot: string; service: string; problem_text?: string; prescriptions?: HistoryRx[] };
type Appointment = {
  id: string; date: string; time_slot: string; service: string; visit_type: string;
  status: string; serial_number?: number; problem_text?: string; notes?: string;
  patients?: { id: string; name: string; phone: string; age?: number; gender?: string };
  doctors?: { id: string; name: string; specialty?: string };
};

const FREQ_OPTIONS = ["Once daily","Twice daily","Three times daily","Four times daily","Every 6 hours","Every 8 hours","As needed","At bedtime","With meals","Before meals","After meals"];
const STAGES = ["Diagnosis","Medications","Details","Review"];

function emptyMed(): Medicine { return { name: "", dosage: "", frequency: "Twice daily", duration: "", instructions: "" }; }
function emptyRx(): Rx { return { diagnosis: "", medicines: [], notes: "", fee: "", next_date: "", next_time: "" }; }

export default function CheckinPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [apt, setApt] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<{ id: string; name: string; currency?: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);
  const [rx, setRx] = useState<Rx>(emptyRx());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [historySearch, setHistorySearch] = useState("");

  const cur = currencySymbol(doctor?.currency);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/admin/login"); return; }

    const { data: doc } = await supabase.from("doctors").select("id, name, currency").eq("user_id", user.id).single();
    if (!doc) { router.push("/admin/login"); return; }
    setDoctor(doc);

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, date, time_slot, service, visit_type, status, serial_number, problem_text, notes, patients(id, name, phone, age, gender), doctors(id, name, specialty)")
      .eq("id", id)
      .single();

    if (!appointment) { router.push("/admin/dashboard"); return; }
    setApt(appointment as unknown as Appointment);

    // Mark as checked-in if still scheduled
    if (appointment.status === "scheduled") {
      await supabase.from("appointments").update({ status: "checked-in" }).eq("id", id);
      setApt(a => a ? { ...a, status: "checked-in" } : a);
    }

    // Load patient history
    const patientId = Array.isArray(appointment.patients) ? appointment.patients[0]?.id : (appointment.patients as { id?: string } | undefined)?.id;
    if (patientId) {
      const { data: hist } = await supabase
        .from("appointments")
        .select("id, date, time_slot, service, problem_text, prescriptions(diagnosis, medicines, fee, notes)")
        .eq("patient_id", patientId)
        .neq("id", id)
        .order("date", { ascending: false })
        .limit(20);
      setHistory((hist as HistoryEntry[]) ?? []);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const addMed = () => setRx(r => ({ ...r, medicines: [...r.medicines, emptyMed()] }));
  const removeMed = (i: number) => setRx(r => ({ ...r, medicines: r.medicines.filter((_, j) => j !== i) }));
  const updateMed = (i: number, field: keyof Medicine, val: string) =>
    setRx(r => ({ ...r, medicines: r.medicines.map((m, j) => j === i ? { ...m, [field]: val } : m) }));

  const addFromHistory = (m: Medicine) => {
    if (rx.medicines.find(x => x.name.trim().toLowerCase() === m.name.trim().toLowerCase())) return;
    setRx(r => ({ ...r, medicines: [...r.medicines, { ...m }] }));
  };

  const handleSave = async () => {
    if (!apt || !doctor || !rx.diagnosis) { setError("Diagnosis is required"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id: apt.id,
        patient_id: apt.patients?.id ?? null,
        doctor_id: doctor.id,
        diagnosis: rx.diagnosis,
        medicines: rx.medicines,
        notes: rx.notes,
        fee: rx.fee ? parseInt(rx.fee) : 0,
        next_appointment_date: rx.next_date || null,
        next_appointment_time: rx.next_time || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ? `Failed to save: ${d.error}` : "Failed to save prescription");
      setSaving(false);
      return;
    }
    await supabase.from("appointments").update({ status: "checked-out", fee: rx.fee ? parseInt(rx.fee) : 0 }).eq("id", apt.id);
    setSaved(true); setSaving(false);
  };

  const handlePrint = () => {
    if (!apt || !rx.diagnosis) return;
    const medRows = rx.medicines.map((m, i) =>
      `<tr><td>${i+1}</td><td><strong>${m.name}</strong></td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration}</td><td>${m.instructions}</td></tr>`
    ).join("");
    const w = window.open("","_blank","width=800,height=900");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Prescription</title>
    <style>body{font-family:'Segoe UI',sans-serif;max-width:700px;margin:40px auto;color:#191919;font-size:13px;}
    h1{font-size:20px;margin:0;}h2{font-size:14px;color:#797776;font-weight:400;margin:2px 0 16px;}
    .divider{border:none;border-top:2px solid #191919;margin:16px 0;}
    .info-row{display:flex;justify-content:space-between;margin:4px 0;}
    .label{color:#797776;}.value{font-weight:600;}
    .section-title{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#797776;margin:16px 0 8px;font-weight:600;}
    table{width:100%;border-collapse:collapse;}th{background:#f0faf8;color:#14967F;text-align:left;padding:8px;font-size:11px;text-transform:uppercase;}
    td{padding:7px 8px;border-bottom:1px solid #f0f0f0;}
    .footer{margin-top:32px;text-align:center;color:#bbb;font-size:10px;border-top:1px solid #f0f0f0;padding-top:10px;}
    .sig-box{margin-top:40px;text-align:right;}.sig{display:inline-block;border-top:1px solid #191919;padding-top:8px;min-width:160px;font-size:12px;}
    </style></head><body>
    <h1>Dr. ${apt.doctors?.name ?? doctor?.name}</h1>
    <h2>${apt.doctors?.specialty ?? ""}</h2>
    <hr class="divider"/>
    <div class="info-row"><span class="label">Patient</span><span class="value">${apt.patients?.name}</span></div>
    <div class="info-row"><span class="label">Phone</span><span class="value">${apt.patients?.phone}</span></div>
    <div class="info-row"><span class="label">Date</span><span class="value">${apt.date}</span></div>
    <div class="info-row"><span class="label">Serial</span><span class="value">#${String(apt.serial_number ?? 0).padStart(2,"0")}</span></div>
    <div class="info-row"><span class="label">Diagnosis</span><span class="value">${rx.diagnosis}</span></div>
    ${rx.fee ? `<div class="info-row"><span class="label">Fee</span><span class="value">${cur}${rx.fee}</span></div>` : ""}
    ${rx.next_date ? `<div class="info-row"><span class="label">Next Visit</span><span class="value">${rx.next_date}${rx.next_time ? " at " + rx.next_time : ""}</span></div>` : ""}
    ${medRows ? `<div class="section-title">Rx — Medications</div>
    <table><thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
    <tbody>${medRows}</tbody></table>` : ""}
    ${rx.notes ? `<div class="section-title">Notes</div><p>${rx.notes}</p>` : ""}
    <div class="sig-box"><div class="sig">Signature</div></div>
    <div class="footer">Generated by BookMyDoc · ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f3f1" }}>
      <div className="w-8 h-8 border-2 border-[#14967F] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (saved) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f3f1" }}>
      <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 className="text-xl font-bold text-[#191919] mb-1" style={SERIF}>Prescription Saved</h2>
        <p className="text-sm text-[#6b7280] mb-6">Patient has been checked out.</p>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="flex-1 border-2 border-[#14967F] text-[#14967F] rounded-xl py-3 text-sm font-semibold">
            🖨 Print
          </button>
          <Link href="/admin/dashboard"
            className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-semibold text-center">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  const historyMedicineNames = Array.from(new Set(
    history.flatMap(h => (h.prescriptions ?? []).flatMap(p => (p.medicines ?? []).map(m => m.name))).filter(Boolean)
  ));

  const filteredHistory = history.filter(h =>
    !historySearch || (h.prescriptions ?? []).some(p =>
      p.diagnosis?.toLowerCase().includes(historySearch.toLowerCase()) ||
      (p.medicines ?? []).some(m => m.name?.toLowerCase().includes(historySearch.toLowerCase()))
    ) || h.service?.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f6f3f1" }}>
      {/* Top bar */}
      <header className="bg-white border-b sticky top-0 z-20" style={{ borderColor: "rgba(36,36,36,0.1)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-[#A3A3A3] hover:text-[#191919] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            </Link>
            <div className="w-px h-5 bg-gray-200"/>
            <div>
              <p className="font-bold text-[#191919] text-sm" style={SERIF}>{apt?.patients?.name}</p>
              <p className="text-xs text-[#A3A3A3]" style={MONO}>
                #{String(apt?.serial_number ?? 0).padStart(2,"0")} · {apt?.date} · {apt?.time_slot} · {apt?.service}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full font-medium" style={MONO}>
              Checked In
            </span>
            <button onClick={handlePrint} disabled={!rx.diagnosis}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#6b7280] hover:border-[#14967F] hover:text-[#14967F] disabled:opacity-30 transition-colors"
              style={MONO}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* MAIN — Stage form */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Stage indicator */}
          <div className="bg-white border-b px-4 sm:px-8 py-4" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
            <div className="flex items-center gap-0">
              {STAGES.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <button
                    onClick={() => i < stage || stage === i ? setStage(i) : undefined}
                    className="flex items-center gap-2 group">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
                      ${i < stage ? "bg-[#14967F] text-white" : i === stage ? "bg-[#191919] text-white" : "bg-gray-100 text-[#A3A3A3]"}`}>
                      {i < stage ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === stage ? "text-[#191919]" : i < stage ? "text-[#14967F]" : "text-[#A3A3A3]"}`}>{s}</span>
                  </button>
                  {i < STAGES.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < stage ? "bg-[#14967F]" : "bg-gray-100"}`}/>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Patient info bar */}
          {apt?.problem_text && (
            <div className="mx-4 sm:mx-8 mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">Chief Complaint</p>
              <p className="text-sm text-amber-900">{apt.problem_text}</p>
            </div>
          )}

          {/* Stage content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">

            {/* STAGE 0: Diagnosis */}
            {stage === 0 && (
              <div className="max-w-2xl space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#191919] mb-1" style={SERIF}>Diagnosis</h2>
                  <p className="text-sm text-[#A3A3A3]">Enter the primary diagnosis for this visit</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
                    {[
                      ["Patient", apt?.patients?.name ?? "—"],
                      ["Phone", apt?.patients?.phone ?? "—"],
                      ["Age", apt?.patients?.age ? `${apt.patients.age} yrs` : "—"],
                      ["Gender", apt?.patients?.gender ?? "—"],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-[#f6f3f1] rounded-xl px-3 py-2">
                        <p className="text-[#A3A3A3] mb-0.5">{l}</p>
                        <p className="font-semibold text-[#191919] capitalize">{v}</p>
                      </div>
                    ))}
                  </div>

                  <label className="block text-xs font-bold text-[#191919] mb-2 uppercase tracking-wide">Primary Diagnosis *</label>
                  <input
                    type="text" autoFocus
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Viral URTI..."
                    value={rx.diagnosis}
                    onChange={e => setRx(r => ({ ...r, diagnosis: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"
                  />
                  {apt?.notes && (
                    <div className="mt-4 bg-blue-50 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">Patient Notes</p>
                      <p className="text-xs text-blue-900">{apt.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 1: Medications */}
            {stage === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#191919]" style={SERIF}>Medications</h2>
                    <p className="text-xs text-[#A3A3A3] mt-0.5">Dx: <span className="text-[#14967F] font-medium">{rx.diagnosis}</span></p>
                  </div>
                  <button onClick={addMed}
                    className="flex items-center gap-1.5 bg-[#14967F] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#0d7a66]">
                    + Add Medicine
                  </button>
                </div>

                {rx.medicines.length === 0 ? (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
                    <p className="text-3xl mb-3">💊</p>
                    <p className="text-[#191919] font-semibold mb-1">No medicines yet</p>
                    <p className="text-sm text-[#A3A3A3] mb-4">Add from the button above or pick from patient history →</p>
                    <button onClick={addMed}
                      className="inline-flex items-center gap-2 bg-[#14967F] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#0d7a66]">
                      + Add First Medicine
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border relative" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
                        <button onClick={() => removeMed(i)}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center text-base font-bold leading-none">
                          ×
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Medicine Name *</label>
                            <MedicineAutocomplete
                              value={m.name}
                              onChange={v => updateMed(i, "name", v)}
                              placeholder="e.g. Amlodipine"
                              extraSuggestions={historyMedicineNames}
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Dosage</label>
                            <input value={m.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} placeholder="e.g. 5mg, 500mg"
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Frequency</label>
                            <select value={m.frequency} onChange={e => updateMed(i, "frequency", e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm bg-white">
                              {FREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Duration</label>
                            <input value={m.duration} onChange={e => updateMed(i, "duration", e.target.value)} placeholder="e.g. 7 days, 1 month"
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Instructions</label>
                            <input value={m.instructions} onChange={e => updateMed(i, "instructions", e.target.value)} placeholder="e.g. After meals, with water"
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STAGE 2: Details */}
            {stage === 2 && (
              <div className="max-w-2xl space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#191919]" style={SERIF}>Additional Details</h2>
                  <p className="text-sm text-[#A3A3A3]">Notes, fee, and follow-up scheduling</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border space-y-5" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1.5 uppercase tracking-wide">Doctor&apos;s Notes</label>
                    <textarea rows={4} placeholder="Additional instructions, lifestyle advice, follow-up notes..."
                      value={rx.notes} onChange={e => setRx(r => ({ ...r, notes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm resize-none"/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1.5 uppercase tracking-wide">Consultation Fee ({cur})</label>
                      <input type="number" placeholder="0" value={rx.fee}
                        onChange={e => setRx(r => ({ ...r, fee: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1.5 uppercase tracking-wide">Next Appointment</label>
                      <div className="flex gap-2">
                        <input type="date" value={rx.next_date} onChange={e => setRx(r => ({ ...r, next_date: e.target.value }))}
                          className="flex-1 px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                        <input type="time" value={rx.next_time} onChange={e => setRx(r => ({ ...r, next_time: e.target.value }))}
                          className="w-28 px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: Review */}
            {stage === 3 && (
              <div className="max-w-2xl space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#191919]" style={SERIF}>Review & Save</h2>
                  <p className="text-sm text-[#A3A3A3]">Confirm everything looks correct before saving</p>
                </div>
                <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
                  <div className="px-6 py-4">
                    <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Patient</p>
                    <p className="font-semibold text-[#191919]">{apt?.patients?.name} · {apt?.patients?.phone}</p>
                    <p className="text-xs text-[#A3A3A3] mt-0.5">{apt?.date} · {apt?.time_slot} · {apt?.service}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-1">Diagnosis</p>
                    <p className="font-semibold text-[#191919]">{rx.diagnosis || <span className="text-red-400">Not set</span>}</p>
                  </div>
                  {rx.medicines.length > 0 && (
                    <div className="px-6 py-4">
                      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wide mb-3">Medications ({rx.medicines.length})</p>
                      <div className="space-y-2">
                        {rx.medicines.map((m, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <span className="w-5 h-5 rounded-full bg-[#e8f5f2] text-[#14967F] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                            <div>
                              <span className="font-semibold text-[#191919]">{m.name}</span>
                              {m.dosage && <span className="text-[#A3A3A3] ml-1.5">({m.dosage})</span>}
                              <span className="text-[#6b7280] ml-1.5">· {m.frequency}</span>
                              {m.duration && <span className="text-[#6b7280] ml-1.5">· {m.duration}</span>}
                              {m.instructions && <span className="text-[#A3A3A3] ml-1.5">· {m.instructions}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(rx.notes || rx.fee || rx.next_date) && (
                    <div className="px-6 py-4 space-y-1.5 text-sm">
                      {rx.notes && <p><span className="text-[#A3A3A3]">Notes: </span>{rx.notes}</p>}
                      {rx.fee && <p><span className="text-[#A3A3A3]">Fee: </span><strong>{cur}{rx.fee}</strong></p>}
                      {rx.next_date && <p><span className="text-[#A3A3A3]">Next Visit: </span>{rx.next_date}{rx.next_time ? ` at ${rx.next_time}` : ""}</p>}
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}
              </div>
            )}
          </div>

          {/* Stage navigation */}
          <div className="bg-white border-t px-4 sm:px-8 py-4 flex items-center justify-between gap-3" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
            {stage > 0 ? (
              <button onClick={() => setStage(s => s - 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-[#6b7280] hover:border-gray-300 font-medium">
                ← Back
              </button>
            ) : (
              <Link href="/admin/dashboard"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-[#6b7280] hover:border-gray-300 font-medium">
                ← Cancel
              </Link>
            )}
            <div className="flex gap-2">
              {stage < STAGES.length - 1 ? (
                <button onClick={() => setStage(s => s + 1)}
                  disabled={stage === 0 && !rx.diagnosis}
                  className="px-6 py-2.5 rounded-xl bg-[#191919] text-white text-sm font-semibold hover:bg-[#2a2a2a] disabled:opacity-40 transition-colors">
                  Next: {STAGES[stage + 1]} →
                </button>
              ) : (
                <>
                  <button onClick={handlePrint} disabled={!rx.diagnosis}
                    className="px-5 py-2.5 rounded-xl border-2 border-[#14967F] text-[#14967F] text-sm font-semibold hover:bg-[#e8f5f2] disabled:opacity-30">
                    🖨 Print
                  </button>
                  <button onClick={handleSave} disabled={saving || !rx.diagnosis}
                    className="px-6 py-2.5 rounded-xl bg-[#14967F] text-white text-sm font-semibold hover:bg-[#0d7a66] disabled:opacity-40">
                    {saving ? "Saving..." : "Save & Check Out ✓"}
                  </button>
                </>
              )}
            </div>
          </div>
        </main>

        {/* HISTORY SIDEBAR */}
        <aside className="hidden lg:flex w-80 xl:w-96 flex-col border-l bg-white overflow-hidden flex-shrink-0" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
          <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
            <p className="font-bold text-[#191919] text-sm mb-3" style={SERIF}>Patient History</p>
            <input type="text" placeholder="Search diagnosis or medicine..."
              value={historySearch} onChange={e => setHistorySearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-xs"
              style={MONO}/>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {history.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-xs text-[#A3A3A3]">No previous visits on record</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <p className="text-xs text-[#A3A3A3] py-8 text-center">No matches for &ldquo;{historySearch}&rdquo;</p>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map(h => (
                  <div key={h.id} className="border rounded-2xl overflow-hidden" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
                    {/* Visit header */}
                    <div className="px-4 py-3 bg-[#f9f9f9] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#191919]">{h.date}</p>
                        <p className="text-[10px] text-[#A3A3A3]">{h.time_slot} · {h.service}</p>
                      </div>
                    </div>

                    {h.problem_text && (
                      <div className="px-4 py-2 bg-amber-50 border-y border-amber-100">
                        <p className="text-[10px] text-amber-700 italic">&ldquo;{h.problem_text}&rdquo;</p>
                      </div>
                    )}

                    {(h.prescriptions ?? []).map((p, pi) => (
                      <div key={pi} className="px-4 py-3">
                        <p className="text-xs font-semibold text-[#14967F] mb-2">Dx: {p.diagnosis}</p>
                        {(p.medicines ?? []).length > 0 && (
                          <div className="space-y-1.5">
                            {(p.medicines ?? []).map((m, mi) => (
                              <div key={mi} className="flex items-center gap-2 group">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-[#191919] truncate">{m.name}</p>
                                  <p className="text-[10px] text-[#A3A3A3]">
                                    {[m.dosage, m.frequency, m.duration].filter(Boolean).join(" · ")}
                                  </p>
                                </div>
                                <button
                                  onClick={() => addFromHistory(m)}
                                  disabled={rx.medicines.some(x => x.name.trim().toLowerCase() === m.name.trim().toLowerCase())}
                                  className="flex-shrink-0 text-[10px] px-2 py-1 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  style={MONO}
                                  title={rx.medicines.some(x => x.name.trim().toLowerCase() === m.name.trim().toLowerCase()) ? "Already added" : "Add to prescription"}>
                                  {rx.medicines.some(x => x.name.trim().toLowerCase() === m.name.trim().toLowerCase())
                                    ? <span className="text-[#14967F]">✓</span>
                                    : <span className="text-[#A3A3A3] group-hover:text-[#14967F] border-current">+ Add</span>
                                  }
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {p.notes && <p className="text-[10px] text-[#797776] mt-2 italic">{p.notes}</p>}
                        {p.fee > 0 && <p className="text-[10px] text-[#A3A3A3] mt-1">Fee: ${p.fee}</p>}
                      </div>
                    ))}

                    {(h.prescriptions ?? []).length === 0 && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] text-[#A3A3A3] italic">No prescription for this visit</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
