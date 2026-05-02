"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/patient/dashboard";

  const [step, setStep] = useState<"phone" | "password">("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) { setError("Enter a valid mobile number"); return; }
    setError("");
    setStep("password");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) { setError("Enter your password"); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      // Store simple auth flag
      if (typeof window !== "undefined") localStorage.setItem("patient_auth", JSON.stringify({ phone, name: "Patient" }));
      router.push(redirect);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-[#F4F4F5]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{background:"linear-gradient(145deg, #14967F 0%, #0a6357 100%)"}}>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 70% 30%, white 0%, transparent 50%)"}}></div>
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="text-white font-bold">Dr. Jahangir</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Your Health,<br/>Our Priority</h2>
          <p className="text-white/70 mb-8 leading-relaxed">Access your prescriptions, track appointments, and submit health problems — all from your phone.</p>
          <div className="space-y-3">
            {["View & Download Prescriptions securely","Track appointment status in real-time","Submit symptoms with voice or file upload","Pay easily via SSLCommerz or bKash"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FAD069] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#191919" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10">© 2025 Dr. Jahangir Alam Chowdhury · Chittagong</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#191919]">Dr. Jahangir</span>
          </Link>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            {/* Progress dots */}
            <div className="flex items-center gap-2 mb-8">
              {["phone","password"].map((s, i) => (
                <div key={s} className={`h-1 rounded-full transition-all ${step === s || (i === 0) ? "flex-1 bg-[#14967F]" : "w-8 bg-gray-200"}`}></div>
              ))}
            </div>

            {step === "phone" ? (
              <>
                <h1 className="text-2xl font-bold text-[#191919] mb-1">Welcome back</h1>
                <p className="text-[#6b7280] text-sm mb-8">Enter your mobile number to continue</p>
                <form onSubmit={handlePhoneContinue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191919] mb-2">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 border-2 border-gray-100 rounded-xl px-3 py-3 bg-[#F4F4F5] flex-shrink-0">
                        <span className="text-sm">🇧🇩</span>
                        <span className="text-sm font-semibold text-[#191919]">+880</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setError(""); }}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-[#191919] text-sm transition-colors"
                        autoFocus
                        maxLength={11}
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                    <p className="text-[#A3A3A3] text-xs mt-2">We&apos;ll verify your identity in the next step.</p>
                  </div>
                  <button type="submit" className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors">
                    Continue →
                  </button>
                </form>
              </>
            ) : (
              <>
                <button onClick={() => { setStep("phone"); setError(""); }} className="flex items-center gap-1.5 text-[#A3A3A3] text-sm mb-6 hover:text-[#191919] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  Back
                </button>
                <h1 className="text-2xl font-bold text-[#191919] mb-1">Enter Password</h1>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#e8f5f2] flex items-center justify-center text-sm">📱</div>
                  <p className="text-[#6b7280] text-sm">+880 {phone}</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-[#191919]">Password</label>
                      <a href="#" className="text-xs text-[#14967F] hover:underline">Forgot password?</a>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#14967F] text-[#191919] text-sm"
                      autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors disabled:opacity-60">
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-[#A3A3A3] mt-6">
              New patient?{" "}
              <Link href={`/patient/register${redirect !== "/patient/dashboard" ? `?redirect=${redirect}` : ""}`} className="text-[#14967F] font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-[#A3A3A3] hover:text-[#14967F] transition-colors">← Back to website</Link>
          </div>
          <p className="text-center text-xs text-[#A3A3A3] mt-2">
            Doctor?{" "}
            <Link href="/admin/dashboard" className="text-[#14967F] hover:underline">Admin login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatientLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
