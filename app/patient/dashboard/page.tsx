"use client";
import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Appointments", icon: "📅" },
  { label: "Prescriptions", icon: "💊" },
  { label: "Submit Problem", icon: "📝" },
  { label: "Invoice", icon: "💳" },
  { label: "Settings", icon: "⚙️" },
];

const APPOINTMENTS = [
  { id: "AP455698", service: "Arthritis Treatment", date: "27 May 2025", time: "09:30 AM", mode: "Online", status: "Checked Out", fee: "৳ 500" },
  { id: "AP455699", service: "Pain Management", date: "26 May 2025", time: "10:15 AM", mode: "In-Person", status: "Checked In", fee: "৳ 500" },
  { id: "AP455700", service: "Physical Medicine", date: "25 May 2025", time: "02:40 PM", mode: "In-Person", status: "Cancelled", fee: "৳ 0" },
  { id: "AP455701", service: "General Consultation", date: "24 May 2025", time: "11:30 AM", mode: "Online", status: "Schedule", fee: "৳ 500" },
];

const PRESCRIPTIONS = [
  { id: "RX001", date: "26 May 2025", diagnosis: "Knee Osteoarthritis", locked: false },
  { id: "RX002", date: "25 May 2025", diagnosis: "Cervical Spondylosis", locked: true },
  { id: "RX003", date: "24 May 2025", diagnosis: "Lower Back Pain", locked: false },
];

const TRANSACTIONS = [
  { date: "26 May 2025", time: "10:45 AM", desc: "Prescription #RX001", amount: "৳ 500", status: "Success" },
  { date: "20 Apr 2025", time: "3:22 PM", desc: "Consultation Fee", amount: "৳ 500", status: "Success" },
  { date: "15 Mar 2025", time: "11:08 AM", desc: "Prescription #RX000", amount: "৳ 500", status: "Failed" },
];

const statusColor: Record<string, string> = {
  "Checked Out": "bg-green-50 text-green-600",
  "Checked In": "bg-yellow-50 text-yellow-600",
  "Cancelled": "bg-red-50 text-red-500",
  "Schedule": "bg-blue-50 text-blue-600",
};

const MiniBar = ({ values }: { values: number[] }) => (
  <div className="flex items-end gap-0.5 h-8">
    {values.map((v, i) => (
      <div key={i} className="w-2 rounded-sm" style={{ height: `${v}%`, background: i === values.length - 1 ? "#14967F" : "#e8f5f2" }}></div>
    ))}
  </div>
);

