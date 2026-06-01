"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the session in the URL hash after reset link click
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/patient/login?reset=1");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F4F4F5] flex items-center justify-center mx-auto mb-5 animate-pulse">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-xl font-bold text-[#191919] mb-2">Verifying reset link...</h2>
          <p className="text-sm text-[#6b7280]">Please wait while we verify your reset link.</p>
          <p className="text-xs text-[#A3A3A3] mt-4">
            Link expired?{" "}
            <Link href="/patient/forgot-password" className="text-[#14967F] hover:underline">Request new link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#14967F] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="font-bold text-[#191919]">Dr. Jahangir Patient Portal</span>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5f2] flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#191919] mb-1">Set New Password</h1>
          <p className="text-[#6b7280] text-sm mb-6">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#191919] mb-1.5">New Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${error ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}
                autoFocus/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#191919] mb-1.5">Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm}
                onChange={e => { setForm({ ...form, confirm: e.target.value }); setError(""); }}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${error ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}/>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors disabled:opacity-60">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
