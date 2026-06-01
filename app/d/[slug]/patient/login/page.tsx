"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || `/d/${slug}/patient/dashboard`;

  const [doctorName, setDoctorName] = useState("");
  const [step, setStep] = useState<"phone" | "password">("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient().from("doctors").select("name").eq("slug", slug).single()
      .then(({ data }) => { if (data) setDoctorName(data.name); });
  }, [slug]);

  const handlePhoneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g,"").length < 10) { setError("Enter a valid number"); return; }
    setError(""); setStep("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) { setError("Enter your password"); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const email = `${phone.replace(/\D/g,"")}@patient.docapp.local`;
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError("Invalid phone or password"); setLoading(false); return; }
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href={`/d/${slug}`} className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#14967F] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#191919] text-sm">{doctorName || "..."}</span>
          </Link>
          <h1 className="text-xl font-bold text-[#191919]">Patient Login</h1>
          <p className="text-[#6b7280] text-sm mt-1">Sign in to book and manage appointments</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm">
          {step === "phone" ? (
            <form onSubmit={handlePhoneContinue} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Mobile Number</label>
                <input type="tel" autoFocus value={phone}
                  onChange={e => { setPhone(e.target.value); setError(""); }}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-[#191919] text-sm placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" className="w-full bg-[#14967F] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#0d7a66]">
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <button type="button" onClick={() => { setStep("phone"); setError(""); }}
                  className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#191919] mb-3">
                  ← {phone}
                </button>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} autoFocus value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-[#191919] text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#6b7280] text-xs">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#14967F] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#0d7a66] disabled:opacity-60">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-[#6b7280]">
              New patient?{" "}
              <Link href={`/d/${slug}/patient/register?redirect=${redirect}`} className="text-[#14967F] font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
