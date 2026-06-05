"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, Fragment } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Appointments", icon: "📅" },
  { label: "My Schedule", icon: "🗓️" },
  { label: "Prescriptions", icon: "💊" },
  { label: "Patients", icon: "👥" },
  { label: "Reports", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
];

const statusColor: Record<string, string> = {
  "checked-out": "bg-green-50 text-green-600",
  "checked-in":  "bg-yellow-50 text-yellow-600",
  "cancelled":   "bg-red-50 text-red-500",
  "scheduled":   "bg-blue-50 text-blue-600",
};
const statusLabel: Record<string, string> = {
  "checked-out": "Checked Out",
  "checked-in":  "Checked In",
  "cancelled":   "Cancelled",
  "scheduled":   "Scheduled",
};

type Appointment = {
  id: string;
  service: string;
  date: string;
  serial_number?: number;
  time_slot: string;
  visit_type: string;
  status: string;
  fee?: number;
  problem_text?: string;
  notes?: string;
  patients?: { id: string; name: string; phone: string };
};

type Patient = {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
  first_visit?: string;
  visits?: number;
};

type ScheduleDay = {
  day_of_week: string;
  is_open: boolean;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  max_patients: number;
};

type BlockedDate = {
  date: string;
  reason: string;
};

type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type FullRx = {
  diagnosis: string;
  medicines: Medicine[];
  notes: string;
  fee: string;
  next_date: string;
  next_time: string;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
  hospital?: string;
  address?: string;
  city?: string;
  bio?: string;
  hours?: Record<string, string>;
  services?: string[];
  plan?: string;
  features?: Record<string, unknown>;
};

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [rxForm, setRxForm] = useState<Record<string, FullRx>>({});
  const [savingRx, setSavingRx] = useState<string | null>(null);
  const [editApt, setEditApt] = useState<string | null>(null);
  const [editAptForm, setEditAptForm] = useState({ date: "", time_slot: "" });
  const [savingEdit, setSavingEdit] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [settingsForm, setSettingsForm] = useState({ name: "", specialty: "", phone: "", hospital: "", address: "", bio: "" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState({ date: "", reason: "" });
  const [blockingDate, setBlockingDate] = useState(false);

  // Manual appointment modal state
  const [showNewApt, setShowNewApt] = useState(false);
  const [manualStep, setManualStep] = useState(1);
  const [patientSearch, setPatientSearch] = useState("");
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [manualPatientForm, setManualPatientForm] = useState({ name: "", phone: "", age: "", gender: "", portal_access: false, portal_password: "" });
  const [manualAptForm, setManualAptForm] = useState({ date: "", time_slot: "", service: "", visit_type: "in-person", problem: "", notes: "", fee: "" });
  const [manualRxEnabled, setManualRxEnabled] = useState(false);
  const [manualRxForm, setManualRxForm] = useState({ diagnosis: "", rx_notes: "", bill_amount: "" });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState<{ appointment: Appointment; portal_credentials?: { phone: string; password: string } } | null>(null);
  const [manualError, setManualError] = useState("");

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/admin/login"; return; }

    const { data: doc } = await supabase
      .from("doctors")
      .select("id, name, specialty, email, phone, hospital, address, city, bio, hours, services, plan, features")
      .eq("user_id", user.id)
      .single();

    if (!doc) { window.location.href = "/admin/login"; return; }
    setDoctor(doc);
    setSettingsForm({ name: doc.name, specialty: doc.specialty, phone: doc.phone ?? "", hospital: doc.hospital ?? "", address: doc.address ?? "", bio: doc.bio ?? "" });

    // Load schedule
    const [schedRes, blockedRes] = await Promise.all([
      supabase.from("doctor_schedule").select("*").eq("doctor_id", doc.id),
      supabase.from("doctor_blocked_dates").select("date, reason").eq("doctor_id", doc.id),
    ]);
    if (schedRes.data && schedRes.data.length > 0) {
      const DAY_ORDER = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      setSchedule([...schedRes.data].sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)));
    } else {
      // Default schedule if none exists yet
      setSchedule([
        { day_of_week:"Sun", is_open:true,  start_time:"9:00 AM", end_time:"12:00 PM", slot_minutes:30, max_patients:20 },
        { day_of_week:"Mon", is_open:true,  start_time:"9:00 AM", end_time:"5:00 PM",  slot_minutes:30, max_patients:20 },
        { day_of_week:"Tue", is_open:true,  start_time:"9:00 AM", end_time:"5:00 PM",  slot_minutes:30, max_patients:20 },
        { day_of_week:"Wed", is_open:true,  start_time:"9:00 AM", end_time:"5:00 PM",  slot_minutes:30, max_patients:20 },
        { day_of_week:"Thu", is_open:true,  start_time:"9:00 AM", end_time:"5:00 PM",  slot_minutes:30, max_patients:20 },
        { day_of_week:"Fri", is_open:false, start_time:"—",       end_time:"—",        slot_minutes:30, max_patients:0  },
        { day_of_week:"Sat", is_open:true,  start_time:"9:00 AM", end_time:"2:00 PM",  slot_minutes:30, max_patients:20 },
      ]);
    }
    setBlockedDates((blockedRes.data as BlockedDate[]) ?? []);

    const { data: apts } = await supabase
      .from("appointments")
      .select("id, service, date, time_slot, visit_type, status, fee, problem_text, notes, serial_number, patients(id, name, phone)")
      .eq("doctor_id", doc.id)
      .order("date", { ascending: false });

    setAppointments((apts as unknown as Appointment[]) ?? []);

    const { data: dpRows } = await supabase
      .from("doctor_patients")
      .select("patient_id, first_visit, patients(id, name, phone, age, gender)")
      .eq("doctor_id", doc.id);

    if (dpRows) {
      const patMap: Record<string, Patient> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dpRows.forEach((row: any) => {
        const p = Array.isArray(row.patients) ? row.patients[0] : row.patients;
        if (!p) return;
        if (!patMap[p.id]) patMap[p.id] = { ...p, first_visit: row.first_visit, visits: 0 };
      });
      const counts: Record<string, number> = {};
      ((apts ?? []) as unknown as Appointment[]).forEach((a: Appointment) => {
        const pid = a.patients?.id;
        if (pid) counts[pid] = (counts[pid] ?? 0) + 1;
      });
      Object.keys(patMap).forEach(pid => { patMap[pid].visits = counts[pid] ?? 0; });
      setPatients(Object.values(patMap));
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingStatus(id);
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setUpdatingStatus(null);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const emptyRx = (): FullRx => ({ diagnosis: "", medicines: [], notes: "", fee: "", next_date: "", next_time: "" });

  const addMedicine = (aptId: string) => {
    setRxForm(prev => ({
      ...prev,
      [aptId]: { ...prev[aptId], medicines: [...(prev[aptId]?.medicines ?? []), { name: "", dosage: "", frequency: "", duration: "", instructions: "" }] },
    }));
  };

  const removeMedicine = (aptId: string, idx: number) => {
    setRxForm(prev => ({
      ...prev,
      [aptId]: { ...prev[aptId], medicines: prev[aptId].medicines.filter((_, i) => i !== idx) },
    }));
  };

  const updateMedicine = (aptId: string, idx: number, field: keyof Medicine, value: string) => {
    setRxForm(prev => {
      const meds = [...prev[aptId].medicines];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...prev, [aptId]: { ...prev[aptId], medicines: meds } };
    });
  };

  const saveRx = async (apt: Appointment) => {
    const rx = rxForm[apt.id];
    if (!rx?.diagnosis || !doctor || !apt.patients) return;
    setSavingRx(apt.id);
    await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id: apt.id, patient_id: apt.patients.id, doctor_id: doctor.id,
        diagnosis: rx.diagnosis, medicines: rx.medicines, notes: rx.notes,
        fee: rx.fee ? parseInt(rx.fee) : 0,
        next_appointment_date: rx.next_date || null,
        next_appointment_time: rx.next_time || null,
      }),
    });
    if (rx.fee) {
      await supabase.from("appointments").update({ fee: parseInt(rx.fee) }).eq("id", apt.id);
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, fee: parseInt(rx.fee) } : a));
    }
    setSavingRx(null);
    setUploadFor(null);
  };

  const saveEditApt = async (aptId: string) => {
    if (!editAptForm.date || !editAptForm.time_slot) return;
    setSavingEdit(aptId);
    await supabase.from("appointments").update({ date: editAptForm.date, time_slot: editAptForm.time_slot }).eq("id", aptId);
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, date: editAptForm.date, time_slot: editAptForm.time_slot } : a));
    setEditApt(null);
    setSavingEdit(null);
  };

  const saveSettings = async () => {
    if (!doctor) return;
    setSavingSettings(true);
    await supabase.from("doctors").update({
      name: settingsForm.name,
      specialty: settingsForm.specialty,
      phone: settingsForm.phone,
      hospital: settingsForm.hospital,
      address: settingsForm.address,
      bio: settingsForm.bio,
    }).eq("id", doctor.id);
    setDoctor(d => d ? { ...d, ...settingsForm } : d);
    setSavingSettings(false);
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule }),
    });
    setSavingSchedule(false);
  };

  const blockDate = async () => {
    if (!newBlockDate.date) return;
    setBlockingDate(true);
    await fetch("/api/schedule/blocked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlockDate),
    });
    setBlockedDates(prev => [...prev, newBlockDate]);
    setNewBlockDate({ date: "", reason: "" });
    setBlockingDate(false);
  };

  const unblockDate = async (date: string) => {
    await fetch(`/api/schedule/blocked?date=${date}`, { method: "DELETE" });
    setBlockedDates(prev => prev.filter(b => b.date !== date));
  };

  const updateScheduleDay = (day: string, field: keyof ScheduleDay, value: string | boolean | number) => {
    setSchedule(prev => prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s));
  };

  const searchPatient = async () => {
    const phone = patientSearch.replace(/\D/g, "");
    if (phone.length < 10) return;
    setSearchingPatient(true); setFoundPatient(null); setIsNewPatient(false);
    const res = await fetch(`/api/admin/patients?phone=${phone}`);
    const data = await res.json();
    if (data.patient) { setFoundPatient(data.patient); setIsNewPatient(false); }
    else { setIsNewPatient(true); setManualPatientForm(f => ({ ...f, phone })); }
    setSearchingPatient(false);
  };

  const openNewApt = () => {
    setShowNewApt(true); setManualStep(1);
    setPatientSearch(""); setFoundPatient(null); setIsNewPatient(false);
    setManualPatientForm({ name: "", phone: "", age: "", gender: "", portal_access: false, portal_password: "" });
    setManualAptForm({ date: "", time_slot: "", service: doctor?.specialty ?? doctor?.services?.[0] ?? "Consultation", visit_type: "in-person", problem: "", notes: "", fee: "" });
    setManualRxEnabled(false); setManualRxForm({ diagnosis: "", rx_notes: "", bill_amount: "" });
    setManualSuccess(null); setManualError("");
  };

  const submitManualApt = async () => {
    if (!manualAptForm.date || !manualAptForm.time_slot) {
      setManualError("Date and time slot are required"); return;
    }
    setManualSubmitting(true); setManualError("");
    const body: Record<string, unknown> = {
      date: manualAptForm.date,
      time_slot: manualAptForm.time_slot,
      service: manualAptForm.service,
      visit_type: manualAptForm.visit_type,
      problem_text: manualAptForm.problem,
      notes: manualAptForm.notes,
      fee: manualAptForm.fee ? parseInt(manualAptForm.fee) : 0,
    };
    if (foundPatient) {
      body.patient_id = foundPatient.id;
    } else if (isNewPatient) {
      body.patient_phone = manualPatientForm.phone;
      body.patient_name = manualPatientForm.name;
      body.patient_age = manualPatientForm.age || null;
      body.patient_gender = manualPatientForm.gender || null;
      body.portal_access = manualPatientForm.portal_access;
      body.portal_password = manualPatientForm.portal_access ? manualPatientForm.portal_password : undefined;
    }
    if (manualRxEnabled && manualRxForm.diagnosis) {
      body.prescription = {
        diagnosis: manualRxForm.diagnosis,
        rx_notes: manualRxForm.rx_notes,
        bill_amount: manualRxForm.bill_amount ? parseInt(manualRxForm.bill_amount) : 0,
      };
    }
    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setManualError(data.error ?? "Failed to create"); setManualSubmitting(false); return; }
    setManualSuccess(data);
    setManualSubmitting(false);
    loadData();
  };

  const printPrescription = (apt: Appointment, rx: FullRx) => {
    const w = window.open("", "_blank", "width=820,height=700");
    if (!w) return;
    const medRows = (rx.medicines ?? []).filter(m => m.name).map((m, i) =>
      `<tr><td style="padding:7px 10px;border-bottom:1px solid #f0f0f0;color:#666">${i+1}</td><td style="padding:7px 10px;border-bottom:1px solid #f0f0f0;font-weight:600">${m.name}</td><td style="padding:7px 10px;border-bottom:1px solid #f0f0f0">${m.dosage||"—"}</td><td style="padding:7px 10px;border-bottom:1px solid #f0f0f0">${m.frequency||"—"}</td><td style="padding:7px 10px;border-bottom:1px solid #f0f0f0">${m.duration||"—"}</td><td style="padding:7px 10px;border-bottom:1px solid #f0f0f0;color:#555">${m.instructions||"—"}</td></tr>`
    ).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Prescription — ${apt.patients?.name}</title>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:44px;max-width:720px;margin:auto;color:#1a1a1a;font-size:13px;}
      h1{font-size:20px;font-weight:700;margin:0;color:#111;}
      h2{font-size:12px;color:#777;font-weight:400;margin:3px 0 0;}
      .divider{border:none;border-top:2px solid #14967F;margin:16px 0;}
      .info-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f2f2f2;}
      .label{color:#999;}.value{font-weight:600;}
      .section-title{font-size:12px;font-weight:700;color:#14967F;text-transform:uppercase;letter-spacing:.05em;margin:18px 0 8px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#f0faf8;color:#14967F;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #14967F;}
      .notes-box{background:#f9f9f9;border-left:3px solid #14967F;padding:12px 14px;border-radius:4px;line-height:1.6;}
      .sig-box{margin-top:44px;display:flex;justify-content:flex-end;}
      .sig{width:180px;border-top:1px solid #ccc;padding-top:6px;font-size:11px;color:#888;text-align:center;}
      .footer{margin-top:24px;text-align:center;color:#bbb;font-size:10px;border-top:1px solid #f0f0f0;padding-top:10px;}
      @media print{.no-print{display:none!important}}
    </style></head><body>
    <button class="no-print" onclick="window.print()" style="background:#14967F;color:#fff;border:none;padding:9px 22px;border-radius:7px;cursor:pointer;margin-bottom:28px;font-size:13px;font-weight:600;">🖨️ Print Prescription</button>
    <h1>Dr. ${doctor?.name ?? ""}</h1>
    <h2>${doctor?.specialty ?? ""}${doctor?.hospital ? " · " + doctor.hospital : ""}${doctor?.phone ? " · " + doctor.phone : ""}</h2>
    <hr class="divider"/>
    <div class="info-row"><span class="label">Patient</span><span class="value">${apt.patients?.name ?? "—"}</span></div>
    <div class="info-row"><span class="label">Phone</span><span class="value">${apt.patients?.phone ?? "—"}</span></div>
    <div class="info-row"><span class="label">Visit Date</span><span class="value">${apt.date}</span></div>
    <div class="info-row"><span class="label">Service</span><span class="value">${apt.service}</span></div>
    <div class="info-row"><span class="label">Diagnosis</span><span class="value">${rx.diagnosis}</span></div>
    ${rx.fee ? `<div class="info-row"><span class="label">Consultation Fee</span><span class="value">৳${rx.fee}</span></div>` : ""}
    ${rx.next_date ? `<div class="info-row"><span class="label">Next Appointment</span><span class="value">${rx.next_date}${rx.next_time ? " at " + rx.next_time : ""}</span></div>` : ""}
    ${medRows ? `<div class="section-title">Rx — Medications</div>
    <table><thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
    <tbody>${medRows}</tbody></table>` : ""}
    ${rx.notes ? `<div class="section-title">Notes &amp; Instructions</div><div class="notes-box">${rx.notes}</div>` : ""}
    <div class="sig-box"><div class="sig">Doctor&apos;s Signature</div></div>
    <div class="footer">Generated by BookMyDoc · ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</div>
    </body></html>`);
    w.document.close();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === "scheduled").length,
    completed: appointments.filter(a => a.status === "checked-out").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayApts = appointments.filter(a => a.date === todayStr);
  const nextApt = appointments.find(a => a.status === "scheduled" && a.date >= todayStr);

  const SERIF = { fontFamily: "'Noto Serif', ui-serif, Georgia, serif", letterSpacing: "-0.02em" } as const;
  const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f3f1" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#14967F] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#797776]" style={MONO}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f6f3f1" }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 z-30 border-r" style={{ background: "#f6f3f1", borderColor: "rgba(36,36,36,0.1)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(36,36,36,0.1)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#242424" }}>Book<span style={{ color: "#14967F" }}>My</span>Doc</p>
              <p className="text-[10px] text-[#797776]">{doctor?.name}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
          <p className="text-[10px] text-[#797776] font-semibold uppercase tracking-wider px-3 mb-2" style={MONO}>Main Menu</p>
          <nav className="space-y-0.5">
            {NAV.map(item => (
              <button key={item.label} onClick={() => setActiveNav(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeNav === item.label ? "bg-[#242424] text-white" : "text-[#797776] hover:text-[#242424]"}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(36,36,36,0.1)" }}>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#797776] hover:text-[#242424] w-full">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="border-b px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20" style={{ background: "#f6f3f1", borderColor: "rgba(36,36,36,0.1)" }}>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-semibold text-[#242424]" style={SERIF}>{doctor?.name}</span>
            <span className="hidden sm:block text-xs text-[#797776]" style={MONO}>{doctor?.specialty}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-white font-bold text-sm">
              {doctor?.name?.[0]?.toUpperCase() ?? "D"}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex flex-wrap gap-1.5 px-4 py-3 border-b" style={{ background: "#f6f3f1", borderColor: "rgba(36,36,36,0.1)" }}>
          {NAV.map(item => (
            <button key={item.label} onClick={() => setActiveNav(item.label)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${activeNav === item.label ? "bg-[#242424] text-white" : "text-[#797776]"}`}
              style={activeNav !== item.label ? { background: "rgba(36,36,36,0.06)" } : {}}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">

          {/* ── DASHBOARD ── */}
          {activeNav === "Dashboard" && (
            <div className="space-y-5">

              {/* Next appointment hero */}
              {nextApt ? (
                <div className="bg-[#242424] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1" style={MONO}>Next Appointment</p>
                    <p className="text-xl font-bold text-white" style={SERIF}>{nextApt.patients?.name}</p>
                    <p className="text-white/60 text-sm mt-0.5">{nextApt.service}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-white/60 text-sm" style={MONO}>{formatDate(nextApt.date)} · {nextApt.time_slot}</span>
                      <span className="bg-white/20 text-white text-xs rounded-full px-2.5 py-0.5 font-medium capitalize">{nextApt.visit_type}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <button onClick={() => updateStatus(nextApt.id, "checked-in")} disabled={updatingStatus === nextApt.id}
                      className="flex-1 sm:flex-none text-center bg-[#14967F] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-[#0d7a66] transition-colors whitespace-nowrap disabled:opacity-50">
                      Check In
                    </button>
                    <button onClick={() => setActiveNav("Appointments")}
                      className="flex-1 sm:flex-none text-center border border-white/30 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap">
                      View All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#242424] rounded-2xl p-5 sm:p-6">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1" style={MONO}>Today</p>
                  <p className="text-xl font-bold text-white" style={SERIF}>No upcoming appointments</p>
                  <p className="text-white/50 text-sm mt-1">You&apos;re all caught up!</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total", value: String(stats.total), icon: "📅", color: "bg-blue-50", text: "All appointments" },
                  { label: "Scheduled", value: String(stats.scheduled), icon: "🗓️", color: "bg-[#e8f5f2]", text: "Upcoming" },
                  { label: "Completed", value: String(stats.completed), icon: "✅", color: "bg-green-50", text: "Checked out" },
                  { label: "Cancelled", value: String(stats.cancelled), icon: "❌", color: "bg-red-50", text: "Total" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border" style={{ borderColor: "rgba(36,36,36,0.07)" }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-bold text-[#242424]" style={MONO}>{s.value}</p>
                    <p className="text-xs font-medium text-[#242424] mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-[#797776] mt-0.5">{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Today's appointments */}
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#191919] text-sm">Today&apos;s Appointments</h3>
                    <button onClick={() => setActiveNav("Appointments")} className="text-xs text-[#14967F] hover:underline">View All</button>
                  </div>
                  {todayApts.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-[#A3A3A3] text-sm">No appointments today</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {todayApts.map(apt => (
                        <div key={apt.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[rgba(36,36,36,0.03)]">
                          <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {apt.patients?.name?.[0]?.toUpperCase() ?? "P"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#191919] text-sm truncate">{apt.patients?.name}</p>
                            <p className="text-xs text-[#A3A3A3]">{apt.service} · {apt.time_slot}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabel[apt.status] ?? apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient summary */}
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#191919] text-sm">My Patients</h3>
                    <button onClick={() => setActiveNav("Patients")} className="text-xs text-[#14967F] hover:underline">View All</button>
                  </div>
                  {patients.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-[#A3A3A3] text-sm">No patients yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {patients.slice(0, 5).map((p) => (
                        <div key={p.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[rgba(36,36,36,0.03)]">
                          <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {p.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#191919] text-sm truncate">{p.name}</p>
                            <p className="text-xs text-[#A3A3A3]">{p.phone}</p>
                          </div>
                          <span className="text-xs bg-[#e8f5f2] text-[#14967F] rounded-full px-2.5 py-1 font-medium whitespace-nowrap">{p.visits} visits</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Appointments Table */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#191919] text-sm">Recent Appointments</h3>
                  <button onClick={() => setActiveNav("Appointments")} className="text-xs text-[#14967F] hover:underline">View All</button>
                </div>
                {appointments.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[#A3A3A3] text-sm">No appointments yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-50">
                        {["Patient","Date & Time","Service","Status","Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {appointments.slice(0, 8).map(apt => (
                          <tr key={apt.id} className="hover:bg-[rgba(36,36,36,0.03)]">
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-bold text-[#14967F] bg-[#e8f5f2] rounded-lg px-2 py-1">#{String(apt.serial_number ?? 0).padStart(2,"0")}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {apt.patients?.name?.[0]?.toUpperCase() ?? "P"}
                                </div>
                                <div>
                                  <p className="font-medium text-[#191919] text-sm">{apt.patients?.name}</p>
                                  <p className="text-[10px] text-[#A3A3A3]">{apt.patients?.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-[#6b7280] whitespace-nowrap text-xs">{formatDate(apt.date)}<br/>{apt.time_slot}</td>
                            <td className="px-5 py-3.5 text-[#6b7280] text-xs">{apt.service}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                                {statusLabel[apt.status] ?? apt.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex gap-1 flex-wrap">
                                {apt.status === "scheduled" && (
                                  <button onClick={() => updateStatus(apt.id, "checked-in")} disabled={updatingStatus === apt.id}
                                    className="text-xs text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg px-2.5 py-1 font-medium disabled:opacity-50">
                                    Check In
                                  </button>
                                )}
                                {apt.status === "checked-in" && (
                                  <button onClick={() => updateStatus(apt.id, "checked-out")} disabled={updatingStatus === apt.id}
                                    className="text-xs text-green-600 bg-green-50 hover:bg-green-100 rounded-lg px-2.5 py-1 font-medium disabled:opacity-50">
                                    Check Out
                                  </button>
                                )}
                                {(apt.status === "scheduled" || apt.status === "checked-in") && (
                                  <button onClick={() => updateStatus(apt.id, "cancelled")} disabled={updatingStatus === apt.id}
                                    className="text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1 font-medium disabled:opacity-50">
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {activeNav === "Appointments" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>All Appointments</h2>
                <div className="text-xs text-[#A3A3A3]">{appointments.length} total</div>
              </div>
              {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl py-20 text-center">
                  <p className="text-3xl mb-3">📅</p>
                  <p className="text-[#191919] font-semibold">No appointments yet</p>
                  <p className="text-[#A3A3A3] text-sm mt-1">Patients will book appointments and they&apos;ll appear here</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100">
                        {["#","Patient","Date & Time","Service","Mode","Status","Problem","Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {appointments.map(apt => (
                          <Fragment key={apt.id}>
                          <tr className="hover:bg-[rgba(36,36,36,0.03)]">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-xs font-bold text-[#14967F] bg-[#e8f5f2] rounded-lg px-2 py-1">#{String(apt.serial_number ?? 0).padStart(2,"0")}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {apt.patients?.name?.[0]?.toUpperCase() ?? "P"}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#191919]">{apt.patients?.name}</p>
                                  <p className="text-xs text-[#A3A3A3]">{apt.patients?.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[#6b7280] whitespace-nowrap text-xs">{formatDate(apt.date)}<br/>{apt.time_slot}</td>
                            <td className="px-5 py-4 text-[#6b7280] text-xs max-w-[120px]">{apt.service}</td>
                            <td className="px-5 py-4 text-[#6b7280] text-xs capitalize">{apt.visit_type}</td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                                {statusLabel[apt.status] ?? apt.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-[#6b7280] max-w-[150px]">
                              <p className="truncate" title={apt.problem_text}>{apt.problem_text || "—"}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-1 flex-col">
                                {apt.status === "scheduled" && (
                                  <button onClick={() => updateStatus(apt.id, "checked-in")} disabled={updatingStatus === apt.id}
                                    className="text-xs text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg px-2 py-1 font-medium disabled:opacity-50 whitespace-nowrap">
                                    Check In
                                  </button>
                                )}
                                {apt.status === "checked-in" && (
                                  <button onClick={() => updateStatus(apt.id, "checked-out")} disabled={updatingStatus === apt.id}
                                    className="text-xs text-green-600 bg-green-50 hover:bg-green-100 rounded-lg px-2 py-1 font-medium disabled:opacity-50 whitespace-nowrap">
                                    Check Out
                                  </button>
                                )}
                                {(apt.status === "scheduled" || apt.status === "checked-in") && (
                                  <button onClick={() => updateStatus(apt.id, "cancelled")} disabled={updatingStatus === apt.id}
                                    className="text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-2 py-1 font-medium disabled:opacity-50 whitespace-nowrap">
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={() => { setEditApt(editApt === apt.id ? null : apt.id); setEditAptForm({ date: apt.date, time_slot: apt.time_slot }); }}
                                  className={`text-xs rounded-lg px-2 py-1 font-medium whitespace-nowrap ${editApt === apt.id ? "bg-blue-600 text-white" : "text-blue-600 bg-blue-50 hover:bg-blue-100"}`}>
                                  ✏️ Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                          {editApt === apt.id && (
                            <tr>
                              <td colSpan={8} className="px-5 pb-4 pt-0">
                                <div className="bg-[#eff3ff] rounded-xl p-4 flex items-center gap-3 flex-wrap border border-blue-100">
                                  <span className="text-xs font-semibold text-blue-700">Reschedule Appointment</span>
                                  <input type="date" value={editAptForm.date}
                                    onChange={e => setEditAptForm(f => ({...f, date: e.target.value}))}
                                    className="border border-blue-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"/>
                                  <input type="text" value={editAptForm.time_slot} placeholder="e.g. 10:00 AM"
                                    onChange={e => setEditAptForm(f => ({...f, time_slot: e.target.value}))}
                                    className="border border-blue-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-32 bg-white"/>
                                  <button onClick={() => saveEditApt(apt.id)} disabled={!editAptForm.date || !editAptForm.time_slot || savingEdit === apt.id}
                                    className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-blue-700">
                                    {savingEdit === apt.id ? "Saving..." : "Save"}
                                  </button>
                                  <button onClick={() => setEditApt(null)}
                                    className="text-xs text-[#6b7280] hover:text-[#191919]">Cancel</button>
                                </div>
                              </td>
                            </tr>
                          )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MY SCHEDULE ── */}
          {activeNav === "My Schedule" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>My Weekly Schedule</h2>

              {/* Weekly schedule editor */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-[#191919] text-sm">Working Hours</h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">Set your availability for each day. Patients will see available slots based on this schedule.</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {schedule.map(day => (
                    <div key={day.day_of_week} className="px-5 py-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Day name + toggle */}
                        <div className="flex items-center gap-4 flex-shrink-0 min-w-[100px]">
                          <button
                            onClick={() => updateScheduleDay(day.day_of_week, "is_open", !day.is_open)}
                            className={`relative flex-shrink-0 rounded-full transition-all duration-200 flex items-center ${day.is_open ? "bg-green-500" : "bg-gray-300"}`}
                            style={{ width: 58, height: 28 }}
                          >
                            <span className="absolute text-[10px] font-bold text-white uppercase tracking-wide"
                              style={{ left: day.is_open ? 8 : "auto", right: day.is_open ? "auto" : 8 }}>
                              {day.is_open ? "ON" : "OFF"}
                            </span>
                            <span className="absolute bg-white rounded-full shadow-md"
                              style={{ width: 22, height: 22, top: 3, left: day.is_open ? "auto" : 3, right: day.is_open ? 3 : "auto", transition: "all 0.2s ease" }} />
                          </button>
                          <span className="font-semibold text-sm text-[#191919] min-w-[36px]">{day.day_of_week}</span>
                        </div>

                        {day.is_open ? (
                          <div className="flex items-center gap-3 flex-wrap flex-1">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-[#A3A3A3]">From</label>
                              <input type="time"
                                value={(() => {
                                  const [t, p] = day.start_time.split(" ");
                                  const [h, m] = t.split(":").map(Number);
                                  let hours = h;
                                  if (p === "PM" && h !== 12) hours += 12;
                                  if (p === "AM" && h === 12) hours = 0;
                                  return `${String(hours).padStart(2,"0")}:${String(m||0).padStart(2,"0")}`;
                                })()}
                                onChange={e => {
                                  const [h, m] = e.target.value.split(":").map(Number);
                                  const period = h >= 12 ? "PM" : "AM";
                                  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                                  updateScheduleDay(day.day_of_week, "start_time", `${displayH}:${String(m).padStart(2,"0")} ${period}`);
                                }}
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#14967F]"/>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-[#A3A3A3]">To</label>
                              <input type="time"
                                value={(() => {
                                  const [t, p] = day.end_time.split(" ");
                                  const [h, m] = t.split(":").map(Number);
                                  let hours = h;
                                  if (p === "PM" && h !== 12) hours += 12;
                                  if (p === "AM" && h === 12) hours = 0;
                                  return `${String(hours).padStart(2,"0")}:${String(m||0).padStart(2,"0")}`;
                                })()}
                                onChange={e => {
                                  const [h, m] = e.target.value.split(":").map(Number);
                                  const period = h >= 12 ? "PM" : "AM";
                                  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                                  updateScheduleDay(day.day_of_week, "end_time", `${displayH}:${String(m).padStart(2,"0")} ${period}`);
                                }}
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#14967F]"/>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-[#A3A3A3]">Every</label>
                              <select value={day.slot_minutes}
                                onChange={e => updateScheduleDay(day.day_of_week, "slot_minutes", Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#14967F] bg-white">
                                <option value={15}>15 min</option>
                                <option value={20}>20 min</option>
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>1 hour</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-[#A3A3A3]">Max</label>
                              <input type="number" min={1} max={100} value={day.max_patients}
                                onChange={e => updateScheduleDay(day.day_of_week, "max_patients", Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-16 focus:outline-none focus:border-[#14967F]"/>
                              <span className="text-xs text-[#A3A3A3]">patients</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-red-400 font-medium">🔴 Closed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100">
                  <button onClick={saveSchedule} disabled={savingSchedule}
                    className="bg-[#14967F] text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-[#0d7a66] disabled:opacity-40">
                    {savingSchedule ? "Saving..." : "Save Schedule"}
                  </button>
                </div>
              </div>

              {/* Block specific dates */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-[#191919] text-sm">Block Specific Dates</h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">Block out holidays, leaves, or any date when you&apos;re unavailable.</p>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input type="date" value={newBlockDate.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setNewBlockDate(p => ({ ...p, date: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#14967F]"/>
                    <input type="text" placeholder="Reason (optional)" value={newBlockDate.reason}
                      onChange={e => setNewBlockDate(p => ({ ...p, reason: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#14967F] flex-1 min-w-32"/>
                    <button onClick={blockDate} disabled={!newBlockDate.date || blockingDate}
                      className="bg-red-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-40 whitespace-nowrap">
                      {blockingDate ? "Blocking..." : "Block Date"}
                    </button>
                  </div>

                  {blockedDates.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Blocked Dates</p>
                      {blockedDates.map(b => (
                        <div key={b.date} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2.5">
                          <div>
                            <span className="text-sm font-medium text-[#191919]">{formatDate(b.date)}</span>
                            {b.reason && <span className="text-xs text-[#A3A3A3] ml-2">— {b.reason}</span>}
                          </div>
                          <button onClick={() => unblockDate(b.date)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium">Unblock</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Today's slots preview */}
              <div className="bg-white rounded-2xl p-5">
                <h3 className="font-bold text-[#191919] text-sm mb-1">Today&apos;s Appointments</h3>
                <p className="text-xs text-[#A3A3A3] mb-4">Serial numbers assigned to each booking</p>
                {appointments.filter(a => a.date === new Date().toISOString().split("T")[0]).length === 0 ? (
                  <p className="text-sm text-[#A3A3A3]">No appointments today</p>
                ) : (
                  <div className="space-y-2">
                    {appointments
                      .filter(a => a.date === new Date().toISOString().split("T")[0])
                      .sort((a, b) => (a.serial_number ?? 0) - (b.serial_number ?? 0))
                      .map(apt => (
                        <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F4F5]">
                          <div className="w-10 h-10 rounded-xl bg-[#14967F] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">#{String(apt.serial_number ?? 0).padStart(2,"0")}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#191919] text-sm">{apt.patients?.name}</p>
                            <p className="text-xs text-[#A3A3A3]">{apt.time_slot} · {apt.service}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabel[apt.status] ?? apt.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PRESCRIPTIONS ── */}
          {activeNav === "Prescriptions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>Write Prescriptions</h2>
                <span className="text-xs text-[#797776]" style={MONO}>Checked-in &amp; completed appointments</span>
              </div>
              {appointments.filter(a => a.status === "checked-out" || a.status === "checked-in").length === 0 ? (
                <div className="bg-white rounded-2xl py-16 text-center">
                  <p className="text-3xl mb-3">💊</p>
                  <p className="text-[#191919] font-semibold">No appointments to prescribe</p>
                  <p className="text-[#A3A3A3] text-sm mt-1">Check in patients first</p>
                </div>
              ) : (
                appointments.filter(a => a.status === "checked-out" || a.status === "checked-in").map((apt) => {
                  const rx = rxForm[apt.id];
                  const isOpen = uploadFor === apt.id;
                  return (
                    <div key={apt.id} className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(36,36,36,0.07)" }}>
                      {/* Header */}
                      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {apt.patients?.name?.[0]?.toUpperCase() ?? "P"}
                          </div>
                          <div>
                            <p className="font-semibold text-[#191919] text-sm">{apt.patients?.name}</p>
                            <p className="text-xs text-[#A3A3A3]" style={MONO}>{formatDate(apt.date)} · {apt.service} · {apt.time_slot}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabel[apt.status] ?? apt.status}
                          </span>
                          {!isOpen && (
                            <button
                              onClick={() => { setUploadFor(apt.id); if (!rxForm[apt.id]) setRxForm(prev => ({ ...prev, [apt.id]: emptyRx() })); }}
                              className="flex items-center gap-1.5 bg-[#14967F] text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-[#0d7a66]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                              Write Rx
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Chief complaint context */}
                      {apt.problem_text && (
                        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">Chief Complaint</p>
                          <p className="text-sm text-[#191919]">{apt.problem_text}</p>
                        </div>
                      )}

                      {/* Full prescription form */}
                      {isOpen && (
                        <div className="p-5 space-y-5">
                          {/* Diagnosis */}
                          <div>
                            <label className="block text-xs font-semibold text-[#797776] uppercase tracking-wide mb-1.5" style={MONO}>
                              Diagnosis <span className="text-red-400">*</span>
                            </label>
                            <input type="text" placeholder="e.g. Knee Osteoarthritis, Hypertension..."
                              value={rx?.diagnosis ?? ""}
                              onChange={e => setRxForm(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], diagnosis: e.target.value } }))}
                              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                          </div>

                          {/* Medicine table */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-[#797776] uppercase tracking-wide" style={MONO}>Medications</label>
                              <button onClick={() => addMedicine(apt.id)}
                                className="flex items-center gap-1 text-xs text-[#14967F] font-semibold hover:text-[#0d7a66]">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                Add Medicine
                              </button>
                            </div>
                            {(rx?.medicines ?? []).length > 0 ? (
                              <div className="rounded-xl border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-[#f8f8f8]">
                                      <tr>
                                        {["Medicine Name","Dosage","Frequency","Duration","Instructions",""].map(h => (
                                          <th key={h} className="px-3 py-2 text-left font-semibold text-[#A3A3A3] whitespace-nowrap">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {(rx?.medicines ?? []).map((med, idx) => (
                                        <tr key={idx}>
                                          <td className="px-2 py-2">
                                            <input type="text" value={med.name} placeholder="e.g. Paracetamol"
                                              onChange={e => updateMedicine(apt.id, idx, "name", e.target.value)}
                                              className="w-32 bg-[#F4F4F5] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#14967F]"/>
                                          </td>
                                          <td className="px-2 py-2">
                                            <input type="text" value={med.dosage} placeholder="500mg"
                                              onChange={e => updateMedicine(apt.id, idx, "dosage", e.target.value)}
                                              className="w-20 bg-[#F4F4F5] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#14967F]"/>
                                          </td>
                                          <td className="px-2 py-2">
                                            <select value={med.frequency}
                                              onChange={e => updateMedicine(apt.id, idx, "frequency", e.target.value)}
                                              className="bg-[#F4F4F5] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#14967F]">
                                              <option value="">—</option>
                                              <option>Once daily</option>
                                              <option>Twice daily</option>
                                              <option>3× daily</option>
                                              <option>4× daily</option>
                                              <option>Every 8h</option>
                                              <option>Every 6h</option>
                                              <option>At bedtime</option>
                                              <option>As needed</option>
                                            </select>
                                          </td>
                                          <td className="px-2 py-2">
                                            <input type="text" value={med.duration} placeholder="7 days"
                                              onChange={e => updateMedicine(apt.id, idx, "duration", e.target.value)}
                                              className="w-20 bg-[#F4F4F5] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#14967F]"/>
                                          </td>
                                          <td className="px-2 py-2">
                                            <input type="text" value={med.instructions} placeholder="After meals"
                                              onChange={e => updateMedicine(apt.id, idx, "instructions", e.target.value)}
                                              className="w-28 bg-[#F4F4F5] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#14967F]"/>
                                          </td>
                                          <td className="px-2 py-2">
                                            <button onClick={() => removeMedicine(apt.id, idx)}
                                              className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 text-lg leading-none font-bold">×</button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-200 rounded-xl py-6 text-center">
                                <p className="text-xs text-[#A3A3A3]">No medicines added</p>
                                <button onClick={() => addMedicine(apt.id)}
                                  className="mt-2 text-xs text-[#14967F] font-semibold hover:underline">+ Add first medicine</button>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-xs font-semibold text-[#797776] uppercase tracking-wide mb-1.5" style={MONO}>Additional Notes</label>
                            <textarea placeholder="Lifestyle advice, dietary restrictions, follow-up instructions..." rows={3}
                              value={rx?.notes ?? ""}
                              onChange={e => setRxForm(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], notes: e.target.value } }))}
                              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
                          </div>

                          {/* Next appointment + Fee */}
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-[#797776] uppercase tracking-wide mb-1.5" style={MONO}>Next Appointment Date</label>
                              <input type="date" value={rx?.next_date ?? ""}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={e => setRxForm(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], next_date: e.target.value } }))}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#797776] uppercase tracking-wide mb-1.5" style={MONO}>Next Appointment Time</label>
                              <input type="text" value={rx?.next_time ?? ""} placeholder="e.g. 10:00 AM"
                                onChange={e => setRxForm(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], next_time: e.target.value } }))}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#797776] uppercase tracking-wide mb-1.5" style={MONO}>Consultation Fee (৳)</label>
                              <input type="number" value={rx?.fee ?? ""} placeholder="0"
                                onChange={e => setRxForm(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], fee: e.target.value } }))}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-1 border-t border-gray-100">
                            <button onClick={() => saveRx(apt)} disabled={savingRx === apt.id || !rx?.diagnosis}
                              className="flex-1 bg-[#14967F] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0d7a66] disabled:opacity-40">
                              {savingRx === apt.id ? "Saving..." : "Save Prescription"}
                            </button>
                            <button onClick={() => { if (rx?.diagnosis) printPrescription(apt, rx); }} disabled={!rx?.diagnosis}
                              className="px-4 border border-gray-200 rounded-xl text-sm text-[#6b7280] hover:border-[#14967F] hover:text-[#14967F] disabled:opacity-40 whitespace-nowrap">
                              🖨️ Print
                            </button>
                            <button onClick={() => setUploadFor(null)}
                              className="px-4 border border-gray-200 rounded-xl text-sm text-[#A3A3A3] hover:text-[#191919] whitespace-nowrap">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── PATIENTS ── */}
          {activeNav === "Patients" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>All Patients</h2>
                <div className="text-xs text-[#A3A3A3]">{patients.length} patients</div>
              </div>
              {patients.length === 0 ? (
                <div className="bg-white rounded-2xl py-20 text-center">
                  <p className="text-3xl mb-3">👥</p>
                  <p className="text-[#191919] font-semibold">No patients yet</p>
                  <p className="text-[#A3A3A3] text-sm mt-1">Patients appear here once they book an appointment</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100">
                        {["Patient","Phone","Gender","Age","Visits"].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {patients.map((p) => (
                          <tr key={p.id} className="hover:bg-[rgba(36,36,36,0.03)]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm">{p.name[0].toUpperCase()}</div>
                                <p className="font-semibold text-[#191919]">{p.name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[#6b7280]">{p.phone}</td>
                            <td className="px-5 py-4 text-[#6b7280] capitalize">{p.gender ?? "—"}</td>
                            <td className="px-5 py-4 text-[#6b7280]">{p.age ? `${p.age} yr` : "—"}</td>
                            <td className="px-5 py-4">
                              <span className="bg-[#e8f5f2] text-[#14967F] text-xs font-semibold rounded-full px-2.5 py-1">{p.visits} visits</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeNav === "Reports" && (() => {
            const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const now = new Date();

            // ── Daily: last 7 days ──
            const dailyCounts: { label: string; date: string; count: number; revenue: number }[] = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
              const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
              const da = appointments.filter(a => a.date === ds);
              dailyCounts.push({ label: i === 0 ? "Today" : d.toLocaleDateString("en-US",{weekday:"short"}), date: ds, count: da.length, revenue: da.reduce((s,a) => s+(a.fee??0),0) });
            }
            const maxDC = Math.max(...dailyCounts.map(m => m.count), 1);
            const maxDR = Math.max(...dailyCounts.map(m => m.revenue), 1);
            const todayData = dailyCounts[6];
            const yesterdayData = dailyCounts[5];

            // ── Weekly: last 4 weeks ──
            const weeklyCounts: { label: string; count: number; revenue: number }[] = [];
            for (let i = 3; i >= 0; i--) {
              const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
              const ws = new Date(base.getFullYear(), base.getMonth(), base.getDate() - base.getDay());
              const we = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);
              const wsStr = `${ws.getFullYear()}-${String(ws.getMonth()+1).padStart(2,"0")}-${String(ws.getDate()).padStart(2,"0")}`;
              const weStr = `${we.getFullYear()}-${String(we.getMonth()+1).padStart(2,"0")}-${String(we.getDate()).padStart(2,"0")}`;
              const wa = appointments.filter(a => a.date >= wsStr && a.date <= weStr);
              weeklyCounts.push({ label: i === 0 ? "This Wk" : i === 1 ? "Last Wk" : ws.toLocaleDateString("en-US",{month:"short",day:"numeric"}), count: wa.length, revenue: wa.reduce((s,a)=>s+(a.fee??0),0) });
            }
            const maxWC = Math.max(...weeklyCounts.map(m => m.count), 1);
            const maxWR = Math.max(...weeklyCounts.map(m => m.revenue), 1);
            const thisWeek = weeklyCounts[3];
            const lastWeek = weeklyCounts[2];

            // ── Monthly: last 6 months ──
            const monthlyCounts: { label: string; count: number; revenue: number }[] = [];
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
              const ma = appointments.filter(a => a.date?.startsWith(ym));
              monthlyCounts.push({ label: MONTHS_SHORT[d.getMonth()], count: ma.length, revenue: ma.reduce((s,a)=>s+(a.fee??0),0) });
            }
            const maxMC = Math.max(...monthlyCounts.map(m => m.count), 1);
            const maxMR = Math.max(...monthlyCounts.map(m => m.revenue), 1);
            const thisMonthYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
            const thisMonthApts = appointments.filter(a => a.date?.startsWith(thisMonthYM));
            const thisMonthRevenue = thisMonthApts.reduce((s,a)=>s+(a.fee??0),0);
            const prevMonthYM = (() => { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; })();
            const prevMonthApts = appointments.filter(a => a.date?.startsWith(prevMonthYM));
            const prevMonthRevenue = prevMonthApts.reduce((s,a)=>s+(a.fee??0),0);

            // ── Yearly: last 4 years ──
            const yearlyCounts: { label: string; count: number; revenue: number }[] = [];
            for (let i = 3; i >= 0; i--) {
              const yr = now.getFullYear() - i;
              const ya = appointments.filter(a => a.date?.startsWith(`${yr}`));
              yearlyCounts.push({ label: String(yr), count: ya.length, revenue: ya.reduce((s,a)=>s+(a.fee??0),0) });
            }
            const maxYC = Math.max(...yearlyCounts.map(m => m.count), 1);
            const maxYR = Math.max(...yearlyCounts.map(m => m.revenue), 1);
            const thisYear = yearlyCounts[3];
            const lastYear = yearlyCounts[2];

            // ── Common stats ──
            const totalRevenue = appointments.reduce((s,a)=>s+(a.fee??0),0);
            const completionRate = appointments.length > 0 ? Math.round((appointments.filter(a=>a.status==="checked-out").length/appointments.length)*100) : 0;
            const serviceCounts: Record<string, { count: number; revenue: number }> = {};
            appointments.forEach(a => { if (!a.service) return; if (!serviceCounts[a.service]) serviceCounts[a.service]={count:0,revenue:0}; serviceCounts[a.service].count++; serviceCounts[a.service].revenue+=a.fee??0; });
            const topServices = Object.entries(serviceCounts).sort((a,b)=>b[1].count-a[1].count).slice(0,5);
            const statusBreakdown = [
              { label:"Scheduled", count:appointments.filter(a=>a.status==="scheduled").length, color:"bg-blue-400" },
              { label:"Checked In", count:appointments.filter(a=>a.status==="checked-in").length, color:"bg-yellow-400" },
              { label:"Completed", count:appointments.filter(a=>a.status==="checked-out").length, color:"bg-[#14967F]" },
              { label:"Cancelled", count:appointments.filter(a=>a.status==="cancelled").length, color:"bg-red-400" },
            ];

            const diff = (cur: number, prev: number) => {
              if (prev === 0) return cur > 0 ? "+100%" : "—";
              const p = Math.round(((cur - prev) / prev) * 100);
              return `${p >= 0 ? "+" : ""}${p}%`;
            };
            const diffColor = (cur: number, prev: number) => cur >= prev ? "text-green-600" : "text-red-500";

            const BarChart = ({ data, colorBar, valuePrefix = "" }: { data: { label: string; count?: number; revenue?: number; value?: number }[]; colorBar: string; valuePrefix?: string }) => {
              const vals = data.map(d => d.value ?? d.count ?? 0);
              const mx = Math.max(...vals, 1);
              return (
                <div className="flex items-end gap-1.5 h-32">
                  {data.map((m, i) => {
                    const v = m.value ?? m.count ?? 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-[#191919] font-bold leading-tight text-center">{v ? `${valuePrefix}${v.toLocaleString()}` : ""}</span>
                        <div className={`w-full rounded-t-lg ${colorBar} transition-all`}
                          style={{ height: `${Math.round((v/mx)*100)}%`, minHeight: v ? "4px" : "0" }}/>
                        <span className="text-[9px] text-[#A3A3A3] text-center leading-tight">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            };

            const CompareCard = ({ label, cur, prev, unit = "" }: { label: string; cur: number; prev: number; unit?: string }) => (
              <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: "rgba(36,36,36,0.07)" }}>
                <p className="text-[10px] text-[#797776] font-semibold uppercase tracking-wide mb-1" style={MONO}>{label}</p>
                <p className="text-xl font-bold text-[#242424]" style={MONO}>{unit}{cur.toLocaleString()}</p>
                <p className={`text-xs font-semibold mt-0.5 ${diffColor(cur, prev)}`} style={MONO}>
                  {diff(cur, prev)} vs previous
                </p>
                <p className="text-[10px] text-[#797776] mt-0.5">prev: {unit}{prev.toLocaleString()}</p>
              </div>
            );

            const BillingTable = ({ apts, totalRev }: { apts: Appointment[]; totalRev: number }) => (
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#191919] text-sm">Visit Log</h3>
                  <span className="text-xs text-[#A3A3A3]">{apts.length} appointments · ৳{totalRev.toLocaleString()}</span>
                </div>
                {apts.length === 0 ? (
                  <div className="py-8 text-center"><p className="text-sm text-[#A3A3A3]">No data for this period</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#F4F4F5]">
                        <tr>
                          {["Patient","Date","Time","Service","Status","Fee"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[#A3A3A3] font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {apts.slice(0,30).map(apt => (
                          <tr key={apt.id} className="hover:bg-[rgba(36,36,36,0.03)]">
                            <td className="px-4 py-3 font-medium text-[#191919]">{apt.patients?.name ?? "Guest"}</td>
                            <td className="px-4 py-3 text-[#6b7280]">{formatDate(apt.date)}</td>
                            <td className="px-4 py-3 text-[#6b7280]">{apt.time_slot}</td>
                            <td className="px-4 py-3 text-[#6b7280]">{apt.service}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor[apt.status]??"bg-gray-100 text-gray-500"}`}>{statusLabel[apt.status]??apt.status}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-[#191919]">{apt.fee ? `৳${apt.fee}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#F4F4F5] border-t-2 border-gray-200">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 font-bold text-[#191919] text-right">Total</td>
                          <td className="px-4 py-3 font-bold text-[#14967F]">৳{totalRev.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );

            return (
              <div className="space-y-5">
                {/* Header + tab switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>Reports &amp; Analytics</h2>
                  <div className="flex gap-1 bg-white rounded-xl p-1 border" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
                    {(["daily","weekly","monthly","yearly"] as const).map(t => (
                      <button key={t} onClick={() => setReportTab(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${reportTab === t ? "bg-[#242424] text-white" : "text-[#797776] hover:text-[#242424]"}`}
                        style={MONO}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* KPI top strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Today", value: String(todayData.count), sub: `৳${todayData.revenue.toLocaleString()} revenue`, icon: "📅", color: "bg-blue-50" },
                    { label: "This Month", value: String(thisMonthApts.length), sub: `৳${thisMonthRevenue.toLocaleString()} revenue`, icon: "🗓️", color: "bg-[#e8f5f2]" },
                    { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, sub: `${appointments.length} appointments`, icon: "💰", color: "bg-amber-50" },
                    { label: "Completion Rate", value: `${completionRate}%`, sub: `${appointments.filter(a=>a.status==="checked-out").length} completed`, icon: "✅", color: "bg-green-50" },
                  ].map((k,i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border" style={{ borderColor: "rgba(36,36,36,0.07)" }}>
                      <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center text-lg mb-3`}>{k.icon}</div>
                      <p className="text-2xl font-bold text-[#242424]" style={MONO}>{k.value}</p>
                      <p className="text-xs font-medium text-[#242424] mt-0.5">{k.label}</p>
                      <p className="text-[10px] text-[#797776] mt-0.5">{k.sub}</p>
                    </div>
                  ))}
                </div>

                {/* ── DAILY TAB ── */}
                {reportTab === "daily" && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CompareCard label="Today's Visits" cur={todayData.count} prev={yesterdayData.count}/>
                      <CompareCard label="Today's Revenue" cur={todayData.revenue} prev={yesterdayData.revenue} unit="৳"/>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Visits — Last 7 Days</h3>
                        <BarChart data={dailyCounts.map(d => ({ label: d.label, value: d.count }))} colorBar="bg-[#14967F]"/>
                      </div>
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Revenue — Last 7 Days</h3>
                        <BarChart data={dailyCounts.map(d => ({ label: d.label, value: d.revenue }))} colorBar="bg-[#FAD069]" valuePrefix="৳"/>
                      </div>
                    </div>
                    {/* Today's visit list */}
                    <div className="bg-white rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-[#191919] text-sm">Today&apos;s Patients</h3>
                        <span className="text-xs text-[#A3A3A3]">{todayApts.length} patients · ৳{todayData.revenue.toLocaleString()}</span>
                      </div>
                      {todayApts.length === 0 ? (
                        <div className="py-10 text-center"><p className="text-sm text-[#A3A3A3]">No patients today</p></div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-[#F4F4F5]">
                              <tr>{["#","Patient","Time","Service","Status","Fee"].map(h => <th key={h} className="px-4 py-2.5 text-left text-[#A3A3A3] font-semibold">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {[...todayApts].sort((a,b) => (a.serial_number??0)-(b.serial_number??0)).map(apt => (
                                <tr key={apt.id} className="hover:bg-[rgba(36,36,36,0.03)]">
                                  <td className="px-4 py-3"><span className="text-[10px] font-bold text-[#14967F] bg-[#e8f5f2] rounded-lg px-1.5 py-0.5">#{String(apt.serial_number??0).padStart(2,"0")}</span></td>
                                  <td className="px-4 py-3 font-semibold text-[#191919]">{apt.patients?.name ?? "Guest"}</td>
                                  <td className="px-4 py-3 text-[#6b7280]">{apt.time_slot}</td>
                                  <td className="px-4 py-3 text-[#6b7280]">{apt.service}</td>
                                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor[apt.status]??"bg-gray-100 text-gray-500"}`}>{statusLabel[apt.status]??apt.status}</span></td>
                                  <td className="px-4 py-3 font-bold text-[#191919]">{apt.fee ? `৳${apt.fee}` : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-[#F4F4F5] border-t-2 border-gray-200">
                              <tr>
                                <td colSpan={5} className="px-4 py-3 font-bold text-[#191919] text-right">Today Total</td>
                                <td className="px-4 py-3 font-bold text-[#14967F]">৳{todayData.revenue.toLocaleString()}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── WEEKLY TAB ── */}
                {reportTab === "weekly" && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CompareCard label="This Week's Visits" cur={thisWeek.count} prev={lastWeek.count}/>
                      <CompareCard label="This Week's Revenue" cur={thisWeek.revenue} prev={lastWeek.revenue} unit="৳"/>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Visits — Last 4 Weeks</h3>
                        <BarChart data={weeklyCounts.map(d => ({ label: d.label, value: d.count }))} colorBar="bg-[#14967F]"/>
                      </div>
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Revenue — Last 4 Weeks</h3>
                        <BarChart data={weeklyCounts.map(d => ({ label: d.label, value: d.revenue }))} colorBar="bg-[#FAD069]" valuePrefix="৳"/>
                      </div>
                    </div>
                    {(() => {
                      const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                      const we = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 6);
                      const wsStr = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,"0")}-${String(base.getDate()).padStart(2,"0")}`;
                      const weStr = `${we.getFullYear()}-${String(we.getMonth()+1).padStart(2,"0")}-${String(we.getDate()).padStart(2,"0")}`;
                      const wkApts = appointments.filter(a => a.date >= wsStr && a.date <= weStr);
                      return <BillingTable apts={wkApts} totalRev={wkApts.reduce((s,a)=>s+(a.fee??0),0)}/>;
                    })()}
                  </div>
                )}

                {/* ── MONTHLY TAB ── */}
                {reportTab === "monthly" && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CompareCard label="This Month's Visits" cur={thisMonthApts.length} prev={prevMonthApts.length}/>
                      <CompareCard label="This Month's Revenue" cur={thisMonthRevenue} prev={prevMonthRevenue} unit="৳"/>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Visits — Last 6 Months</h3>
                        <BarChart data={monthlyCounts.map(d => ({ label: d.label, value: d.count }))} colorBar="bg-[#14967F]"/>
                      </div>
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Revenue — Last 6 Months</h3>
                        <BarChart data={monthlyCounts.map(d => ({ label: d.label, value: d.revenue }))} colorBar="bg-[#FAD069]" valuePrefix="৳"/>
                      </div>
                    </div>
                    <BillingTable apts={thisMonthApts} totalRev={thisMonthRevenue}/>
                  </div>
                )}

                {/* ── YEARLY TAB ── */}
                {reportTab === "yearly" && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CompareCard label="This Year's Visits" cur={thisYear.count} prev={lastYear.count}/>
                      <CompareCard label="This Year's Revenue" cur={thisYear.revenue} prev={lastYear.revenue} unit="৳"/>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Visits — Last 4 Years</h3>
                        <BarChart data={yearlyCounts.map(d => ({ label: d.label, value: d.count }))} colorBar="bg-[#14967F]"/>
                      </div>
                      <div className="bg-white rounded-2xl p-5">
                        <h3 className="font-bold text-[#191919] text-sm mb-4">Revenue — Last 4 Years</h3>
                        <BarChart data={yearlyCounts.map(d => ({ label: d.label, value: d.revenue }))} colorBar="bg-[#FAD069]" valuePrefix="৳"/>
                      </div>
                    </div>
                    <BillingTable apts={appointments.filter(a => a.date?.startsWith(`${now.getFullYear()}`))} totalRev={thisYear.revenue}/>
                  </div>
                )}

                {/* ── Always visible: Status breakdown + Top services ── */}
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl p-5">
                    <h3 className="font-bold text-[#191919] text-sm mb-4">Appointment Status Breakdown</h3>
                    <div className="space-y-3">
                      {statusBreakdown.map((s,i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-[#191919]">{s.label}</span>
                            <span className="text-[#A3A3A3]">{s.count} ({appointments.length>0 ? Math.round((s.count/appointments.length)*100) : 0}%)</span>
                          </div>
                          <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width:`${appointments.length>0?Math.round((s.count/appointments.length)*100):0}%` }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label:"Total Patients", value:String(patients.length) },
                        { label:"Avg Fee", value:appointments.length>0 ? `৳${Math.round(totalRevenue/appointments.length)}` : "—" },
                        { label:"Completion", value:`${completionRate}%` },
                      ].map((s,i) => (
                        <div key={i}><p className="text-lg font-bold text-[#191919]">{s.value}</p><p className="text-[10px] text-[#A3A3A3]">{s.label}</p></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5">
                    <h3 className="font-bold text-[#191919] text-sm mb-4">Top Services</h3>
                    {topServices.length === 0 ? (
                      <p className="text-sm text-[#A3A3A3] text-center py-6">No data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {topServices.map(([service, data], i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-xs font-bold text-[#A3A3A3] w-4">{i+1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#191919] truncate">{service}</p>
                                <div className="h-1.5 bg-[#F4F4F5] rounded-full mt-1 overflow-hidden">
                                  <div className="h-full bg-[#14967F] rounded-full" style={{ width:`${Math.round((data.count/(topServices[0]?.[1]?.count||1))*100)}%` }}/>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                              <p className="text-sm font-bold text-[#191919]">{data.count}</p>
                              <p className="text-[10px] text-[#A3A3A3]">৳{data.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── SETTINGS ── */}
          {activeNav === "Settings" && (
            <div className="max-w-2xl space-y-5">
              <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>Profile Settings</h2>

              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Full Name</label>
                    <input type="text" value={settingsForm.name} onChange={e => setSettingsForm(f => ({...f, name: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Specialty</label>
                    <input type="text" value={settingsForm.specialty} onChange={e => setSettingsForm(f => ({...f, specialty: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Phone</label>
                    <input type="tel" value={settingsForm.phone} onChange={e => setSettingsForm(f => ({...f, phone: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Hospital / Clinic</label>
                    <input type="text" value={settingsForm.hospital} onChange={e => setSettingsForm(f => ({...f, hospital: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Address</label>
                  <input type="text" value={settingsForm.address} onChange={e => setSettingsForm(f => ({...f, address: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Bio</label>
                  <textarea rows={4} value={settingsForm.bio} onChange={e => setSettingsForm(f => ({...f, bio: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Email</label>
                  <input type="email" value={doctor?.email ?? ""} disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-[#F4F4F5] text-[#A3A3A3] cursor-not-allowed"/>
                  <p className="text-xs text-[#A3A3A3] mt-1">Email cannot be changed</p>
                </div>
                <div className="pt-2 flex items-center gap-4">
                  <button onClick={saveSettings} disabled={savingSettings}
                    className="bg-[#14967F] text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-[#0d7a66] disabled:opacity-40">
                    {savingSettings ? "Saving..." : "Save Changes"}
                  </button>
                  <div className="text-xs text-[#A3A3A3]">Plan: <span className="font-semibold text-[#191919] capitalize">{doctor?.plan}</span></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5">
                <h3 className="font-semibold text-[#191919] text-sm mb-3">Session</h3>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium">Logout</button>
              </div>
            </div>
          )}

        </div>

        <div className="border-t px-6 py-4 text-center" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
          <p className="text-xs text-[#797776]" style={MONO}>BookMyDoc Admin Panel</p>
        </div>
      </div>

      {/* FAB — New Appointment */}
      <button onClick={openNewApt}
        className="fixed bottom-6 right-6 bg-[#14967F] text-white rounded-2xl px-5 py-3.5 shadow-xl shadow-[#14967F]/30 flex items-center gap-2 font-bold text-sm hover:bg-[#0d7a66] transition-colors z-40">
        <span className="text-lg">+</span> New Appointment
      </button>

      {/* ── MANUAL APPOINTMENT MODAL ── */}
      {showNewApt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !manualSubmitting && setShowNewApt(false)}/>
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-bold text-[#191919]">New Appointment</h2>
              <button onClick={() => setShowNewApt(false)} disabled={manualSubmitting}
                className="text-[#A3A3A3] hover:text-[#191919] text-xl leading-none">×</button>
            </div>

            {manualSuccess ? (
              /* ── SUCCESS ── */
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 className="font-bold text-[#191919] mb-1">Appointment Created!</h3>
                <p className="text-sm text-[#6b7280] mb-4">
                  Serial #{manualSuccess.appointment.serial_number} · {manualSuccess.appointment.date} · {manualSuccess.appointment.time_slot}
                </p>
                {manualSuccess.portal_credentials && (
                  <div className="bg-[#e8f5f2] rounded-2xl p-4 text-left mb-4">
                    <p className="text-xs font-bold text-[#14967F] mb-2">Patient Portal Credentials</p>
                    <p className="text-sm font-mono text-[#191919]">📱 {manualSuccess.portal_credentials.phone}</p>
                    <p className="text-sm font-mono text-[#191919]">🔑 {manualSuccess.portal_credentials.password}</p>
                    <p className="text-[10px] text-[#6b7280] mt-2">Share these credentials with the patient to access the portal.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setShowNewApt(false); }}
                    className="flex-1 border-2 border-gray-100 text-[#191919] rounded-xl py-3 text-sm font-medium">Close</button>
                  <button onClick={openNewApt}
                    className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold">+ Another</button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Step indicator */}
                <div className="flex items-center gap-1">
                  {["Patient", "Appointment", "Prescription"].map((label, i) => (
                    <div key={i} className="flex items-center gap-1 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${manualStep > i+1 ? "bg-[#14967F] text-white" : manualStep === i+1 ? "bg-[#14967F] text-white" : "bg-gray-100 text-[#A3A3A3]"}`}>
                        {manualStep > i+1 ? "✓" : i+1}
                      </div>
                      <span className={`text-[10px] font-medium hidden sm:block ${manualStep === i+1 ? "text-[#191919]" : "text-[#A3A3A3]"}`}>{label}</span>
                      {i < 2 && <div className={`flex-1 h-0.5 ${manualStep > i+1 ? "bg-[#14967F]" : "bg-gray-100"}`}/>}
                    </div>
                  ))}
                </div>

                {/* STEP 1 — Patient */}
                {manualStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Search by Phone</label>
                      <div className="flex gap-2">
                        <input type="tel" value={patientSearch}
                          onChange={e => { setPatientSearch(e.target.value); setFoundPatient(null); setIsNewPatient(false); }}
                          placeholder="01XXXXXXXXX"
                          className="flex-1 bg-[#F4F4F5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                        <button onClick={searchPatient} disabled={searchingPatient}
                          className="bg-[#14967F] text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                          {searchingPatient ? "..." : "Search"}
                        </button>
                      </div>
                    </div>

                    {foundPatient && (
                      <div className="bg-[#e8f5f2] rounded-2xl p-4">
                        <p className="text-xs text-[#14967F] font-bold mb-2">Patient Found ✓</p>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {[["Name", foundPatient.name], ["Phone", foundPatient.phone], ["Age", foundPatient.age ?? "—"], ["Gender", foundPatient.gender ?? "—"]].map(([l,v]) => (
                            <span key={l} className="contents">
                              <span className="text-[#A3A3A3]">{l}</span>
                              <span className="font-semibold text-[#191919]">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isNewPatient && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-[#FAD069] bg-[#191919] rounded-xl px-3 py-2">
                          <span>⚠️</span> No patient found. Fill details to create new patient.
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Full Name *</label>
                            <input type="text" value={manualPatientForm.name}
                              onChange={e => setManualPatientForm(f => ({...f, name: e.target.value}))}
                              className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Phone</label>
                            <input type="tel" value={manualPatientForm.phone} readOnly
                              className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm opacity-60"/>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Age</label>
                            <input type="number" value={manualPatientForm.age} min="1" max="120"
                              onChange={e => setManualPatientForm(f => ({...f, age: e.target.value}))}
                              className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6b7280] mb-1">Gender</label>
                            <select value={manualPatientForm.gender}
                              onChange={e => setManualPatientForm(f => ({...f, gender: e.target.value}))}
                              className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]">
                              <option value="">—</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        {/* Portal access toggle */}
                        <div className="bg-[#F4F4F5] rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[#191919]">Patient Portal Access</p>
                              <p className="text-xs text-[#A3A3A3]">Patient can log in to view appointments & prescriptions</p>
                            </div>
                            <button type="button" onClick={() => setManualPatientForm(f => ({...f, portal_access: !f.portal_access}))}
                              className={`w-12 h-6 rounded-full transition-colors relative ${manualPatientForm.portal_access ? "bg-[#14967F]" : "bg-gray-200"}`}>
                              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${manualPatientForm.portal_access ? "left-[26px]" : "left-0.5"}`}/>
                            </button>
                          </div>
                          {manualPatientForm.portal_access && (
                            <div>
                              <label className="block text-xs font-semibold text-[#6b7280] mb-1">Portal Password *</label>
                              <input type="text" value={manualPatientForm.portal_password} placeholder="min 6 characters"
                                onChange={e => setManualPatientForm(f => ({...f, portal_password: e.target.value}))}
                                className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                              <p className="text-[10px] text-[#A3A3A3] mt-1">Share this password with the patient. They can change it after login.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!foundPatient && !isNewPatient && (
                      <div className="bg-[#F4F4F5] rounded-2xl p-5 text-center">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm text-[#A3A3A3]">Search by phone to find or create a patient</p>
                      </div>
                    )}

                    <button
                      disabled={!foundPatient && !(isNewPatient && manualPatientForm.name)}
                      onClick={() => setManualStep(2)}
                      className="w-full bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-40">
                      Next: Appointment Details →
                    </button>
                  </div>
                )}

                {/* STEP 2 — Appointment Details */}
                {manualStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1">Date *</label>
                        <input type="date" value={manualAptForm.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={e => setManualAptForm(f => ({...f, date: e.target.value}))}
                          className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1">Time Slot *</label>
                        <input type="text" value={manualAptForm.time_slot} placeholder="e.g. 10:00 AM"
                          onChange={e => setManualAptForm(f => ({...f, time_slot: e.target.value}))}
                          className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[{value:"in-person",label:"🏥 In-Person"},{value:"online",label:"💻 Online"}].map(t => (
                        <button key={t.value} type="button" onClick={() => setManualAptForm(f => ({...f, visit_type: t.value}))}
                          className={`p-3 rounded-xl border-2 text-sm font-semibold transition-colors ${manualAptForm.visit_type === t.value ? "border-[#14967F] bg-[#e8f5f2] text-[#14967F]" : "border-gray-100 text-[#6b7280]"}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6b7280] mb-1">Problem / Chief Complaint</label>
                      <textarea rows={3} value={manualAptForm.problem}
                        onChange={e => setManualAptForm(f => ({...f, problem: e.target.value}))}
                        className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F] resize-none"/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1">Notes</label>
                        <input type="text" value={manualAptForm.notes} placeholder="Optional"
                          onChange={e => setManualAptForm(f => ({...f, notes: e.target.value}))}
                          className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6b7280] mb-1">Fee (৳)</label>
                        <input type="number" value={manualAptForm.fee} placeholder="0"
                          onChange={e => setManualAptForm(f => ({...f, fee: e.target.value}))}
                          className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setManualStep(1)} className="flex-1 border-2 border-gray-100 text-[#A3A3A3] rounded-xl py-3 text-sm font-medium">← Back</button>
                      <button onClick={() => setManualStep(3)}
                        disabled={!manualAptForm.date || !manualAptForm.time_slot}
                        className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-40">
                        Next: Prescription →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Prescription */}
                {manualStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#191919]">Write Prescription</p>
                        <p className="text-xs text-[#A3A3A3]">Optional — can be added later too</p>
                      </div>
                      <button type="button" onClick={() => setManualRxEnabled(e => !e)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${manualRxEnabled ? "bg-[#14967F]" : "bg-gray-200"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${manualRxEnabled ? "left-[26px]" : "left-0.5"}`}/>
                      </button>
                    </div>

                    {manualRxEnabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#6b7280] mb-1">Diagnosis *</label>
                          <input type="text" value={manualRxForm.diagnosis}
                            onChange={e => setManualRxForm(f => ({...f, diagnosis: e.target.value}))}
                            placeholder="Primary diagnosis"
                            className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b7280] mb-1">Prescription Notes</label>
                          <textarea rows={4} value={manualRxForm.rx_notes}
                            onChange={e => setManualRxForm(f => ({...f, rx_notes: e.target.value}))}
                            placeholder="Medications, dosage, instructions..."
                            className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F] resize-none"/>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6b7280] mb-1">Bill Amount (৳)</label>
                          <input type="number" value={manualRxForm.bill_amount}
                            onChange={e => setManualRxForm(f => ({...f, bill_amount: e.target.value}))}
                            placeholder="0"
                            className="w-full bg-[#F4F4F5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-[#F4F4F5] rounded-2xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-[#14967F] uppercase tracking-wider">Confirm Summary</p>
                      {[
                        ["Patient", foundPatient?.name ?? manualPatientForm.name],
                        ["Date", manualAptForm.date],
                        ["Time", manualAptForm.time_slot],
                        ["Visit Type", manualAptForm.visit_type],
                        ["Fee", manualAptForm.fee ? `৳${manualAptForm.fee}` : "—"],
                      ].map(([l,v]) => (
                        <div key={l} className="flex justify-between text-xs">
                          <span className="text-[#A3A3A3]">{l}</span>
                          <span className="font-semibold text-[#191919] capitalize">{v}</span>
                        </div>
                      ))}
                    </div>

                    {manualError && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{manualError}</div>}

                    <div className="flex gap-3">
                      <button onClick={() => setManualStep(2)} className="flex-1 border-2 border-gray-100 text-[#A3A3A3] rounded-xl py-3 text-sm font-medium">← Back</button>
                      <button onClick={submitManualApt} disabled={manualSubmitting || (manualRxEnabled && !manualRxForm.diagnosis)}
                        className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-40">
                        {manualSubmitting ? "Creating..." : "Create Appointment ✓"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
