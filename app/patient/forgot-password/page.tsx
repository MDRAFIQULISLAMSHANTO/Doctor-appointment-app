"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [method, setMethod] = useState<"email" | "phone">("phone");
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) { setError("Enter your " + (method === "email" ? "email" : "phone number")); return; }
    setLoading(true);
    setError("");

    if (method === "email") {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/patient/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
      setSent(true);
    } else {
      // Phone reset — derives email from phone and sends reset via Supabase
      const cleaned = value.replace(/\D/g, "");
      const email = `${cleaned}@patient.docapp.local`;
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/patient/reset-password`,
      });
      if (resetError) {
        setError("Phone number not found or not registered");
        setLoading(false);
        return;
      }
      setSent(true);
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#e8f5f2] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h-.08"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#191919] mb-2">Reset Link Sent!</h2>
          {method === "email" ? (
            <p className="text-[#6b7280] text-sm mb-6">Check <strong>{value}</strong> for a password reset link. Click it to set a new password.</p>
          ) : (
            <p className="text-[#6b7280] text-sm mb-6">A reset link has been sent to the email linked to phone <strong>+880 {value}</strong>.</p>
          )}
          <p className="text-xs text-[#A3A3A3] mb-6">Didn't receive it? Check spam folder or try again.</p>
          <div className="flex gap-3">
            <button onClick={() => { setSent(false); setValue(""); }}
              className="flex-1 border-2 border-gray-100 text-[#191919] rounded-xl py-3 text-sm font-medium hover:border-[#14967F]">
              Try Again
            </button>
            <Link href="/patient/login" className="flex-1 bg-[#14967F] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#0d7a66] text-center">
              Back to Login
            </Link>
          </div>
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
          <div className="w-12 h-12 rounded-2xl bg-[#FFF3CD] flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#191919] mb-1">Forgot Password?</h1>
          <p className="text-[#6b7280] text-sm mb-6">We&apos;ll send a reset link to your phone number or email.</p>

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5 bg-[#F4F4F5] rounded-xl p-1">
            {[
              { key: "phone", label: "📱 Phone Number" },
              { key: "email", label: "✉️ Email" },
            ].map(m => (
              <button key={m.key} type="button"
                onClick={() => { setMethod(m.key as "phone" | "email"); setValue(""); setError(""); }}
                className={`py-2 rounded-lg text-sm font-semibold transition-colors ${method === m.key ? "bg-white text-[#191919] shadow-sm" : "text-[#A3A3A3]"}`}>
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === "phone" ? (
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 border-2 border-gray-100 rounded-xl px-3 py-3 bg-[#F4F4F5] flex-shrink-0">
                    <span className="text-sm">🇧🇩</span>
                    <span className="text-sm font-semibold text-[#191919]">+880</span>
                  </div>
                  <input type="tel" placeholder="01XXXXXXXXX" value={value}
                    onChange={e => { setValue(e.target.value); setError(""); }}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${error ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}
                    maxLength={11} autoFocus/>
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                <p className="text-xs text-[#A3A3A3] mt-1.5">Reset link sent to email linked to this number</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Email Address</label>
                <input type="email" placeholder="your@email.com" value={value}
                  onChange={e => { setValue(e.target.value); setError(""); }}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${error ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}
                  autoFocus/>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-sm text-[#A3A3A3] mt-6">
            Remember it?{" "}
            <Link href="/patient/login" className="text-[#14967F] font-semibold hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
