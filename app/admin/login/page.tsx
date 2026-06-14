"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/PasswordInput";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Email and password required"); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-[#F4F4F5]">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #191919 0%, #2d2d2d 100%)" }}>
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "white" }}>Book<span style={{ color: "#14967F" }}>My</span>Doc</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Doctor<br/>Dashboard</h2>
          <p className="text-white/60 mb-8 leading-relaxed">Manage appointments, prescriptions, patients, and your clinic — all in one place.</p>
          <div className="space-y-3">
            {["Manage real-time appointment bookings","Write and share prescriptions securely","Track patient history and vitals","View revenue and analytics"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#14967F] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs relative z-10">BookMyDoc Platform</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 justify-center lg:hidden mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#191919] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#191919" }}>Book<span style={{ color: "#14967F" }}>My</span>Doc</span>
          </Link>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#191919] flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#191919] mb-1">Doctor Login</h1>
            <p className="text-[#6b7280] text-sm mb-8">Sign in to your clinic dashboard</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Email Address</label>
                <input type="email" placeholder="doctor@example.com" value={form.email}
                  onChange={e => { setForm({...form, email: e.target.value}); setError(""); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#191919] text-sm" autoFocus/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Password</label>
                <PasswordInput value={form.password}
                  onChange={v => { setForm({...form, password: v}); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#191919] text-sm"/>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#191919] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#2d2d2d] transition-colors disabled:opacity-60">
                {loading ? "Signing in..." : "Sign In to Dashboard"}
              </button>
            </form>

            <p className="text-center text-sm text-[#A3A3A3] mt-6">
              New doctor?{" "}
              <Link href="/admin/register" className="text-[#14967F] font-semibold hover:underline">Register clinic →</Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-[#A3A3A3] hover:text-[#14967F]">← Back to website</Link>
          </div>
          <p className="text-center text-xs text-[#A3A3A3] mt-2">
            Patient? Visit your doctor&apos;s portal to log in.
          </p>
        </div>
      </div>
    </div>
  );
}
