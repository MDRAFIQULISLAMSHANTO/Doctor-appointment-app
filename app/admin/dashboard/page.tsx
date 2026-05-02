"use client";
import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Appointments", icon: "📅" },
  { label: "My Schedule", icon: "🗓️" },
  { label: "Prescriptions", icon: "💊" },
  { label: "Patients", icon: "👥" },
  { label: "Shop", icon: "🛒" },
  { label: "Reviews", icon: "⭐" },
  { label: "Settings", icon: "⚙️" },
];

const APPOINTMENTS = [
  { id: "AP455698", patient: "Mohammad Rahman", phone: "+880 171XXXXXXX", date: "27 May 2025", time: "09:30 AM", mode: "Online", status: "Checked Out", fee: "৳ 500" },
  { id: "AP455699", patient: "Rahima Begum", phone: "+880 181XXXXXXX", date: "26 May 2025", time: "10:15 AM", mode: "In-Person", status: "Checked In", fee: "৳ 500" },
  { id: "AP455700", patient: "Karim Uddin", phone: "+880 191XXXXXXX", date: "25 May 2025", time: "02:40 PM", mode: "In-Person", status: "Cancelled", fee: "৳ 0" },
  { id: "AP455701", patient: "Fatema Khatun", phone: "+880 155XXXXXXX", date: "24 May 2025", time: "11:30 AM", mode: "Online", status: "Schedule", fee: "৳ 500" },
  { id: "AP455702", patient: "Ahmed Siddiqui", phone: "+880 166XXXXXXX", date: "23 May 2025", time: "04:10 PM", mode: "Online", status: "Schedule", fee: "৳ 500" },
];

const TOP_PATIENTS = [
  { name: "Mohammad Rahman", phone: "+880 171XXXXXXX", visits: 20 },
  { name: "Rahima Begum", phone: "+880 181XXXXXXX", visits: 18 },
  { name: "Karim Uddin", phone: "+880 191XXXXXXX", visits: 16 },
  { name: "Fatema Khatun", phone: "+880 155XXXXXXX", visits: 14 },
  { name: "Ahmed Siddiqui", phone: "+880 166XXXXXXX", visits: 12 },
];

const SCHEDULE = [
  { day: "Mon", start: "9:00 AM", end: "5:00 PM", open: true },
  { day: "Tue", start: "9:00 AM", end: "5:00 PM", open: true },
  { day: "Wed", start: "9:00 AM", end: "5:00 PM", open: true },
  { day: "Thu", start: "9:00 AM", end: "5:00 PM", open: true },
  { day: "Fri", start: "—", end: "—", open: false },
  { day: "Sat", start: "9:00 AM", end: "2:00 PM", open: true },
  { day: "Sun", start: "9:00 AM", end: "12:00 PM", open: true },
];

const statusColor: Record<string, string> = {
  "Checked Out": "bg-green-50 text-green-600",
  "Checked In": "bg-yellow-50 text-yellow-600",
  "Cancelled": "bg-red-50 text-red-500",
  "Schedule": "bg-blue-50 text-blue-600",
};

