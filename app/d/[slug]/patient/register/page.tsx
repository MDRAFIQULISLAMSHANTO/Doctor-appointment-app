"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || `/d/${slug}/patient/dashboard`;

  const [doctorName, setDoctorName] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient().from("doctors").select("name").eq("slug", slug).single()
      .then(({ data }) => { if (data) setDoctorName(data.name); });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.phone.replace(/\D/g,"").length < 10) { setError("Enter a valid mobile number"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/patient/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone.replace(/\D/g,""), name: form.name, age: form.age, gender: form.gender, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

    // Auto sign in after register
    const supabase = createClient();
    const email = `${form.phone.replace(/\D/g,"")}@patient.docapp.local`;
    await supabase.auth.signInWithPassword({ email, password: form.password });
    router.push(redirect);
    router.refresh();
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href={`/d/${slug}`} className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#14967F] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#191919] text-sm">{doctorName || "..."}</span>
          </Link>
          <h1 className="text-xl font-bold text-[#191919]">Create Account</h1>
          <p className="text-[#6b7280] text-sm mt-1">Register as a patient</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-1">Full Name *</label>
              <input type="text" required value={form.name} onChange={set("name")} placeholder="Your full name"
                className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-1">Mobile Number *</label>
              <input type="tel" required value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX"
                className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1">Age</label>
                <input type="number" value={form.age} onChange={set("age")} placeholder="25" min="1" max="120"
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] mb-1">Gender</label>
                <select value={form.gender} onChange={set("gender")}
                  className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]">
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-1">Password * <span className="font-normal text-[#A3A3A3]">(min 6 chars)</span></label>
              <input type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" minLength={6}
                className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-1">Confirm Password *</label>
              <input type="password" required value={form.confirm} onChange={set("confirm")} placeholder="••••••••"
                className="w-full bg-[#F4F4F5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14967F]"/>
            </div>

            {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-2.5 text-xs">{error}</div>}

            <button type="submit" disabled={loading || !form.name || !form.phone || !form.password || !form.confirm}
              className="w-full bg-[#14967F] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#0d7a66] disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-[#6b7280]">
              Already registered?{" "}
              <Link href={`/d/${slug}/patient/login?redirect=${redirect}`} className="text-[#14967F] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={null}><RegisterForm /></Suspense>;
}
