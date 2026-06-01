"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Doctor = {
  id: string; slug: string; name: string; specialty: string; email: string;
  phone: string; hospital: string; address: string; city: string; bio: string;
  photo_url: string; logo_url: string; theme_color: string;
  plan: string; active: boolean;
  features: Record<string, boolean | number>; created_at: string;
  stats: { patients: string; experience: string; rating: string; reviews: string };
  services: string[];
  _count?: { appointments: number; patients: number };
};

const PLANS = [
  { key: "free",    label: "Free",    color: "bg-gray-100 text-gray-600",   features: { appointments: 30, prescriptions: false, shop: false, blog: false, custom_domain: false, max_patients: 50 } },
  { key: "starter", label: "Starter", color: "bg-blue-50 text-blue-600",    features: { appointments: 200, prescriptions: true, shop: false, blog: true, custom_domain: false, max_patients: 500 } },
  { key: "pro",     label: "Pro",     color: "bg-[#e8f5f2] text-[#14967F]", features: { appointments: -1, prescriptions: true, shop: true, blog: true, custom_domain: true, max_patients: -1 } },
];

const FEATURE_LABELS: Record<string, string> = {
  appointments: "Max Appointments/mo",
  prescriptions: "Prescriptions",
  shop: "Shop",
  blog: "Blog",
  custom_domain: "Custom Domain",
  max_patients: "Max Patients",
};

const THEME_PRESETS = [
  { color: "#14967F", name: "Teal (Default)" },
  { color: "#2563EB", name: "Blue" },
  { color: "#7C3AED", name: "Purple" },
  { color: "#DC2626", name: "Red" },
  { color: "#D97706", name: "Amber" },
  { color: "#059669", name: "Emerald" },
  { color: "#DB2777", name: "Pink" },
  { color: "#0F172A", name: "Navy" },
];

const SPECIALTIES = ["Physical Medicine & Rehabilitation","General Practice","Cardiology","Dermatology","Neurology","Orthopedics","Pediatrics","Psychiatry","Surgery","Gynecology","Other"];

function ServicesEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="e.g. Joint Replacement Surgery"
          className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
        <button type="button" onClick={add}
          className="px-4 py-2 bg-[#191919] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2d2d] whitespace-nowrap">
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((svc, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-[#F4F4F5] text-[#191919] rounded-full px-3 py-1.5 text-xs font-medium">
              {svc}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-[#A3A3A3] hover:text-red-500 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageUploader({
  value, onChange, label, hint, aspect = "rect",
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  aspect?: "rect" | "square";
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Only image files allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB"); return; }
    setError(""); setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("doctor-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("doctor-assets").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#191919] mb-1.5">{label}</label>
      <div className="flex gap-3 items-start">
        {/* Preview */}
        <div
          className={`flex-shrink-0 bg-[#F4F4F5] border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#14967F] transition-colors relative`}
          style={{ width: aspect === "square" ? 72 : 96, height: 72 }}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="text-lg">📷</div>
              <p className="text-[9px] text-[#A3A3A3] mt-0.5">Click or drop</p>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#14967F] border-t-transparent rounded-full animate-spin"/>
            </div>
          )}
        </div>

        {/* URL + actions */}
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-1.5">
            <input type="url" value={value} onChange={e => onChange(e.target.value)}
              placeholder="https://... or upload →"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-xs"/>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="px-3 py-2 rounded-xl bg-[#191919] text-white text-xs font-semibold hover:bg-[#2d2d2d] disabled:opacity-50 whitespace-nowrap">
              {uploading ? "..." : "Upload"}
            </button>
          </div>
          {hint && <p className="text-[10px] text-[#A3A3A3]">{hint}</p>}
          {error && <p className="text-[10px] text-red-500">{error}</p>}
          {value && (
            <button type="button" onClick={() => onChange("")}
              className="text-[10px] text-red-400 hover:text-red-600">✕ Remove</button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {THEME_PRESETS.map(p => (
          <button key={p.color} type="button" title={p.name}
            onClick={() => onChange(p.color)}
            className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110"
            style={{
              background: p.color,
              borderColor: value === p.color ? "#191919" : "transparent",
              outline: value === p.color ? `2px solid ${p.color}` : "none",
              outlineOffset: "2px",
            }} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder="#14967F"
          className="flex-1 px-3 py-1.5 rounded-lg border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm font-mono" />
        <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: value }} />
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const [tab, setTab] = useState<"doctors" | "create">("doctors");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editTab, setEditTab] = useState<"plan" | "profile">("plan");

  const [createForm, setCreateForm] = useState({
    name: "", specialty: "", email: "", phone: "", hospital: "", address: "",
    city: "", bio: "", photo_url: "", logo_url: "",
    password: "", plan: "free", theme_color: "#14967F",
  });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/stats").then(r => r.json()).then(d => {
      setDoctors(d.doctors || []);
      setStats(d.stats || {});
      setLoading(false);
    });
  }, []);

  const handlePlanChange = (doctor: Doctor, plan: string) => {
    const p = PLANS.find(p => p.key === plan)!;
    setSelected({ ...doctor, plan, features: { ...p.features } });
  };

  const handleFeatureToggle = (key: string, val: boolean | number) => {
    if (!selected) return;
    setSelected({ ...selected, features: { ...selected.features, [key]: val } });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/super-admin/update-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        plan: selected.plan,
        active: selected.active,
        features: selected.features,
        theme_color: selected.theme_color,
        photo_url: selected.photo_url,
        logo_url: selected.logo_url,
        bio: selected.bio,
        city: selected.city,
        name: selected.name,
        specialty: selected.specialty,
        phone: selected.phone,
        hospital: selected.hospital,
        address: selected.address,
        stats: selected.stats,
        services: selected.services,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg("Saved!");
      setDoctors(ds => ds.map(d => d.id === selected.id ? { ...d, ...selected } : d));
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(data.error || "Failed");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg("");
    const res = await fetch("/api/auth/doctor/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setCreateMsg(`✓ Doctor created! Portal: /${data.slug}`);
      setCreateForm({ name: "", specialty: "", email: "", phone: "", hospital: "", address: "", city: "", bio: "", photo_url: "", logo_url: "", password: "", plan: "free", theme_color: "#14967F" });
      fetch("/api/super-admin/stats").then(r => r.json()).then(d => setDoctors(d.doctors || []));
    } else {
      setCreateMsg(data.error || "Failed to create doctor");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <header className="bg-[#191919] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14967F] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <p className="font-bold text-sm">Super Admin</p>
            <p className="text-white/40 text-[10px]">BookMyDoc Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-white/50 hover:text-white">← Website</Link>
          <div className="w-8 h-8 rounded-full bg-[#14967F] flex items-center justify-center text-xs font-bold">S</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Doctors", value: stats.doctors, icon: "👨‍⚕️", color: "bg-blue-50" },
            { label: "Total Patients", value: stats.patients, icon: "🧑‍🤝‍🧑", color: "bg-[#e8f5f2]" },
            { label: "Total Appointments", value: stats.appointments, icon: "📅", color: "bg-purple-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-[#191919]">{s.value}</p>
              <p className="text-xs text-[#A3A3A3] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[{ key: "doctors", label: "All Doctors" }, { key: "create", label: "+ Create Doctor" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as "doctors" | "create")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t.key ? "bg-[#191919] text-white" : "bg-white text-[#6b7280] hover:text-[#191919]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* DOCTORS LIST */}
        {tab === "doctors" && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 space-y-2">
              {loading ? (
                <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#A3A3A3]">Loading...</div>
              ) : doctors.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#A3A3A3]">No doctors yet.<br/>Create one →</div>
              ) : doctors.map(d => (
                <button key={d.id} onClick={() => { setSelected({ ...d, stats: d.stats ?? { patients: "0", experience: "0", rating: "5.0", reviews: "0" }, services: d.services ?? [] }); setEditTab("plan"); }}
                  className={`w-full text-left bg-white rounded-2xl p-4 border-2 transition-colors ${selected?.id === d.id ? "border-[#191919]" : "border-transparent hover:border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-[#191919] text-sm truncate">{d.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${PLANS.find(p=>p.key===d.plan)?.color || "bg-gray-100 text-gray-500"}`}>
                      {d.plan?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3]">{d.specialty}</p>
                  <p className="text-xs text-[#A3A3A3]">{d.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-3 h-3 rounded-full border-2 border-white flex-shrink-0" style={{ background: d.theme_color || "#14967F" }} />
                    <div className={`w-1.5 h-1.5 rounded-full ${d.active ? "bg-green-400" : "bg-red-400"}`}/>
                    <span className="text-[10px] text-[#A3A3A3]">{d.active ? "Active" : "Inactive"}</span>
                    <span className="text-[10px] text-[#A3A3A3] ml-auto">/{d.slug}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Edit panel */}
            <div className="lg:col-span-2">
              {!selected ? (
                <div className="bg-white rounded-2xl p-12 text-center text-sm text-[#A3A3A3]">
                  Select a doctor to manage their plan and profile
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: selected.theme_color || "#14967F" }}>
                        {selected.name?.charAt(0) ?? "D"}
                      </div>
                      <div>
                        <h2 className="font-bold text-[#191919]">{selected.name}</h2>
                        <p className="text-sm text-[#A3A3A3]">{selected.specialty} · {selected.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href={`/${selected.slug}`} target="_blank"
                        className="text-xs text-[#14967F] hover:underline">Preview →</a>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#A3A3A3]">Active</span>
                        <button onClick={() => setSelected({ ...selected, active: !selected.active })}
                          className={`w-10 h-6 rounded-full transition-colors relative ${selected.active ? "bg-[#14967F]" : "bg-gray-200"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${selected.active ? "left-5" : "left-1"}`}/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit sub-tabs */}
                  <div className="flex gap-1 bg-[#F4F4F5] rounded-xl p-1">
                    {[{ key: "plan", label: "Plan & Features" }, { key: "profile", label: "Profile & Theme" }].map(t => (
                      <button key={t.key} onClick={() => setEditTab(t.key as "plan" | "profile")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${editTab === t.key ? "bg-white text-[#191919] shadow-sm" : "text-[#6b7280]"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {editTab === "plan" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-2">Plan</label>
                        <div className="grid grid-cols-3 gap-2">
                          {PLANS.map(p => (
                            <button key={p.key} onClick={() => handlePlanChange(selected, p.key)}
                              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${selected.plan === p.key ? "border-[#191919] bg-[#191919] text-white" : "border-gray-100 text-[#6b7280] hover:border-gray-300"}`}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-3">Features</label>
                        <div className="space-y-3">
                          {Object.entries(selected.features || {}).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <span className="text-sm text-[#191919]">{FEATURE_LABELS[key] || key}</span>
                              {typeof val === "boolean" ? (
                                <button onClick={() => handleFeatureToggle(key, !val)}
                                  className={`w-10 h-6 rounded-full transition-colors relative ${val ? "bg-[#14967F]" : "bg-gray-200"}`}>
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${val ? "left-5" : "left-1"}`}/>
                                </button>
                              ) : (
                                <input type="number" value={val === -1 ? "" : val}
                                  placeholder={val === -1 ? "∞ Unlimited" : ""}
                                  onChange={e => handleFeatureToggle(key, e.target.value === "" ? -1 : parseInt(e.target.value))}
                                  className="w-28 px-3 py-1.5 rounded-lg border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm text-right"/>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {editTab === "profile" && (
                    <div className="space-y-4">
                      {/* Theme color */}
                      <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-2">Brand Color</label>
                        <ColorPicker value={selected.theme_color || "#14967F"} onChange={c => setSelected({ ...selected, theme_color: c })} />
                        <p className="text-xs text-[#A3A3A3] mt-1.5">Controls buttons, accents, and gradients on the doctor&apos;s public page.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#191919] mb-1.5">Full Name</label>
                          <input type="text" value={selected.name || ""} onChange={e => setSelected({ ...selected, name: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#191919] mb-1.5">Specialty</label>
                          <input type="text" value={selected.specialty || ""} onChange={e => setSelected({ ...selected, specialty: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#191919] mb-1.5">Phone</label>
                          <input type="tel" value={selected.phone || ""} onChange={e => setSelected({ ...selected, phone: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#191919] mb-1.5">City</label>
                          <input type="text" value={selected.city || ""} onChange={e => setSelected({ ...selected, city: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#191919] mb-1.5">Hospital / Clinic</label>
                          <input type="text" value={selected.hospital || ""} onChange={e => setSelected({ ...selected, hospital: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#191919] mb-1.5">Address</label>
                          <input type="text" value={selected.address || ""} onChange={e => setSelected({ ...selected, address: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                        </div>
                      </div>
                      <ImageUploader
                        label="Doctor Photo"
                        value={selected.photo_url || ""}
                        onChange={v => setSelected({ ...selected, photo_url: v })}
                        hint="Portrait photo shown in hero section (max 5MB)"
                        aspect="rect"
                      />
                      <ImageUploader
                        label="Clinic Logo"
                        value={selected.logo_url || ""}
                        onChange={v => setSelected({ ...selected, logo_url: v })}
                        hint="Square logo shown in nav bar (max 5MB)"
                        aspect="square"
                      />
                      <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-1.5">Bio</label>
                        <textarea rows={3} value={selected.bio || ""} onChange={e => setSelected({ ...selected, bio: e.target.value })}
                          placeholder="About the doctor..."
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm resize-none"/>
                      </div>

                      {/* Stats */}
                      <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-2">Profile Stats</label>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { key: "experience", label: "Experience (years)", placeholder: "10" },
                            { key: "patients",   label: "Patients Treated",   placeholder: "1500" },
                            { key: "rating",     label: "Rating (out of 5)",  placeholder: "4.9" },
                            { key: "reviews",    label: "Reviews Count",      placeholder: "240" },
                          ] as const).map(({ key, label, placeholder }) => (
                            <div key={key}>
                              <label className="block text-xs text-[#A3A3A3] mb-1">{label}</label>
                              <input type="text" value={(selected.stats ?? {})[key] ?? ""} placeholder={placeholder}
                                onChange={e => setSelected({ ...selected, stats: { ...(selected.stats ?? { patients: "0", experience: "0", rating: "5.0", reviews: "0" }), [key]: e.target.value } })}
                                className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#A3A3A3] mt-1.5">Displayed on the doctor&apos;s public page hero section.</p>
                      </div>

                      {/* Services */}
                      <div>
                        <label className="block text-sm font-semibold text-[#191919] mb-1.5">Services</label>
                        <ServicesEditor
                          value={selected.services ?? []}
                          onChange={v => setSelected({ ...selected, services: v })}
                        />
                        <p className="text-[10px] text-[#A3A3A3] mt-1.5">Each service gets its own card on the public landing page.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 bg-[#191919] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#2d2d2d] disabled:opacity-60">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    {msg && <span className={`text-sm font-medium ${msg === "Saved!" ? "text-[#14967F]" : "text-red-500"}`}>{msg}</span>}
                  </div>

                  <div className="bg-[#F4F4F5] rounded-xl p-3 text-xs text-[#6b7280]">
                    <span className="font-semibold text-[#191919]">Portal URL:</span>{" "}
                    <a href={`/${selected.slug}`} target="_blank" className="text-[#14967F] hover:underline">/{selected.slug}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE DOCTOR */}
        {tab === "create" && (
          <div className="max-w-2xl bg-white rounded-2xl p-7">
            <h2 className="font-bold text-[#191919] mb-1">Create New Doctor Account</h2>
            <p className="text-sm text-[#A3A3A3] mb-6">Doctor receives login credentials and a ready-to-use patient portal.</p>
            <form onSubmit={handleCreate} className="space-y-5">

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Full Name *</label>
                  <input type="text" placeholder="Dr. Name" value={createForm.name}
                    onChange={e => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Specialty *</label>
                  <select value={createForm.specialty} onChange={e => setCreateForm({...createForm, specialty: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm bg-white" required>
                    <option value="">Select...</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Email *</label>
                  <input type="email" placeholder="doctor@email.com" value={createForm.email}
                    onChange={e => setCreateForm({...createForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Phone</label>
                  <input type="tel" placeholder="+880 01XXXXXXXXX" value={createForm.phone}
                    onChange={e => setCreateForm({...createForm, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Hospital / Clinic</label>
                  <input type="text" placeholder="Hospital name" value={createForm.hospital}
                    onChange={e => setCreateForm({...createForm, hospital: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">City</label>
                  <input type="text" placeholder="Dhaka, Chittagong..." value={createForm.city}
                    onChange={e => setCreateForm({...createForm, city: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Address</label>
                <input type="text" placeholder="Clinic address" value={createForm.address}
                  onChange={e => setCreateForm({...createForm, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Bio</label>
                <textarea rows={2} placeholder="Short description about the doctor..." value={createForm.bio}
                  onChange={e => setCreateForm({...createForm, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm resize-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ImageUploader
                  label="Doctor Photo"
                  value={createForm.photo_url}
                  onChange={v => setCreateForm({...createForm, photo_url: v})}
                  hint="Portrait photo (max 5MB)"
                  aspect="rect"
                />
                <ImageUploader
                  label="Clinic Logo"
                  value={createForm.logo_url}
                  onChange={v => setCreateForm({...createForm, logo_url: v})}
                  hint="Square logo for nav (max 5MB)"
                  aspect="square"
                />
              </div>

              {/* Brand color */}
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-2">Brand Color</label>
                <ColorPicker value={createForm.theme_color} onChange={c => setCreateForm({...createForm, theme_color: c})} />
                <p className="text-xs text-[#A3A3A3] mt-1.5">Theme color for this doctor&apos;s public landing page.</p>
              </div>

              {/* Preview */}
              <div className="rounded-2xl p-4 border-2 border-dashed border-gray-200">
                <p className="text-xs text-[#A3A3A3] mb-2 font-medium">Preview</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: createForm.theme_color || "#14967F" }}>
                    {createForm.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#191919]">{createForm.name || "Doctor Name"}</p>
                    <p className="text-xs" style={{ color: createForm.theme_color || "#14967F" }}>{createForm.specialty || "Specialty"}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-white text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: createForm.theme_color || "#14967F" }}>
                      Book Now →
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Temporary Password *</label>
                  <input type="text" placeholder="Min 8 characters" value={createForm.password}
                    onChange={e => setCreateForm({...createForm, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm" required minLength={8}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Plan</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PLANS.map(p => (
                      <button key={p.key} type="button" onClick={() => setCreateForm({...createForm, plan: p.key})}
                        className={`py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${createForm.plan === p.key ? "border-[#191919] bg-[#191919] text-white" : "border-gray-100 text-[#6b7280]"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {createMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm ${createMsg.startsWith("✓") ? "bg-[#e8f5f2] text-[#14967F]" : "bg-red-50 text-red-600"}`}>
                  {createMsg}
                </div>
              )}

              <button type="submit" disabled={creating}
                className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] disabled:opacity-60 transition-colors">
                {creating ? "Creating..." : "Create Doctor Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
