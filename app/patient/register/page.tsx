"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/patient/dashboard";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name required";
    const cleaned = form.phone.replace(/\D/g, "");
    if (cleaned.length < 10) e.phone = "Valid mobile number required";
    return e;
  };

  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!form.age || Number(form.age) < 1) e.age = "Age required";
    if (!form.gender) e.gender = "Select gender";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    setTimeout(() => {
      if (typeof window !== "undefined") localStorage.setItem("patient_auth", JSON.stringify({ phone: form.phone, name: form.name }));
      router.push(redirect);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#14967F] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="font-bold text-[#191919]">Dr. Jahangir Patient Portal</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Step bar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-[#14967F] text-white" : "bg-gray-200 text-[#A3A3A3]"}`}>{step > 1 ? "✓" : "1"}</div>
              <span className="text-xs font-medium text-[#191919]">Basic Info</span>
            </div>
            <div className={`flex-1 h-0.5 ${step > 1 ? "bg-[#14967F]" : "bg-gray-200"}`}></div>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-[#14967F] text-white" : "bg-gray-200 text-[#A3A3A3]"}`}>2</div>
              <span className="text-xs font-medium text-[step >= 2 ? '#191919' : '#A3A3A3']">Security</span>
            </div>
          </div>

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-[#191919] mb-1">Create Account</h1>
              <p className="text-[#6b7280] text-sm mb-6">Register with your mobile number to get started</p>
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Full Name *</label>
                  <input type="text" placeholder="Your full name" value={form.name}
                    onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: ""}); }}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-300 bg-red-50" : "border-gray-100 focus:border-[#14967F]"}`}/>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Mobile Number *</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 border-2 border-gray-100 rounded-xl px-3 py-3 bg-[#F4F4F5] flex-shrink-0">
                      <span className="text-sm">🇧🇩</span>
                      <span className="text-sm font-semibold text-[#191919]">+880</span>
                    </div>
                    <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                      onChange={e => { setForm({...form, phone: e.target.value}); setErrors({...errors, phone: ""}); }}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-100 focus:border-[#14967F]"}`}
                      maxLength={11}/>
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  <p className="text-[#A3A3A3] text-xs mt-1.5">This will be your login ID</p>
                </div>
                <button type="submit" className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors">
                  Continue →
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => { setStep(1); setErrors({}); }} className="flex items-center gap-1.5 text-[#A3A3A3] text-sm mb-5 hover:text-[#191919]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#191919] mb-1">Health & Security</h1>
              <p className="text-[#6b7280] text-sm mb-6">A few more details to complete your profile</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Age *</label>
                    <input type="number" placeholder="Age" value={form.age}
                      onChange={e => { setForm({...form, age: e.target.value}); setErrors({...errors, age: ""}); }}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.age ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}
                      min={1} max={120}/>
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-1.5">Gender *</label>
                    <select value={form.gender} onChange={e => { setForm({...form, gender: e.target.value}); setErrors({...errors, gender: ""}); }}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors bg-white ${errors.gender ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Password *</label>
                  <input type="password" placeholder="Min 6 characters" value={form.password}
                    onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: ""}); }}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.password ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}/>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191919] mb-1.5">Confirm Password *</label>
                  <input type="password" placeholder="Repeat password" value={form.confirm}
                    onChange={e => { setForm({...form, confirm: e.target.value}); setErrors({...errors, confirm: ""}); }}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.confirm ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}/>
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors disabled:opacity-60">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[#A3A3A3] mt-6">
            Already registered?{" "}
            <Link href={`/patient/login${redirect !== "/patient/dashboard" ? `?redirect=${redirect}` : ""}`} className="text-[#14967F] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-[#A3A3A3] hover:text-[#14967F]">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}

export default function PatientRegister() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