export default function PatientDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [recording, setRecording] = useState(false);
  const [problem, setProblem] = useState({ text: "", submitted: false });

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#191919] text-sm">Dr. Jahangir</span>
          </Link>
        </div>
        <div className="flex-1 px-3 py-4">
          <p className="text-[10px] text-[#A3A3A3] font-semibold uppercase tracking-wider px-3 mb-2">Main Menu</p>
          <nav className="space-y-0.5">
            {NAV.map(item => (
              <button key={item.label} onClick={() => setActiveNav(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeNav === item.label ? "bg-[#e8f5f2] text-[#14967F]" : "text-[#6b7280] hover:bg-gray-50 hover:text-[#191919]"}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 py-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#A3A3A3] hover:text-[#191919]">
            <span>🚪</span> Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-[#191919]">Patient Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/appointment" className="hidden sm:flex items-center gap-1.5 bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d7a66]">
              + New Appointment
            </Link>
            <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm">R</div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-gray-100">
          {NAV.map(item => (
            <button key={item.label} onClick={() => setActiveNav(item.label)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${activeNav === item.label ? "bg-[#14967F] text-white" : "bg-[#F4F4F5] text-[#6b7280]"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">

          {/* DASHBOARD */}
          {activeNav === "Dashboard" && (
            <div className="space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Appointments", value: "24", sub: "+95% in last 7 Days", icon: "📅", trend: "+", bars: [30,45,60,40,70,55,80] },
                  { label: "Online Consultations", value: "36", sub: "-15% in last 7 Days", icon: "💻", trend: "-", bars: [60,50,40,55,45,35,30] },
                  { label: "Blood Pressure", value: "89 g/dl", sub: "+95%", icon: "🫀", trend: "+", bars: [] },
                  { label: "Heart Rate", value: "87 bpm", sub: "+95%", icon: "❤️", trend: "+", bars: [] },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${i === 0 ? "bg-blue-50" : i === 1 ? "bg-orange-50" : i === 2 ? "bg-purple-50" : "bg-red-50"}`}>
                        {s.icon}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.trend === "+" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {s.trend === "+" ? "+95%" : "-15%"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#191919]">{s.value}</p>
                    <p className="text-xs text-[#A3A3A3] mt-0.5">{s.label}</p>
                    {s.bars.length > 0 && <div className="mt-2"><MiniBar values={s.bars.map(v => v)} /></div>}
                    {s.bars.length === 0 && (
                      <svg viewBox="0 0 100 24" className="mt-2 w-full" style={{height: "24px"}}>
                        <polyline points="0,18 15,12 30,15 45,8 60,11 75,6 90,9 100,4" fill="none" stroke="#14967F" strokeWidth="2"/>
                      </svg>
                    )}
                    <p className="text-[10px] text-[#A3A3A3] mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* My Doctor */}
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#191919] text-sm">My Doctor</h3>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F4F5] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold flex-shrink-0">J</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#191919] truncate">Dr. Jahangir Chowdhury</p>
                      <p className="text-xs text-[#A3A3A3]">Physical Medicine</p>
                    </div>
                    <span className="text-xs bg-[#e8f5f2] text-[#14967F] rounded-full px-2 py-1 font-medium whitespace-nowrap">3 Bookings</span>
                  </div>

                  {/* Vitals */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">Vitals</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Weight", value: "68 Kg" },
                        { label: "Height", value: "170 Cm" },
                        { label: "BMI", value: "23.5" },
                        { label: "Pulse", value: "78%" },
                        { label: "SPO2", value: "98%" },
                        { label: "Temp", value: "98.6°F" },
                      ].map((v, i) => (
                        <div key={i} className="bg-[#F4F4F5] rounded-xl p-2 text-center">
                          <p className="text-[10px] text-[#A3A3A3]">{v.label}</p>
                          <p className="text-xs font-bold text-[#191919] mt-0.5">{v.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#191919] text-sm">Prescriptions</h3>
                    <button onClick={() => setActiveNav("Prescriptions")} className="text-xs text-[#14967F] hover:underline">View All</button>
                  </div>
                  <div className="space-y-2">
                    {PRESCRIPTIONS.map(rx => (
                      <div key={rx.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F4F5] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-[#e8f5f2] flex items-center justify-center text-sm flex-shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#191919] truncate">{rx.diagnosis}</p>
                          <p className="text-[10px] text-[#A3A3A3]">{rx.date}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button className="text-[#14967F] hover:text-[#0d7a66] p-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          {!rx.locked ? (
                            <a href="#" className="text-[#14967F] hover:text-[#0d7a66] p-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            </a>
                          ) : (
                            <button onClick={() => setActiveNav("Invoice")} className="text-[#FAD069] p-1" title="Payment required">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-5">
                  <h3 className="font-bold text-[#191919] text-sm mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Appointment with Physical Medicine", time: "27 May 2025, 9:30 AM" },
                      { label: "Prescription Download — RX001", time: "26 May 2025, 3:00 PM" },
                      { label: "Problem Submitted — Back Pain", time: "25 May 2025, 11:00 AM" },
                      { label: "Payment ৳500 — RX001", time: "24 May 2025, 11:00 AM" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#14967F] mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="text-xs font-medium text-[#191919] leading-snug">{a.label}</p>
                          <p className="text-[10px] text-[#A3A3A3] mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Appointments Table */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#191919] text-sm">Recent Appointments</h3>
                  <button onClick={() => setActiveNav("Appointments")} className="text-xs text-[#14967F] hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Service</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Date & Time</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Mode</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {APPOINTMENTS.map(apt => (
                        <tr key={apt.id} className="hover:bg-[#F4F4F5] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-[#191919] text-sm">{apt.service}</p>
                            <p className="text-xs text-[#A3A3A3]">#{apt.id}</p>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#6b7280] whitespace-nowrap">{apt.date}<br/><span className="text-xs">{apt.time}</span></td>
                          <td className="px-5 py-3.5 text-sm text-[#6b7280]">{apt.mode}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>{apt.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-[#191919]">{apt.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeNav === "Appointments" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#191919]">All Appointments</h2>
                <Link href="/appointment" className="bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d7a66]">+ New</Link>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100">
                      {["Service","Date & Time","Mode","Status","Fee","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {APPOINTMENTS.map(apt => (
                        <tr key={apt.id} className="hover:bg-[#F4F4F5]">
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#191919]">{apt.service}</p>
                            <p className="text-xs text-[#A3A3A3]">#{apt.id}</p>
                          </td>
                          <td className="px-5 py-4 text-[#6b7280] whitespace-nowrap">{apt.date}<br/><span className="text-xs">{apt.time}</span></td>
                          <td className="px-5 py-4 text-[#6b7280]">{apt.mode}</td>
                          <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>{apt.status}</span></td>
                          <td className="px-5 py-4 font-semibold text-[#191919]">{apt.fee}</td>
                          <td className="px-5 py-4"><button className="text-[#A3A3A3] hover:text-[#14967F] p-1">•••</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRESCRIPTIONS */}
          {activeNav === "Prescriptions" && (
            <div className="space-y-3">
              <h2 className="font-bold text-[#191919] mb-4">My Prescriptions</h2>
              {PRESCRIPTIONS.map(rx => (
                <div key={rx.id} className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[#191919]">{rx.diagnosis}</p>
                      <p className="text-xs text-[#A3A3A3] mt-0.5">#{rx.id} • {rx.date}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${rx.locked ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"}`}>
                      {rx.locked ? "🔒 Payment Required" : "✓ Available"}
                    </span>
                  </div>
                  {rx.locked ? (
                    <div className="bg-[#FFF9E6] border border-[#FAD069]/40 rounded-xl p-4 flex items-center justify-between">
                      <p className="text-sm text-[#6b7280]">Complete payment to unlock and download your prescription.</p>
                      <button onClick={() => setActiveNav("Invoice")} className="ml-4 bg-[#FAD069] text-[#191919] rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#e8bb45] flex-shrink-0">Pay ৳500</button>
                    </div>
                  ) : (
                    <a href="#" download className="inline-flex items-center gap-2 bg-[#e8f5f2] text-[#14967F] rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#d0ede8] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      Download Prescription PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT PROBLEM */}
          {activeNav === "Submit Problem" && (
            <div className="max-w-2xl">
              <h2 className="font-bold text-[#191919] mb-4">Submit Health Problem</h2>
              {problem.submitted ? (
                <div className="bg-white rounded-2xl p-10 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-[#191919] mb-2">Problem Submitted!</h3>
                  <p className="text-[#6b7280] text-sm mb-6">Dr. Jahangir will review and respond within 24 hours.</p>
                  <button onClick={() => setProblem({ text: "", submitted: false })} className="bg-[#14967F] text-white rounded-full px-6 py-2.5 text-sm font-medium">Submit Another</button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#191919] mb-1.5">Describe Your Problem *</label>
                    <textarea placeholder="Describe symptoms in detail — location, duration, severity, triggers..." rows={6}
                      value={problem.text} onChange={e => setProblem({...problem, text: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-sm resize-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#191919] mb-1.5">Attach Reports</label>
                    <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#14967F] hover:bg-[#e8f5f2] transition-colors">
                      <div className="text-2xl mb-1">📎</div>
                      <p className="text-sm text-[#A3A3A3]">Upload test reports, X-rays, MRI scans (PDF, JPG, PNG)</p>
                      <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png"/>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#191919] mb-1.5">Voice Note</label>
                    <div className="border-2 border-gray-100 rounded-xl p-4 flex items-center gap-4">
                      <button type="button" onClick={() => setRecording(!recording)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${recording ? "bg-red-500" : "bg-[#14967F] hover:bg-[#0d7a66]"}`}>
                        {recording
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-[#191919]">{recording ? "Recording..." : "Record Voice Note"}</p>
                        <p className="text-xs text-[#A3A3A3]">{recording ? "🔴 0:03" : "Tap to record your symptoms"}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { if (problem.text) setProblem({...problem, submitted: true}); }}
                    className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#0d7a66] text-sm">
                    Submit Problem
                  </button>
                </div>
              )}
            </div>
          )}

          {/* INVOICE */}
          {activeNav === "Invoice" && (
            <div className="space-y-4">
              <h2 className="font-bold text-[#191919] mb-4">Payments & Invoice</h2>

              {/* Pending */}
              <div className="bg-white rounded-2xl p-5">
                <h3 className="font-semibold text-[#191919] mb-4 text-sm">Pending Payment</h3>
                <div className="border-2 border-dashed border-[#FAD069]/60 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-[#191919]">Prescription #RX002</p>
                      <p className="text-xs text-[#A3A3A3]">Cervical Spondylosis • 25 May 2025</p>
                    </div>
                    <p className="text-xl font-bold text-[#191919]">৳ 500</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{name:"SSLCommerz",icon:"💳"},{name:"bKash",icon:"📱"},{name:"Nagad",icon:"📲"}].map(m => (
                      <button key={m.name} className="border-2 border-gray-100 rounded-xl p-3 text-center hover:border-[#14967F] hover:bg-[#e8f5f2]">
                        <div className="text-xl mb-1">{m.icon}</div>
                        <p className="text-xs font-semibold text-[#191919]">{m.name}</p>
                      </button>
                    ))}
                  </div>
                  <button className="w-full bg-[#14967F] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#0d7a66]">
                    Pay ৳ 500 via SSLCommerz
                  </button>
                  <p className="text-xs text-[#A3A3A3] text-center mt-2">🔒 Secured by SSLCommerz — Bangladesh&apos;s trusted payment gateway</p>
                </div>
              </div>

              {/* Transaction history */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-[#191919] text-sm">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-50">
                      {["Description","Date","Time","Amount","Status"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {TRANSACTIONS.map((t, i) => (
                        <tr key={i} className="hover:bg-[#F4F4F5]">
                          <td className="px-5 py-3.5 font-medium text-[#191919]">{t.desc}</td>
                          <td className="px-5 py-3.5 text-[#6b7280]">{t.date}</td>
                          <td className="px-5 py-3.5 text-[#6b7280]">{t.time}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#191919]">{t.amount}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.status === "Success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