const BarChart = () => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const total   = [120,180,150,200,160,220,190,240,210,260,230,300];
  const completed = [100,150,120,170,130,190,160,210,180,230,200,270];
  const max = 320;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#e8f5f2]"></div><span className="text-xs text-[#A3A3A3]">Total Appointments</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#14967F]"></div><span className="text-xs text-[#A3A3A3]">Completed Appointments</span></div>
      </div>
      <div className="flex items-end gap-1.5" style={{height: "120px"}}>
        {months.map((m, i) => (
          <div key={m} className="flex-1 flex items-end gap-0.5" style={{height: "100%"}}>
            <div className="flex-1 rounded-t-sm" style={{height: `${(total[i]/max)*100}%`, background: "#e8f5f2"}}></div>
            <div className="flex-1 rounded-t-sm" style={{height: `${(completed[i]/max)*100}%`, background: "#14967F"}}></div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {months.map(m => <div key={m} className="flex-1 text-center text-[9px] text-[#A3A3A3]">{m}</div>)}
      </div>
    </div>
  );
};

const DonutChart = () => {
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { pct: 0.57, color: "#14967F", label: "Completed", count: 260 },
    { pct: 0.05, color: "#FAD069", label: "Pending", count: 21 },
    { pct: 0.11, color: "#ef4444", label: "Cancelled", count: 50 },
    { pct: 0.27, color: "#e8f5f2", label: "Other", count: 0 },
  ];
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" width="100" height="100" className="flex-shrink-0">
        {segments.map((s, i) => {
          const dash = s.pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
              style={{transform:"rotate(-90deg)", transformOrigin:"50% 50%"}}/>
          );
          offset += s.pct;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.slice(0,3).map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: s.color}}></div>
            <span className="text-xs text-[#A3A3A3]">{s.label}</span>
            <span className="text-xs font-bold text-[#191919] ml-auto">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [uploadFor, setUploadFor] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#191919] fixed left-0 top-0 z-30">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Preclinic</p>
              <p className="text-white/30 text-[10px]">Dr. Jahangir</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 py-4">
          <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider px-3 mb-2">Main Menu</p>
          <nav className="space-y-0.5">
            {NAV.map(item => (
              <button key={item.label} onClick={() => setActiveNav(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeNav === item.label ? "bg-[#14967F] text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 py-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/30 hover:text-white">
            <span>🚪</span> Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#F4F4F5] rounded-xl px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search..." className="bg-transparent text-sm text-[#6b7280] outline-none w-36"/>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/appointment" className="hidden sm:flex items-center gap-1.5 bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d7a66]">
              + New Appointment
            </Link>
            <button className="hidden sm:flex items-center gap-1.5 border border-gray-200 text-[#191919] rounded-full px-4 py-2 text-sm font-medium hover:border-[#14967F]">
              📅 Schedule Availability
            </button>
            <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm">J</div>
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
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Total Appointments", value: "658", sub: "+95%", bars: [40,60,50,70,55,65,80,75,85,70,90,95], color: "bg-[#14967F]" },
                  { label: "Online Consultations", value: "125", sub: "-15%", bars: [60,55,65,50,70,45,55,60,50,45,55,50], color: "bg-orange-400" },
                  { label: "Cancelled Appointments", value: "35", sub: "+45%", bars: [20,25,15,30,20,35,25,30,20,35,25,30], color: "bg-green-500" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-[#6b7280] font-medium">{s.label}</p>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${i === 0 ? "bg-[#e8f5f2]" : i === 1 ? "bg-orange-50" : "bg-green-50"}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? "#14967F" : i === 1 ? "#f97316" : "#22c55e"} strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/></svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-[#191919] mb-1">{s.value}</p>
                    <div className="flex items-end gap-0.5 h-10 mt-2">
                      {s.bars.map((v, j) => (
                        <div key={j} className={`flex-1 rounded-sm ${j === s.bars.length - 1 ? s.color : "bg-[#F4F4F5]"}`} style={{height: `${v}%`}}></div>
                      ))}
                    </div>
                    <p className="text-xs text-[#A3A3A3] mt-2">
                      <span className={`font-semibold ${s.sub.startsWith("+") && i < 2 ? "text-green-600" : i === 2 ? "text-red-500" : "text-red-500"}`}>{s.sub}</span> in last 7 Days
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-5 gap-5">
                {/* Upcoming + Chart */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Upcoming */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#191919] text-sm">Upcoming...</h3>
                      <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Today ▾</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold flex-shrink-0">M</div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#191919]">Mohammad Rahman</p>
                        <p className="text-xs text-[#A3A3A3]">#AP455698</p>
                        <p className="text-sm font-semibold text-[#191919] mt-2">Arthritis Treatment</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-[#A3A3A3]">
                          <span>📅 Monday, 27 May 2025</span>
                          <span>🕐 09:30 AM</span>
                        </div>
                        <div className="flex items-center gap-6 mt-2 text-xs">
                          <div><span className="text-[#A3A3A3]">Service</span><p className="text-[#191919] font-medium">Arthritis Treatment</p></div>
                          <div><span className="text-[#A3A3A3]">Type</span><p className="text-[#191919] font-medium">Online</p></div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button className="flex-1 bg-[#14967F] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0d7a66]">Start Appointment</button>
                          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-[#191919] hover:border-[#14967F]">
                            💬 Chat Now
                          </button>
                          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-[#191919] hover:border-[#14967F]">
                            📹 Video
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#191919] text-sm">Appointments</h3>
                      <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Monthly ▾</span>
                    </div>
                    <BarChart />
                  </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Donut */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#191919] text-sm">Appointment Split</h3>
                      <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Monthly ▾</span>
                    </div>
                    <DonutChart />
                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                      {[{l:"Completed",v:260,c:"text-[#14967F]"},{l:"Pending",v:21,c:"text-[#FAD069]"},{l:"Cancelled",v:50,c:"text-red-500"}].map(s => (
                        <div key={s.l} className="text-center">
                          <p className={`text-sm font-bold ${s.c}`}>{s.v}</p>
                          <p className="text-[10px] text-[#A3A3A3]">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top patients */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#191919] text-sm">Top Patients</h3>
                      <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Weekly ▾</span>
                    </div>
                    <div className="space-y-2.5">
                      {TOP_PATIENTS.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#191919] truncate">{p.name}</p>
                            <p className="text-[10px] text-[#A3A3A3]">{p.phone}</p>
                          </div>
                          <span className="text-xs bg-[#e8f5f2] text-[#14967F] rounded-full px-2 py-0.5 font-medium whitespace-nowrap">{p.visits} Visits</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { icon: "👥", label: "Total Patient", value: "658", trend: "+31%" },
                  { icon: "📹", label: "Video Consult", value: "256", trend: "-21%", neg: true },
                  { icon: "🔄", label: "Rescheduled", value: "141", trend: "+64%" },
                  { icon: "🏥", label: "Pre Visit", value: "524", trend: "+38%" },
                  { icon: "🚶", label: "Walk-in", value: "21", trend: "+95%" },
                  { icon: "🔁", label: "Follow Ups", value: "451", trend: "+76%" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 text-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mx-auto mb-2 ${i === 0 ? "bg-blue-50" : i === 1 ? "bg-green-50" : i === 2 ? "bg-red-50" : i === 3 ? "bg-orange-50" : i === 4 ? "bg-purple-50" : "bg-[#e8f5f2]"}`}>
                      {s.icon}
                    </div>
                    <p className="text-lg font-bold text-[#191919]">{s.value}</p>
                    <p className="text-[10px] text-[#A3A3A3] mt-0.5">{s.label}</p>
                    <p className={`text-[10px] font-semibold mt-1 ${s.neg ? "text-red-500" : "text-green-600"}`}>{s.trend} Last...</p>
                  </div>
                ))}
              </div>

              {/* Recent Appointments Table */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#191919] text-sm">Recent Appointments</h3>
                  <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Weekly ▾</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-50">
                      {["Patient","Date & Time","Mode","Status","Fees","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {APPOINTMENTS.map(apt => (
                        <tr key={apt.id} className="hover:bg-[#F4F4F5]">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{apt.patient.charAt(0)}</div>
                              <div>
                                <p className="font-semibold text-[#191919] text-sm">{apt.patient}</p>
                                <p className="text-xs text-[#A3A3A3]">{apt.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#6b7280] whitespace-nowrap">{apt.date}<br/><span className="text-xs">{apt.time}</span></td>
                          <td className="px-5 py-4 text-[#6b7280]">{apt.mode}</td>
                          <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>{apt.status}</span></td>
                          <td className="px-5 py-4 font-semibold text-[#191919]">{apt.fee}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#A3A3A3] hover:text-[#191919]">📅</button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#A3A3A3] hover:text-[#191919]">•••</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom row: Availability + Top Patients (wide) */}
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#191919] text-sm">Availability</h3>
                    <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Chittagong Clinic ▾</span>
                  </div>
                  <div className="space-y-2.5">
                    {SCHEDULE.map(s => (
                      <div key={s.day} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#191919] w-10">{s.day}</span>
                        {s.open
                          ? <span className="text-sm text-[#6b7280]">🕐 {s.start} — {s.end}</span>
                          : <span className="text-sm text-red-400">🔴 Closed</span>}
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 border border-gray-200 text-[#191919] rounded-xl py-2.5 text-sm font-medium hover:border-[#14967F] hover:text-[#14967F] transition-colors">
                    Edit Availability
                  </button>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#191919] text-sm">Top Patients (This Week)</h3>
                    <span className="text-xs text-[#A3A3A3] border border-gray-200 rounded-lg px-2.5 py-1">Weekly ▾</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {TOP_PATIENTS.map((p, i) => (
                      <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#F4F4F5]">
                        <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{p.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#191919] text-sm">{p.name}</p>
                          <p className="text-xs text-[#A3A3A3]">{p.phone}</p>
                        </div>
                        <span className="bg-[#e8f5f2] text-[#14967F] text-xs font-semibold rounded-full px-3 py-1">{p.visits} Appointments</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS TAB */}
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
                      {["Patient","Date & Time","Mode","Status","Fee","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {APPOINTMENTS.map(apt => (
                        <tr key={apt.id} className="hover:bg-[#F4F4F5]">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#14967F] flex items-center justify-center text-white text-xs font-bold">{apt.patient.charAt(0)}</div>
                              <div><p className="font-semibold text-[#191919]">{apt.patient}</p><p className="text-xs text-[#A3A3A3]">#{apt.id}</p></div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#6b7280]">{apt.date}<br/><span className="text-xs">{apt.time}</span></td>
                          <td className="px-5 py-4 text-[#6b7280]">{apt.mode}</td>
                          <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[apt.status] || "bg-gray-100 text-gray-500"}`}>{apt.status}</span></td>
                          <td className="px-5 py-4 font-semibold text-[#191919]">{apt.fee}</td>
                          <td className="px-5 py-4 flex gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100">📅</button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100">•••</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeNav === "Prescriptions" && (
            <div className="space-y-4">
              <div className="bg-[#e8f5f2] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <p className="text-sm text-[#14967F]">Upload prescription PDFs below. They lock automatically until the patient completes SSLCommerz payment.</p>
              </div>
              {APPOINTMENTS.slice(0, 3).map((apt) => (
                <div key={apt.id} className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm">{apt.patient.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-[#191919] text-sm">{apt.patient}</p>
                        <p className="text-xs text-[#A3A3A3]">{apt.date} • #{apt.id}</p>
                      </div>
                    </div>
                  </div>
                  {uploadFor === apt.id ? (
                    <div className="space-y-3">
                      <label className="block border-2 border-dashed border-[#14967F] bg-[#e8f5f2] rounded-xl p-5 text-center cursor-pointer">
                        <div className="text-3xl mb-1">📄</div>
                        <p className="text-sm text-[#14967F] font-medium">Click to upload prescription PDF</p>
                        <input type="file" className="hidden" accept=".pdf"/>
                      </label>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-[#14967F] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d7a66]">Upload & Lock (Requires ৳500 payment)</button>
                        <button onClick={() => setUploadFor(null)} className="px-4 border border-gray-200 rounded-xl text-sm text-[#A3A3A3]">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setUploadFor(apt.id)} className="flex items-center gap-2 bg-[#e8f5f2] text-[#14967F] rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#d0ede8]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      Upload Prescription PDF
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PATIENTS TAB */}
          {activeNav === "Patients" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#191919]">All Patients</h2>
                <input type="search" placeholder="Search patients..." className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#14967F] w-48"/>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100">
                      {["Patient","Contact","Last Visit","Total Visits","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {TOP_PATIENTS.map((p, i) => (
                        <tr key={i} className="hover:bg-[#F4F4F5]">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center text-white font-bold text-sm">{p.name.charAt(0)}</div>
                              <p className="font-semibold text-[#191919]">{p.name}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#6b7280]">{p.phone}</td>
                          <td className="px-5 py-4 text-[#6b7280]">May 2025</td>
                          <td className="px-5 py-4"><span className="bg-[#e8f5f2] text-[#14967F] text-xs font-semibold rounded-full px-2.5 py-1">{p.visits} visits</span></td>
                          <td className="px-5 py-4"><button className="text-[#A3A3A3] hover:text-[#14967F] text-lg">•••</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SHOP TAB */}
          {activeNav === "Shop" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#191919]">Shop Management</h2>
                <button className="bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d7a66]">+ Add Product</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {name:"Physiotherapy Guide",price:"৳ 350",stock:50,emoji:"📖",cat:"Book"},
                  {name:"Pain Relief Gel 50g",price:"৳ 280",stock:120,emoji:"💊",cat:"Medicine"},
                  {name:"Knee Support Brace",price:"৳ 850",stock:30,emoji:"🦵",cat:"Equipment"},
                  {name:"Cervical Pillow",price:"৳ 650",stock:45,emoji:"🛏️",cat:"Equipment"},
                  {name:"Lumbar Support Belt",price:"৳ 750",stock:60,emoji:"🫀",cat:"Equipment"},
                  {name:"Arthritis Care Book",price:"৳ 420",stock:25,emoji:"📚",cat:"Book"},
                ].map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4">
                    <div className="h-24 bg-[#F4F4F5] rounded-xl flex items-center justify-center text-4xl mb-4">{p.emoji}</div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#191919] text-sm">{p.name}</p>
                        <p className="text-xs text-[#A3A3A3]">{p.cat} • Stock: {p.stock}</p>
                      </div>
                      <p className="font-bold text-[#14967F] text-sm">{p.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs text-[#6b7280] hover:border-[#14967F] hover:text-[#14967F]">Edit</button>
                      <button className="flex-1 border border-red-100 rounded-lg py-1.5 text-xs text-red-400 hover:bg-red-50">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 text-center">
          <p className="text-xs text-[#A3A3A3]">2025 © Dr. Jahangir Alam Chowdhury, All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
