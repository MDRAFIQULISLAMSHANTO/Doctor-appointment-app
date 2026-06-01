"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function detectType(value: string): "doctor" | "patient" {
  return value.includes("@") ? "doctor" : "patient";
}

function LoginForm() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientRedirect = searchParams.get("redirect") || `/${slug}/patient/dashboard`;

  const [doctorName, setDoctorName] = useState("");
  const [step, setStep] = useState<"id" | "password">("id");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginType = detectType(identifier);

  useEffect(() => {
    createClient().from("doctors").select("name").eq("slug", slug).single()
      .then(({ data }) => { if (data) setDoctorName(data.name); });
  }, [slug]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();
    if (!val) { setError("Enter phone number or email"); return; }
    if (loginType === "patient" && val.replace(/\D/g, "").length < 10) {
      setError("Enter a valid phone number"); return;
    }
    setError(""); setStep("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) { setError("Enter your password"); return; }
    setLoading(true); setError("");

    const supabase = createClient();

    if (loginType === "doctor") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });
      if (authError) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      const phone = identifier.trim().replace(/\D/g, "");
      const email = `${phone}@patient.docapp.local`;
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Invalid phone or password");
        setLoading(false);
        return;
      }
      router.push(patientRedirect);
      router.refresh();
    }
  };

  const SERIF = { fontFamily: "'Noto Serif', ui-serif, Georgia, serif", letterSpacing: "-0.02em" } as const;
  const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f6f3f1" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${slug}`} className="inline-flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#14967F] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#242424] text-sm" style={MONO}>{doctorName || "..."}</span>
          </Link>
          <h1 className="text-2xl text-[#242424]" style={SERIF}>Sign In</h1>
          <p className="text-[#797776] text-sm mt-1.5" style={MONO}>
            {step === "id"
              ? "Enter phone number or email address"
              : loginType === "doctor"
                ? `Doctor login · ${identifier}`
                : `Patient login · ${identifier}`}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 border" style={{ borderColor: "rgba(36,36,36,0.08)" }}>

          {step === "id" ? (
            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#797776] mb-1.5 uppercase tracking-wide" style={MONO}>
                  Phone or Email
                </label>
                <input
                  type="text" autoFocus value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(""); }}
                  placeholder="01XXXXXXXXX or doctor@email.com"
                  className="w-full rounded-xl px-4 py-3 text-[#242424] text-sm placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#242424] border-2 border-transparent"
                  style={{ background: "rgba(36,36,36,0.05)" }}
                />
                {identifier && (
                  <p className="text-[10px] mt-1.5 text-[#797776]" style={MONO}>
                    {loginType === "doctor" ? "🩺 Doctor account detected" : "👤 Patient account detected"}
                  </p>
                )}
              </div>
              {error && <p className="text-red-500 text-xs" style={MONO}>{error}</p>}
              <button type="submit"
                className="w-full bg-[#242424] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#1a1a1a] transition-colors">
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <button type="button" onClick={() => { setStep("id"); setPassword(""); setError(""); }}
                  className="flex items-center gap-1.5 text-xs text-[#797776] hover:text-[#242424] mb-4 transition-colors" style={MONO}>
                  ← Change
                </button>
                <label className="block text-xs font-semibold text-[#797776] mb-1.5 uppercase tracking-wide" style={MONO}>
                  Password
                </label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} autoFocus value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 text-[#242424] text-sm pr-14 focus:outline-none focus:ring-2 focus:ring-[#242424] border-2 border-transparent"
                    style={{ background: "rgba(36,36,36,0.05)" }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#797776] text-xs" style={MONO}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs" style={MONO}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#242424] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#1a1a1a] disabled:opacity-60 transition-colors">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {step === "id" && loginType !== "doctor" && (
            <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "rgba(36,36,36,0.08)" }}>
              <p className="text-sm text-[#797776]" style={MONO}>
                New patient?{" "}
                <Link href={`/${slug}/register?redirect=${patientRedirect}`}
                  className="text-[#242424] font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-[#797776] mt-6" style={MONO}>
          <Link href={`/${slug}`} className="hover:text-[#242424]">← Back to {doctorName || "portal"}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
