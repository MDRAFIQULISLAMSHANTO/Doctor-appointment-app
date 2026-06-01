"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { NextAvailableSlots } from "@/components/NextAvailableBadge";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Appointments", icon: "📅" },
  { label: "Prescriptions", icon: "💊" },
  { label: "Submit Problem", icon: "📝" },
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
  time_slot: string;
  visit_type: string;
  status: string;
  fee?: number;
  doctors?: { name: string; specialty: string };
};

type Prescription = {
  id: string;
  diagnosis: string;
  notes?: string;
  file_url?: string;
  created_at: string;
  appointments?: { date: string; service: string };
  doctors?: { name: string; specialty: string };
};

type PatientProfile = {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
};

export default function PatientDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [problem, setProblem] = useState({ text: "", submitted: false });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsName, setSettingsName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/patient/login"; return; }

    const { data: pat } = await supabase
      .from("patients")
      .select("id, name, phone, age, gender")
      .eq("user_id", user.id)
      .single();

    if (pat) {
      setPatient(pat);
      setSettingsName(pat.name);

      const [aptsRes, rxRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, service, date, time_slot, visit_type, status, fee, doctors(name, specialty)")
          .eq("patient_id", pat.id)
          .order("date", { ascending: false }),
        supabase
          .from("prescriptions")
          .select("id, diagnosis, notes, file_url, created_at, appointments(date, service), doctors(name, specialty)")
          .eq("patient_id", pat.id)
          .order("created_at", { ascending: false }),
      ]);

      setAppointments((aptsRes.data as unknown as Appointment[]) ?? []);
      setPrescriptions((rxRes.data as unknown as Prescription[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/patient/login";
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

  const nextAppt = appointments.find(a => a.status === "scheduled" && a.date >= new Date().toISOString().split("T")[0]);
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === "scheduled").length,
    completed: appointments.filter(a => a.status === "checked-out").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const SERIF = { fontFamily: "'Noto Serif', ui-serif, Georgia, serif", letterSpacing: "-0.02em" } as const;
  const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f3f1" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#14967F] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#797776]" style={MONO}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f6f3f1" }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30 border-r" style={{ background: "#f6f3f1", borderColor: "rgba(36,36,36,0.1)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(36,36,36,0.1)" }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#242424" }}>Book<span style={{ color: "#14967F" }}>My</span>Doc</span>
          </Link>
        </div>
        <div className="flex-1 px-3 py-4">
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
        <header className="border-b px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ background: "#f6f3f1", borderColor: "rgba(36,36,36,0.1)" }}>
          <h1 className="font-bold text-[#242424]" style={SERIF}>Patient Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link href="/appointment"
              className="flex items-center gap-1.5 bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d7a66] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Book Appointment
            </Link>
            <div className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-white font-bold text-sm">
              {patient?.name?.[0]?.toUpperCase() ?? "P"}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b" style={{ background: "#f6f3f1", borderColor: "rgba(36,36,36,0.1)" }}>
          {NAV.map(item => (
            <button key={item.label} onClick={() => setActiveNav(item.label)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${activeNav === item.label ? "bg-[#242424] text-white" : "text-[#797776]"}`}
              style={activeNav !== item.label ? { background: "rgba(36,36,36,0.06)" } : {}}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">

          {/* ── DASHBOARD ─────────────────────────────────────────── */}
          {activeNav === "Dashboard" && (
            <div className="space-y-5">

              {/* Next appointment hero */}
              {nextAppt ? (
                <div className="bg-[#14967F] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-1">Next Appointment</p>
                    <p className="text-xl font-bold text-white">{nextAppt.service}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-white/80 text-sm">{formatDate(nextAppt.date)} · {nextAppt.time_slot}</span>
                      <span className="bg-white/20 text-white text-xs rounded-full px-2.5 py-0.5 font-medium capitalize">{nextAppt.visit_type}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <Link href="/appointment"
                      className="flex-1 sm:flex-none text-center bg-[#FAD069] text-[#191919] rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-[#e8bb45] transition-colors whitespace-nowrap">
                      + New Booking
                    </Link>
                    <button onClick={() => setActiveNav("Appointments")}
                      className="flex-1 sm:flex-none text-center border border-white/30 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap">
                      View All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#14967F] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-1">No Upcoming Appointments</p>
                    <p className="text-xl font-bold text-white">Schedule Your Visit</p>
                    <p className="text-white/70 text-sm mt-1">Book an appointment with your doctor today</p>
                  </div>
                  <Link href="/appointment"
                    className="bg-[#FAD069] text-[#191919] rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-[#e8bb45] transition-colors whitespace-nowrap text-center">
                    + Book Now
                  </Link>
                </div>
              )}

              {/* Next available slots */}
              <NextAvailableSlots />

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Visits", value: String(stats.total), icon: "📅", color: "bg-blue-50", text: "All time" },
                  { label: "Upcoming", value: String(stats.upcoming), icon: "🗓️", color: "bg-[#e8f5f2]", text: "Scheduled" },
                  { label: "Completed", value: String(stats.completed), icon: "✅", color: "bg-green-50", text: "Checked out" },
                  { label: "Cancelled", value: String(stats.cancelled), icon: "❌", color: "bg-red-50", text: "Total" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border" style={{ borderColor: "rgba(36,36,36,0.07)" }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${s.color}`}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold text-[#242424]" style={MONO}>{s.value}</p>
                    <p className="text-xs font-medium text-[#242424] mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-[#797776] mt-0.5">{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* My Doctor */}
                <div className="bg-white rounded-2xl p-5">
                  <h3 className="font-bold text-[#191919] text-sm mb-4">My Profile</h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F4F5]">
                    <div className="w-10 h-10 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold flex-shrink-0">
                      {patient?.name?.[0]?.toUpperCase() ?? "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#191919] truncate">{patient?.name}</p>
                      <p className="text-xs text-[#A3A3A3]">{patient?.phone}</p>
                    </div>
                    <span className="text-xs bg-[#e8f5f2] text-[#14967F] rounded-full px-2 py-1 font-medium whitespace-nowrap capitalize">{patient?.gender ?? "Patient"}</span>
                  </div>
                  {patient?.age && (
                    <div className="mt-3 px-3 py-2 rounded-xl bg-[#F4F4F5] flex items-center gap-2">
                      <span className="text-[#A3A3A3] text-xs">Age:</span>
                      <span className="text-sm font-semibold text-[#191919]">{patient.age} years</span>
                    </div>
                  )}
                </div>

                {/* Recent Prescriptions */}
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#191919] text-sm">Prescriptions</h3>
                    <button onClick={() => setActiveNav("Prescriptions")} className="text-xs text-[#14967F] hover:underline">View All</button>
                  </div>
                  {prescriptions.length === 0 ? (
                    <p className="text-xs text-[#A3A3A3] text-center py-6">No prescriptions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {prescriptions.slice(0, 3).map(rx => (
                        <div key={rx.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgba(36,36,36,0.03)] transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-[#e8f5f2] flex items-center justify-center text-sm flex-shrink-0">📄</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#191919] truncate">{rx.diagnosis}</p>
                            <p className="text-[10px] text-[#A3A3A3]">{formatDate(rx.created_at)}</p>
                          </div>
                          {rx.file_url ? (
                            <a href={rx.file_url} download target="_blank" rel="noopener noreferrer"
                              className="text-[#14967F] hover:text-[#0d7a66] p-1 flex-shrink-0" title="Download">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            </a>
                          ) : (
                            <span className="text-[10px] text-[#A3A3A3]">No file</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-5">
                  <h3 className="font-bold text-[#191919] text-sm mb-4">Recent Activity</h3>
                  {appointments.length === 0 ? (
                    <p className="text-xs text-[#A3A3A3] text-center py-6">No activity yet</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.slice(0, 4).map((a) => (
                        <div key={a.id} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#14967F] mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-medium text-[#191919] leading-snug">Appointment — {a.service}</p>
                            <p className="text-[10px] text-[#A3A3A3] mt-0.5">{formatDate(a.date)} · {a.time_slot}</p>
                          </div>
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
                    <Link href="/appointment" className="mt-3 inline-block text-[#14967F] text-sm font-medium hover:underline">Book your first appointment →</Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-50">
                          {["Service","Date & Time","Mode","Status"].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {appointments.slice(0, 5).map(apt => (
                          <tr key={apt.id} className="hover:bg-[rgba(36,36,36,0.03)] transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-[#191919] text-sm">{apt.service}</p>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-[#6b7280] whitespace-nowrap">
                              {formatDate(apt.date)}<br/><span className="text-xs">{apt.time_slot}</span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-[#6b7280] capitalize">{apt.visit_type}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                                {statusLabel[apt.status] ?? apt.status}
                              </span>
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

          {/* ── APPOINTMENTS ───────────────────────────────────────── */}
          {activeNav === "Appointments" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#242424] text-lg" style={SERIF}>My Appointments</h2>
                <Link href="/appointment" className="bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d7a66]">+ Book New</Link>
              </div>
              {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl py-16 text-center">
                  <p className="text-3xl mb-3">📅</p>
                  <p className="text-[#191919] font-semibold">No appointments yet</p>
                  <p className="text-[#A3A3A3] text-sm mt-1 mb-4">Book your first appointment with the doctor</p>
                  <Link href="/appointment" className="bg-[#14967F] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#0d7a66]">Book Now</Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100">
                        {["Service","Date & Time","Mode","Status","Action"].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {appointments.map(apt => (
                          <tr key={apt.id} className="hover:bg-[rgba(36,36,36,0.03)]">
                            <td className="px-5 py-4">
                              <p className="font-medium text-[#191919]">{apt.service}</p>
                            </td>
                            <td className="px-5 py-4 text-[#6b7280] whitespace-nowrap">
                              {formatDate(apt.date)}<br/><span className="text-xs">{apt.time_slot}</span>
                            </td>
                            <td className="px-5 py-4 text-[#6b7280] capitalize">{apt.visit_type}</td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>
                                {statusLabel[apt.status] ?? apt.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {apt.status === "scheduled" && (
                                <button onClick={() => handleCancelAppointment(apt.id)}
                                  className="text-xs text-red-400 hover:text-red-600 font-medium">Cancel</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 bg-[#e8f5f2] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#191919]">Need to see the doctor?</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Book your next appointment in 2 simple steps.</p>
                </div>
                <Link href="/appointment" className="bg-[#14967F] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#0d7a66] whitespace-nowrap">
                  Book Now →
                </Link>
              </div>
            </div>
          )}

          {/* ── PRESCRIPTIONS ──────────────────────────────────────── */}
          {activeNav === "Prescriptions" && (
            <div className="space-y-3">
              <h2 className="font-bold text-[#242424] text-lg mb-4" style={SERIF}>My Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-2xl py-16 text-center">
                  <p className="text-3xl mb-3">💊</p>
                  <p className="text-[#191919] font-semibold">No prescriptions yet</p>
                  <p className="text-[#A3A3A3] text-sm mt-1">Prescriptions will appear here after your visits</p>
                </div>
              ) : (
                prescriptions.map(rx => (
                  <div key={rx.id} className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#191919]">{rx.diagnosis}</p>
                        <p className="text-xs text-[#A3A3A3] mt-0.5">{formatDate(rx.created_at)}</p>
                        {rx.notes && <p className="text-xs text-[#6b7280] mt-1.5">{rx.notes}</p>}
                        {rx.appointments && (
                          <p className="text-xs text-[#A3A3A3] mt-1">Visit: {rx.appointments.service} · {formatDate(rx.appointments.date)}</p>
                        )}
                      </div>
                      {rx.file_url ? (
                        <a href={rx.file_url} download target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#e8f5f2] text-[#14967F] rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#d0ede8] transition-colors flex-shrink-0">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-xs text-[#A3A3A3] bg-[#F4F4F5] rounded-xl px-3 py-2 flex-shrink-0">No file attached</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── SUBMIT PROBLEM ─────────────────────────────────────── */}
          {activeNav === "Submit Problem" && (
            <div className="max-w-2xl">
              <h2 className="font-bold text-[#242424] text-lg mb-4" style={SERIF}>Submit Health Problem</h2>
              {problem.submitted ? (
                <div className="bg-white rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#191919] mb-2">Problem Submitted!</h3>
                  <p className="text-[#6b7280] text-sm mb-6">The doctor will review and respond within 24 hours.</p>
                  <button onClick={() => setProblem({ text: "", submitted: false })}
                    className="bg-[#14967F] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#0d7a66]">
                    Submit Another
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Describe Your Problem <span className="text-red-400">*</span></label>
                    <textarea placeholder="Describe symptoms — location, duration, severity, and what triggers it..." rows={6}
                      value={problem.text} onChange={e => setProblem({...problem, text: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Attach Reports <span className="text-[#A3A3A3] font-normal">(optional)</span></label>
                    <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#14967F] hover:bg-[#e8f5f2] transition-colors">
                      <div className="text-2xl mb-1">📎</div>
                      <p className="text-sm text-[#A3A3A3]">Upload test reports, X-rays, MRI scans (PDF, JPG, PNG)</p>
                      <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png"/>
                    </label>
                  </div>
                  <button
                    onClick={() => { if (problem.text) setProblem({...problem, submitted: true}); }}
                    disabled={!problem.text}
                    className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#0d7a66] text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Submit Problem
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ───────────────────────────────────────────── */}
          {activeNav === "Settings" && (
            <div className="max-w-lg">
              <h2 className="font-bold text-[#242424] text-lg mb-4" style={SERIF}>Account Settings</h2>
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Full Name</label>
                  <input type="text" value={settingsName}
                    onChange={e => setSettingsName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Mobile Number</label>
                  <input type="tel" value={patient?.phone ?? ""} disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-[#F4F4F5] text-[#A3A3A3] cursor-not-allowed"/>
                  <p className="text-xs text-[#A3A3A3] mt-1">Phone number cannot be changed</p>
                </div>
                {patient?.age && (
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Age</label>
                    <input type="number" defaultValue={patient.age} disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-[#F4F4F5] text-[#A3A3A3] cursor-not-allowed"/>
                  </div>
                )}
                <div className="pt-2">
                  <button onClick={handleSaveName} disabled={savingName || settingsName === patient?.name}
                    className="bg-[#14967F] text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-[#0d7a66] transition-colors disabled:opacity-40">
                    {savingName ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-2xl p-5">
                <h3 className="font-semibold text-[#191919] text-sm mb-3">Session</h3>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium">Logout</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
