"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DoctorRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", specialty: "", email: "", phone: "",
    hospital: "", address: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name required";
    if (!form.specialty.trim()) e.specialty = "Specialty required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    return e;
  };

  const validate2 = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});

    const res = await fetch("/api/auth/doctor/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setErrors({ confirm: data.error || "Registration failed" });
      setLoading(false);
      return;
    }

    // Auto-login
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    router.push("/admin/dashboard");
    router.refresh();
  };

  const SPECIALTIES = [
    "Physical Medicine & Rehabilitation","General Practice","Cardiology","Dermatology",
    "Neurology","Orthopedics","Pediatrics","Psychiatry","Surgery","Gynecology","Other",
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#191919] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#191919" }}>Book<span style={{ color: "#14967F" }}>My</span>Doc — Register Your Clinic</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Step bar */}
          <div className="flex items-center gap-3 mb-8">
            {["Clinic Info","Security"].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i+1 ? "bg-[#14967F] text-white" : step === i+1 ? "bg-[#191919] text-white" : "bg-gray-200 text-[#A3A3A3]"}`}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span className="text-xs font-medium text-[#191919]">{label}</span>
                {i < 1 && <div className={`flex-1 h-0.5 ml-2 ${step > i+1 ? "bg-[#14967F]" : "bg-gray-200"}`}></div>}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-[#191919] mb-1">Clinic Information</h1>
              <p className="text-[#6b7280] text-sm mb-6">Tell us about your practice</p>
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Doctor Full Name *</label>
                  <input type="text" placeholder="Dr. Your Name" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-300" : "border-gray-100 focus:border-[#191919]"}`}/>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Specialty *</label>
                  <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none bg-white transition-colors ${errors.specialty ? "border-red-300" : "border-gray-100 focus:border-[#191919]"}`}>
                    <option value="">Select specialty...</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Email Address *</label>
                  <input type="email" placeholder="doctor@example.com" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.email ? "border-red-300" : "border-gray-100 focus:border-[#191919]"}`}/>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Phone</label>
                    <input type="tel" placeholder="+880 01XXXXXXXXX" value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Hospital / Clinic</label>
                    <input type="text" placeholder="Hospital name" value={form.hospital}
                      onChange={e => setForm({...form, hospital: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Address</label>
                  <input type="text" placeholder="Clinic address, City" value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#191919] focus:outline-none text-sm"/>
                </div>
                <button type="submit" className="w-full bg-[#191919] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#2d2d2d] transition-colors">
                  Continue →
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => { setStep(1); setErrors({}); }}
                className="flex items-center gap-1.5 text-[#A3A3A3] text-sm mb-5 hover:text-[#191919]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#191919] mb-1">Set Password</h1>
              <p className="text-[#6b7280] text-sm mb-6">Secure your account</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Password *</label>
                  <input type="password" placeholder="Min 8 characters" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.password ? "border-red-300" : "border-gray-100 focus:border-[#191919]"}`}/>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Confirm Password *</label>
                  <input type="password" placeholder="Repeat password" value={form.confirm}
                    onChange={e => setForm({...form, confirm: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.confirm ? "border-red-300" : "border-gray-100 focus:border-[#191919]"}`}/>
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                </div>
                <div className="bg-[#F4F4F5] rounded-xl p-4 text-xs text-[#6b7280] space-y-1">
                  <p className="font-semibold text-[#191919] mb-2">Registering as:</p>
                  <p><span className="text-[#A3A3A3]">Name:</span> {form.name}</p>
                  <p><span className="text-[#A3A3A3]">Specialty:</span> {form.specialty}</p>
                  <p><span className="text-[#A3A3A3]">Email:</span> {form.email}</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors disabled:opacity-60">
                  {loading ? "Creating your clinic..." : "Create Clinic Account ✓"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[#A3A3A3] mt-6">
            Already registered?{" "}
            <Link href="/admin/login" className="text-[#14967F] font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
