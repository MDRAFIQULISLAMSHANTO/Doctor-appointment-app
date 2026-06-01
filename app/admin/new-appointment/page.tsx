"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Doctor = {
  id: string; name: string; specialty?: string; hospital?: string; services?: string[];
};
type FoundPatient = {
  id: string; name: string; phone: string; age?: number; gender?: string; has_portal_access?: boolean;
};
type Medication = { name: string; dose: string; frequency: string; duration: string };

export default function NewAppointmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Patient
  const [phoneInput, setPhoneInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundPatient, setFoundPatient] = useState<FoundPatient | null>(null);
  const [patientStatus, setPatientStatus] = useState<"idle" | "found" | "new">("idle");
  const [newPatient, setNewPatient] = useState({ name: "", age: "", gender: "" });
  const [portalAccess, setPortalAccess] = useState(false);
  const [portalPassword, setPortalPassword] = useState("");
  const [addToSystem, setAddToSystem] = useState(true);

  // Appointment
  const [apt, setApt] = useState({
    date: "", time_slot: "", service: "", visit_type: "in-person",
    fee: "", problem: "", notes: "",
  });

  // Prescription
  const [rxEnabled, setRxEnabled] = useState(false);
  const [rx, setRx] = useState({ diagnosis: "", rx_notes: "", bill_amount: "" });
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMed, setNewMed] = useState({ name: "", dose: "", frequency: "", duration: "" });

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    appointment: { id: string; serial_number: number; date: string; time_slot: string; service: string };
    portal_credentials?: { phone: string; password: string };
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }
      const { data: doc } = await supabase
        .from("doctors")
        .select("id, name, specialty, hospital, services")
        .eq("user_id", user.id).single();
      if (!doc) { router.replace("/admin/login"); return; }
      const d = doc as Doctor;
      setDoctor(d);
      // Auto-set service from doctor specialty
      setApt(a => ({ ...a, service: d.specialty ?? d.services?.[0] ?? "Consultation" }));
      setAuthChecked(true);
    };
    init();
  }, []);

  const searchPatient = async () => {
    const phone = phoneInput.replace(/\D/g, "");
    if (phone.length < 10) return;
    setSearching(true); setFoundPatient(null); setPatientStatus("idle");
    const res = await fetch(`/api/admin/patients?phone=${phone}`);
    const data = await res.json();
    if (data.patient) { setFoundPatient(data.patient); setPatientStatus("found"); }
    else { setPatientStatus("new"); setNewPatient(p => ({ ...p })); }
    setSearching(false);
  };

  const addMedication = () => {
    if (!newMed.name) return;
    setMedications(m => [...m, newMed]);
    setNewMed({ name: "", dose: "", frequency: "", duration: "" });
  };

  const removeMed = (i: number) => setMedications(m => m.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!apt.date || !apt.time_slot) {
      setError("Date and time slot are required"); return;
    }
    if (patientStatus === "new" && addToSystem && !newPatient.name) {
      setError("Patient name required"); return;
    }
    if (portalAccess && portalPassword.length < 6) {
      setError("Portal password must be at least 6 characters"); return;
    }

    setSubmitting(true); setError("");

    const body: Record<string, unknown> = {
      date: apt.date,
      time_slot: apt.time_slot,
      service: apt.service,
      visit_type: apt.visit_type,
      problem_text: apt.problem,
      notes: apt.notes,
      fee: apt.fee ? parseInt(apt.fee) : 0,
    };

    if (patientStatus === "found" && foundPatient) {
      body.patient_id = foundPatient.id;
    } else if (patientStatus === "new" && addToSystem) {
      body.patient_phone = phoneInput.replace(/\D/g, "");
      body.patient_name = newPatient.name;
      body.patient_age = newPatient.age || null;
      body.patient_gender = newPatient.gender || null;
      body.portal_access = portalAccess;
      if (portalAccess) body.portal_password = portalPassword;
    }

    if (rxEnabled && rx.diagnosis) {
      body.prescription = {
        diagnosis: rx.diagnosis,
        rx_notes: rx.rx_notes,
        medications,
        bill_amount: rx.bill_amount ? parseInt(rx.bill_amount) : 0,
      };
    }

    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to create"); setSubmitting(false); return; }
    setSuccess(data);
    setSubmitting(false);
  };

  const handlePrint = () => {
    if (!success || !rxEnabled || !rx.diagnosis) return;
    const patName = foundPatient?.name ?? newPatient.name ?? "Patient";
    const w = window.open("", "_blank", "width=800,height=700");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Prescription</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',sans-serif;padding:40px;color:#191919;max-width:720px;margin:auto;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #14967F;}
  .logo{display:flex;align-items:center;gap:8px;}
  .logo-icon{width:32px;height:32px;background:#14967F;border-radius:8px;display:flex;align-items:center;justify-content:center;}
  .doctor-name{font-size:20px;font-weight:700;color:#191919;}
  .doctor-sub{font-size:13px;color:#6b7280;margin-top:2px;}
  .section{margin-bottom:20px;}
  .section-title{font-size:11px;font-weight:700;color:#14967F;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .info-item{background:#f9f9f9;padding:10px 14px;border-radius:8px;}
  .info-label{font-size:10px;color:#A3A3A3;margin-bottom:2px;}
  .info-value{font-size:13px;font-weight:600;}
  .rx-box{background:#f0faf7;border-left:4px solid #14967F;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:16px;}
  .med-table{width:100%;border-collapse:collapse;font-size:12px;}
  .med-table th{background:#14967F;color:white;padding:8px 12px;text-align:left;font-weight:600;}
  .med-table td{padding:8px 12px;border-bottom:1px solid #f0f0f0;}
  .med-table tr:last-child td{border:none;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;}
  .sign-line{width:160px;border-top:1px solid #191919;text-align:center;padding-top:6px;font-size:11px;color:#6b7280;}
  .print-btn{background:#14967F;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;margin-bottom:24px;}
  @media print{.print-btn{display:none;}}
</style>
</head><body>
<button class="print-btn" onclick="window.print()">🖨️ Print Prescription</button>
<div class="header">
  <div>
    <div class="doctor-name">${doctor?.name}</div>
    <div class="doctor-sub">${doctor?.specialty ?? ""} · ${doctor?.hospital ?? ""}</div>
  </div>
  <div style="text-align:right;font-size:12px;color:#6b7280;">
    <div style="font-weight:600;">Date: ${apt.date}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Patient Information</div>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Name</div><div class="info-value">${patName}</div></div>
    <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${phoneInput}</div></div>
    ${foundPatient?.age || newPatient.age ? `<div class="info-item"><div class="info-label">Age</div><div class="info-value">${foundPatient?.age ?? newPatient.age}</div></div>` : ""}
    ${foundPatient?.gender || newPatient.gender ? `<div class="info-item"><div class="info-label">Gender</div><div class="info-value" style="text-transform:capitalize">${foundPatient?.gender ?? newPatient.gender}</div></div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-title">Appointment</div>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Service</div><div class="info-value">${apt.service}</div></div>
    <div class="info-item"><div class="info-label">Visit Type</div><div class="info-value" style="text-transform:capitalize">${apt.visit_type}</div></div>
    ${apt.problem ? `<div class="info-item" style="grid-column:1/-1"><div class="info-label">Chief Complaint</div><div class="info-value" style="font-weight:400">${apt.problem}</div></div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-title">Prescription</div>
  <div class="rx-box">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px;">Diagnosis</div>
    <div style="font-size:14px;margin-bottom:${rx.rx_notes ? "16px" : "0"}">${rx.diagnosis}</div>
    ${rx.rx_notes ? `<div style="font-size:13px;font-weight:700;margin-bottom:6px;">Notes</div><div style="font-size:13px;white-space:pre-wrap">${rx.rx_notes}</div>` : ""}
  </div>
  ${medications.length > 0 ? `
  <table class="med-table">
    <thead><tr><th>Medication</th><th>Dose</th><th>Frequency</th><th>Duration</th></tr></thead>
    <tbody>${medications.map(m => `<tr><td><strong>${m.name}</strong></td><td>${m.dose}</td><td>${m.frequency}</td><td>${m.duration}</td></tr>`).join("")}</tbody>
  </table>` : ""}
  ${rx.bill_amount ? `<div style="margin-top:12px;text-align:right;font-size:14px;font-weight:700;">Bill: ৳${rx.bill_amount}</div>` : ""}
</div>

<div class="footer">
  <div style="font-size:12px;color:#A3A3A3;">Powered by BookMyDoc</div>
  <div class="sign-line">${doctor?.name}<br/>Signature</div>
</div>
</body></html>`);
    w.document.close();
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#14967F] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F4F5]">
        <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#191919]">
            ← Dashboard
          </Link>
          <span className="font-bold text-[#191919] text-sm">{doctor?.name}</span>
        </nav>
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#191919] mb-1">Appointment Created</h2>
            <p className="text-sm text-[#6b7280] mb-6">Serial #{success.appointment.serial_number}</p>

            <div className="bg-[#F4F4F5] rounded-2xl p-4 text-left space-y-2 mb-5">
              {[
                ["Patient", foundPatient?.name ?? newPatient.name ?? "—"],
                ["Date", success.appointment.date],
                ["Time", success.appointment.time_slot],
                ["Fee", apt.fee ? `৳${apt.fee}` : "—"],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-[#A3A3A3]">{l}</span>
                  <span className="font-semibold text-[#191919]">{v}</span>
                </div>
              ))}
            </div>

            {success.portal_credentials && (
              <div className="bg-[#e8f5f2] rounded-2xl p-4 text-left mb-5">
                <p className="text-xs font-bold text-[#14967F] mb-2">Patient Portal Credentials</p>
                <div className="space-y-1">
                  <p className="text-sm font-mono text-[#191919]">📱 {success.portal_credentials.phone}</p>
                  <p className="text-sm font-mono text-[#191919]">🔑 {success.portal_credentials.password}</p>
                </div>
                <p className="text-[10px] text-[#6b7280] mt-2">Share with patient to access portal.</p>
              </div>
            )}

            <div className="flex gap-3">
              {rxEnabled && rx.diagnosis && (
                <button onClick={handlePrint}
                  className="flex-1 bg-[#191919] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#2a2a2a]">
                  🖨️ Print Prescription
                </button>
              )}
              <button onClick={() => router.push("/admin/new-appointment")}
                className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#0d7a66]">
                + New Appointment
              </button>
            </div>
            <Link href="/admin/dashboard" className="block mt-3 text-sm text-[#A3A3A3] hover:text-[#191919]">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#191919]">
          ← Dashboard
        </Link>
        <h1 className="font-bold text-[#191919] text-sm">New Appointment</h1>
        <span className="text-xs text-[#A3A3A3]">{doctor?.name}</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── SECTION 1: Patient ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#e8f5f2] flex items-center justify-center text-sm">👤</div>
            <h2 className="font-bold text-[#191919]">Patient</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Phone search */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => { setPhoneInput(e.target.value); setPatientStatus("idle"); setFoundPatient(null); }}
                  onKeyDown={e => e.key === "Enter" && searchPatient()}
                  placeholder="01XXXXXXXXX"
                  className="flex-1 bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
                <button
                  onClick={searchPatient}
                  disabled={searching || phoneInput.replace(/\D/g,"").length < 10}
                  className="bg-[#14967F] text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#0d7a66] disabled:opacity-40 whitespace-nowrap"
                >
                  {searching ? "..." : "Search"}
                </button>
              </div>
            </div>

            {/* Found patient */}
            {patientStatus === "found" && foundPatient && (
              <div className="bg-[#e8f5f2] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="text-xs font-bold text-[#14967F]">Patient Found</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {([["Name", foundPatient.name], ["Phone", foundPatient.phone], ["Age", foundPatient.age ?? "—"], ["Gender", foundPatient.gender ?? "—"]] as [string,string|number][]).map(([l,v]) => (
                    <div key={l}>
                      <p className="text-[#A3A3A3]">{l}</p>
                      <p className="font-semibold text-[#191919] capitalize">{v}</p>
                    </div>
                  ))}
                </div>
                {foundPatient.has_portal_access && (
                  <p className="text-[10px] text-[#14967F] mt-2 font-medium">✓ Has portal access</p>
                )}
              </div>
            )}

            {/* New patient */}
            {patientStatus === "new" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
                  ⚠️ No patient found for this number
                </div>

                {/* Add to system toggle */}
                <div className="flex items-center justify-between bg-[#F4F4F5] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#191919]">Add to patient records</p>
                    <p className="text-xs text-[#A3A3A3]">Save patient info for future appointments</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddToSystem(v => !v)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${addToSystem ? "bg-[#14967F]" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${addToSystem ? "left-[26px]" : "left-0.5"}`}/>
                  </button>
                </div>

                {addToSystem && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Full Name <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={newPatient.name}
                          onChange={e => setNewPatient(p => ({...p, name: e.target.value}))}
                          placeholder="Patient full name"
                          className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Age</label>
                        <input
                          type="number" min="1" max="120"
                          value={newPatient.age}
                          onChange={e => setNewPatient(p => ({...p, age: e.target.value}))}
                          placeholder="—"
                          className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Gender</label>
                        <select
                          value={newPatient.gender}
                          onChange={e => setNewPatient(p => ({...p, gender: e.target.value}))}
                          className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                        >
                          <option value="">—</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Portal access */}
                    <div className="border-2 border-gray-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#191919]">Patient Portal Access</p>
                          <p className="text-xs text-[#A3A3A3]">Patient can log in to view appointments & prescriptions</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPortalAccess(v => !v)}
                          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${portalAccess ? "bg-[#14967F]" : "bg-gray-200"}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${portalAccess ? "left-[26px]" : "left-0.5"}`}/>
                        </button>
                      </div>
                      {portalAccess && (
                        <div>
                          <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Portal Password <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={portalPassword}
                            onChange={e => setPortalPassword(e.target.value)}
                            placeholder="min 6 characters"
                            className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                          />
                          <p className="text-[10px] text-[#A3A3A3] mt-1">Share this password with the patient after creating.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 2: Appointment Details ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#e8f5f2] flex items-center justify-center text-sm">📅</div>
            <h2 className="font-bold text-[#191919]">Appointment Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={apt.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setApt(a => ({...a, date: e.target.value}))}
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Time Slot <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={apt.time_slot}
                  onChange={e => setApt(a => ({...a, time_slot: e.target.value}))}
                  placeholder="e.g. 10:00 AM"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
              </div>
            </div>


            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-2">Visit Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[{value:"in-person",label:"🏥 In-Person"},{value:"online",label:"💻 Online"}].map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setApt(a => ({...a, visit_type: t.value}))}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${apt.visit_type === t.value ? "border-[#14967F] bg-[#e8f5f2] text-[#14967F]" : "border-gray-100 text-[#6b7280]"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Chief Complaint / Problem</label>
              <textarea
                rows={3}
                value={apt.problem}
                onChange={e => setApt(a => ({...a, problem: e.target.value}))}
                placeholder="Describe the patient's complaint or reason for visit..."
                className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Notes</label>
                <input
                  type="text"
                  value={apt.notes}
                  onChange={e => setApt(a => ({...a, notes: e.target.value}))}
                  placeholder="Optional notes"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Consultation Fee (৳)</label>
                <input
                  type="number"
                  value={apt.fee}
                  onChange={e => setApt(a => ({...a, fee: e.target.value}))}
                  placeholder="0"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Prescription ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#e8f5f2] flex items-center justify-center text-sm">💊</div>
              <div>
                <h2 className="font-bold text-[#191919]">Prescription</h2>
                <p className="text-xs text-[#A3A3A3]">Optional — write prescription now or later</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRxEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${rxEnabled ? "bg-[#14967F]" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${rxEnabled ? "left-[26px]" : "left-0.5"}`}/>
            </button>
          </div>

          {rxEnabled && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Diagnosis <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={rx.diagnosis}
                  onChange={e => setRx(r => ({...r, diagnosis: e.target.value}))}
                  placeholder="Primary diagnosis"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Prescription Notes</label>
                <textarea
                  rows={4}
                  value={rx.rx_notes}
                  onChange={e => setRx(r => ({...r, rx_notes: e.target.value}))}
                  placeholder="Treatment plan, instructions, follow-up advice..."
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F] resize-none"
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#6b7280]">Medications</label>
                  <span className="text-[10px] text-[#A3A3A3]">{medications.length} added</span>
                </div>

                {medications.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {medications.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#F4F4F5] rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-[#191919]">{m.name}</p>
                          <p className="text-xs text-[#6b7280]">{m.dose} · {m.frequency} · {m.duration}</p>
                        </div>
                        <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 text-lg leading-none ml-3">×</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-[#F4F4F5] rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={newMed.name}
                        onChange={e => setNewMed(m => ({...m, name: e.target.value}))}
                        placeholder="Medicine name"
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                      />
                    </div>
                    <input
                      type="text"
                      value={newMed.dose}
                      onChange={e => setNewMed(m => ({...m, dose: e.target.value}))}
                      placeholder="Dose (e.g. 500mg)"
                      className="bg-white rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                    />
                    <input
                      type="text"
                      value={newMed.frequency}
                      onChange={e => setNewMed(m => ({...m, frequency: e.target.value}))}
                      placeholder="Frequency (e.g. 3x/day)"
                      className="bg-white rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                    />
                    <input
                      type="text"
                      value={newMed.duration}
                      onChange={e => setNewMed(m => ({...m, duration: e.target.value}))}
                      placeholder="Duration (e.g. 7 days)"
                      className="bg-white rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                    />
                  </div>
                  <button onClick={addMedication} disabled={!newMed.name}
                    className="w-full border-2 border-dashed border-[#14967F] text-[#14967F] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#e8f5f2] disabled:opacity-40 transition-colors">
                    + Add Medication
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Bill Amount (৳)</label>
                <input
                  type="number"
                  value={rx.bill_amount}
                  onChange={e => setRx(r => ({...r, bill_amount: e.target.value}))}
                  placeholder="0"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm">{error}</div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !apt.date || !apt.time_slot || (rxEnabled && !rx.diagnosis)}
          className="w-full bg-[#14967F] text-white rounded-2xl py-4 font-bold text-base hover:bg-[#0d7a66] disabled:opacity-40 transition-colors shadow-lg shadow-[#14967F]/20"
        >
          {submitting ? "Creating Appointment..." : "Create Appointment →"}
        </button>

        <div className="h-6"/>
      </div>
    </div>
  );
}
