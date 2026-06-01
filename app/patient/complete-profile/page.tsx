"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function CompleteProfileForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/patient/dashboard";

  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [form, setForm] = useState({ phone: "", name: "", age: "", gender: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/patient/login"); return; }
      setUser({
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      });
      setForm(f => ({ ...f, name: user.user_metadata?.full_name || user.user_metadata?.name || "" }));
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const cleaned = form.phone.replace(/\D/g, "");
    if (cleaned.length < 10) errs.phone = "Valid mobile number required";
    if (!form.name.trim()) errs.name = "Name required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/patient/login"); return; }

    const res = await fetch("/api/auth/patient/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        phone: cleaned,
        name: form.name,
        age: form.age || null,
        gender: form.gender || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErrors({ phone: data.error || "Failed to save profile" });
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  };

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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#191919] mb-1">Complete Your Profile</h1>
          <p className="text-[#6b7280] text-sm mb-1">
            Signed in as <span className="font-medium text-[#191919]">{user?.email}</span>
          </p>
          <p className="text-[#6b7280] text-sm mb-6">Add your phone number to finish registration.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#191919] mb-1.5">Full Name *</label>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-300" : "border-gray-100 focus:border-[#14967F]"}`}/>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191919] mb-1.5">
                Mobile Number * <span className="text-[#A3A3A3] font-normal">(used for appointment notifications)</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 border-2 border-gray-100 rounded-xl px-3 py-3 bg-[#F4F4F5] flex-shrink-0">
                  <span className="text-sm">🇧🇩</span>
                  <span className="text-sm font-semibold text-[#191919]">+880</span>
                </div>
                <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                  onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-100 focus:border-[#14967F]"}`}
                  maxLength={11} autoFocus/>
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Age</label>
                <input type="number" placeholder="Age" value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm"
                  min={1} max={120}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191919] mb-1.5">Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#14967F] focus:outline-none text-sm bg-white">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#14967F] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a66] transition-colors disabled:opacity-60">
              {loading ? "Saving..." : "Complete Registration →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfile() {
  return <Suspense><CompleteProfileForm /></Suspense>;
}
