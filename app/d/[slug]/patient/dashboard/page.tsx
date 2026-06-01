"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Appointments", icon: "📅" },
  { label: "Prescriptions", icon: "💊" },
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
  id: string; service: string; date: string; time_slot: string;
  visit_type: string; status: string; serial_number?: number;
};
type Prescription = {
  id: string; diagnosis: string; notes?: string; file_url?: string; created_at: string;
  appointments?: { date: string; service: string };
};
type PatientProfile = { id: string; name: string; phone: string; age?: number; gender?: string };
type Doctor = { id: string; name: string; specialty: string; hospital?: string; slug: string };

export default function PatientDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsName, setSettingsName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/d/${slug}/patient/login`; return; }

    const [patRes, docRes] = await Promise.all([
      supabase.from("patients").select("id, name, phone, age, gender").eq("user_id", user.id).single(),
      supabase.from("doctors").select("id, name, specialty, hospital, slug").eq("slug", slug).single(),
    ]);

    if (!patRes.data) { window.location.href = `/d/${slug}/patient/login`; return; }
    setPatient(patRes.data);
    setSettingsName(patRes.data.name);
    if (docRes.data) setDoctor(docRes.data as Doctor);

    if (patRes.data && docRes.data) {
      const [aptsRes, rxRes] = await Promise.all([
        supabase.from("appointments")
          .select("id, service, date, time_slot, visit_type, status, serial_number")
          .eq("patient_id", patRes.data.id)
          .eq("doctor_id", docRes.data.id)
          .order("date", { ascending: false }),
        supabase.from("prescriptions")
          .select("id, diagnosis, notes, created_at, appointments(date, service)")
          .eq("patient_id", patRes.data.id)
          .eq("doctor_id", docRes.data.id)
          .order("created_at", { ascending: false }),
      ]);
      setAppointments((aptsRes.data as unknown as Appointment[]) ?? []);
      setPrescriptions((rxRes.data as unknown as Prescription[]) ?? []);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = `/d/${slug}/patient/login`;
  };

  const handleSaveName = async () => {
    if (!patient || !settingsName.trim()) return;
    setSavingName(true);
    await supabase.from("patients").update({ name: settingsName }).eq("id", patient.id);
    setPatient(p => p ? { ...p, name: settingsName } : p);
    setSavingName(false);
  };

  const handleCancelAppointment = async (id: string) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const nextAppt = appointments.find(a => a.status === "scheduled" && a.date >= todayStr);
  const stats = {
    upcoming: appointments.filter(a => a.status === "scheduled").length,
    completed: appointments.filter(a => a.status === "checked-out").length,
    total: appointments.length,
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#14967F] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href={`/d/${slug}`} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <p className="font-bold text-[#191919] text-xs">{doctor?.name ?? "DocApp"}</p>
              <p className="text-[10px] text-[#A3A3A3]">{doctor?.specialty ?? ""}</p>
            </div>
          </Link>
        </div>
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {patient?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#191919] text-xs truncate">{patient?.name}</p>
              <p className="text-[10px] text-[#A3A3A3]">{patient?.phone}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 py-4">
          <nav className="space-y-0.5">
            {NAV.map(item => (
              <button key={item.label} onClick={() => setActiveNav(item.label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${activeNav === item.label ? "bg-[#e8f5f2] text-[#14967F]" : "text-[#6b7280] hover:text-[#191919] hover:bg-[#F4F4F5]"}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link href={`/d/${slug}/book`}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#14967F] text-white hover:bg-[#0d7a66] transition-colors">
            <span>+</span> Book Appointment
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#A3A3A3] hover:text-[#191919] hover:bg-[#F4F4F5]">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-56">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <Link href={`/d/${slug}`} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#191919] text-sm">{doctor?.name}</span>
          </Link>
          <button onClick={handleLogout} className="text-xs text-[#A3A3A3]">Logout</button>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-gray-100">
          {NAV.map(item => (
            <button key={item.label} onClick={() => setActiveNav(item.label)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0
                ${activeNav === item.label ? "bg-[#14967F] text-white" : "bg-[#F4F4F5] text-[#6b7280]"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">

          {/* ── DASHBOARD ── */}
          {activeNav === "Dashboard" && (
            <div className="space-y-5">
              {/* Next appointment */}
              {nextAppt ? (
                <div className="bg-[#191919] rounded-2xl p-5 text-white">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Next Appointment</p>
                  <p className="text-xl font-bold">{nextAppt.service}</p>
                  <p className="text-white/60 text-sm mt-1">{formatDate(nextAppt.date)} · {nextAppt.time_slot}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-white/10 text-white/80 text-xs rounded-full px-3 py-1 capitalize">{nextAppt.visit_type}</span>
                    {nextAppt.serial_number && (
                      <span className="bg-[#14967F] text-white text-xs rounded-full px-3 py-1 font-bold">
                        #{String(nextAppt.serial_number).padStart(2,"0")}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#14967F] rounded-2xl p-5 text-white">
                  <p className="font-bold text-lg mb-1">Book an Appointment</p>
                  <p className="text-white/70 text-sm mb-4">with {doctor?.name}</p>
                  <Link href={`/d/${slug}/book`} className="inline-block bg-white text-[#14967F] rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-gray-50">
                    Book Now →
                  </Link>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Upcoming", value: stats.upcoming, color: "bg-blue-50 text-blue-600" },
                  { label: "Completed", value: stats.completed, color: "bg-green-50 text-green-600" },
                  { label: "Total", value: stats.total, color: "bg-[#e8f5f2] text-[#14967F]" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
                    <p className="text-xs text-[#A3A3A3] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent appointments */}
              {appointments.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#191919] text-sm">Recent Appointments</h3>
                    <button onClick={() => setActiveNav("Appointments")} className="text-xs text-[#14967F] hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {appointments.slice(0,4).map(a => (
                      <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#191919] text-sm">{a.service}</p>
                          <p className="text-xs text-[#A3A3A3]">{formatDate(a.date)} · {a.time_slot}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[a.status] || "bg-gray-100 text-gray-500"}`}>
                          {statusLabel[a.status] ?? a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {activeNav === "Appointments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#191919]">My Appointments</h2>
                <Link href={`/d/${slug}/book`} className="bg-[#14967F] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#0d7a66]">
                  + Book New
                </Link>
              </div>
              {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center">
                  <p className="text-[#A3A3A3] text-sm mb-4">No appointments yet</p>
                  <Link href={`/d/${slug}/book`} className="bg-[#14967F] text-white rounded-xl px-5 py-2.5 text-sm font-semibold">
                    Book First Appointment
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {appointments.map(a => (
                      <div key={a.id} className="px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#e8f5f2] flex items-center justify-center text-[#14967F] font-bold text-sm flex-shrink-0">
                          {a.serial_number ? `#${String(a.serial_number).padStart(2,"0")}` : "📅"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#191919] text-sm">{a.service}</p>
                          <p className="text-xs text-[#A3A3A3]">{formatDate(a.date)} · {a.time_slot} · {a.visit_type}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[a.status] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabel[a.status] ?? a.status}
                          </span>
                          {a.status === "scheduled" && (
                            <button onClick={() => handleCancelAppointment(a.id)}
                              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRESCRIPTIONS ── */}
          {activeNav === "Prescriptions" && (
            <div className="space-y-4">
              <h2 className="font-bold text-[#191919]">Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center">
                  <p className="text-[#A3A3A3] text-sm">No prescriptions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map(rx => {
                    const apt = Array.isArray(rx.appointments) ? rx.appointments[0] : rx.appointments;
                    return (
                      <div key={rx.id} className="bg-white rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#191919]">{rx.diagnosis}</p>
                            {apt && <p className="text-xs text-[#A3A3A3] mt-1">{formatDate(apt.date)} · {apt.service}</p>}
                            {rx.notes && <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">{rx.notes}</p>}
                          </div>
                          <p className="text-xs text-[#A3A3A3] whitespace-nowrap">{formatDate(rx.created_at)}</p>
                        </div>
                        {rx.file_url && (
                          <a href={rx.file_url} target="_blank" rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#14967F] font-semibold hover:underline">
                            📄 Download Prescription
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeNav === "Settings" && (
            <div className="max-w-lg space-y-5">
              <h2 className="font-bold text-[#191919]">Settings</h2>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-semibold text-[#191919] text-sm mb-4">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Full Name</label>
                    <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)}
                      className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b7280] mb-1.5">Mobile</label>
                    <input type="text" value={patient?.phone ?? ""} disabled
                      className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed"/>
                  </div>
                  <button onClick={handleSaveName} disabled={savingName || !settingsName.trim()}
                    className="bg-[#14967F] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#0d7a66] disabled:opacity-50">
                    {savingName ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-semibold text-[#191919] text-sm mb-3">Doctor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#14967F] flex items-center justify-center text-white font-bold text-sm">
                    {doctor?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#191919] text-sm">{doctor?.name}</p>
                    <p className="text-xs text-[#A3A3A3]">{doctor?.specialty}{doctor?.hospital ? ` · ${doctor.hospital}` : ""}</p>
                  </div>
                </div>
                <Link href={`/d/${slug}`} className="mt-3 inline-block text-xs text-[#14967F] hover:underline">
                  View Doctor Portal →
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
