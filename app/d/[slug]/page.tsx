import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Doctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
  hospital?: string;
  address?: string;
  city?: string;
  bio?: string;
  photo_url?: string;
  hours?: Record<string, string>;
  services?: string[];
  stats?: { patients: string; experience: string; rating: string; reviews: string };
  plan?: string;
  active?: boolean;
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("doctors").select("name, specialty, city").eq("slug", slug).eq("active", true).single();
  if (!data) return { title: "Doctor Not Found" };
  return {
    title: `${data.name} — ${data.specialty} | BookMyDoc`,
    description: `Book an appointment with ${data.name}, ${data.specialty}${data.city ? " in " + data.city : ""}.`,
  };
}

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, slug, name, specialty, email, phone, hospital, address, city, bio, photo_url, hours, services, stats, plan, active")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!doctor) notFound();

  const doc = doctor as Doctor;

  const services: string[] = doc.services ?? ["General Consultation"];
  const stats = doc.stats ?? { patients: "0", experience: "0", rating: "5.0", reviews: "0" };
  const hours: Record<string, string> = doc.hours ?? {
    Sat: "9:00 AM – 2:00 PM",
    Sun: "9:00 AM – 12:00 PM",
    Mon: "9:00 AM – 5:00 PM",
    Tue: "9:00 AM – 5:00 PM",
    Wed: "9:00 AM – 5:00 PM",
    Thu: "9:00 AM – 5:00 PM",
    Fri: "Closed",
  };

  const initials = doc.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const lastName = doc.name.split(" ").slice(-1)[0];

  return (
    <div className="min-h-screen bg-[#F4F4F5]">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#14967F] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="font-bold text-[#191919] text-sm">{doc.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/d/${doc.slug}/patient/login`} className="text-sm text-[#6b7280] hover:text-[#191919] hidden sm:block">Patient Login</Link>
            <Link href={`/d/${doc.slug}/book`}
              className="bg-[#14967F] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#0d7a66] transition-colors">
              Book Appointment
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Photo / Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#14967F] flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 overflow-hidden shadow-lg shadow-[#14967F]/20">
              {doc.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.photo_url} alt={doc.name} className="w-full h-full object-cover"/>
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-[#e8f5f2] text-[#14967F] rounded-full px-3 py-1 text-xs font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14967F] animate-pulse"></span>
                Accepting Patients
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191919] mb-1">{doc.name}</h1>
              <p className="text-[#14967F] font-semibold mb-2">{doc.specialty}</p>
              {doc.hospital && <p className="text-[#6b7280] text-sm">🏥 {doc.hospital}</p>}
              {(doc.address || doc.city) && (
                <p className="text-[#6b7280] text-sm mt-0.5">📍 {[doc.address, doc.city].filter(Boolean).join(", ")}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
                <Link href={`/d/${doc.slug}/book`}
                  className="bg-[#14967F] text-white rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-[#0d7a66] transition-colors shadow-md shadow-[#14967F]/20">
                  Book Appointment
                </Link>
                {doc.phone && (
                  <a href={`tel:${doc.phone}`}
                    className="border-2 border-gray-100 text-[#191919] rounded-xl px-6 py-2.5 text-sm font-semibold hover:border-[#14967F] hover:text-[#14967F] transition-colors">
                    📞 {doc.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Stats column */}
            <div className="flex sm:flex-col gap-3 flex-shrink-0">
              {[
                { label: "Patients", value: stats.patients + "+" },
                { label: "Experience", value: stats.experience + " yrs" },
                { label: "Rating", value: "⭐ " + stats.rating },
              ].map((s, i) => (
                <div key={i} className="bg-[#F4F4F5] rounded-2xl px-4 py-3 text-center min-w-[84px]">
                  <p className="font-bold text-[#191919] text-sm">{s.value}</p>
                  <p className="text-[10px] text-[#A3A3A3] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto">
            {["About", "Services", "Schedule", "Book"].map(tab => (
              <a key={tab} href={`#${tab.toLowerCase()}`}
                className="text-sm font-medium text-[#6b7280] hover:text-[#14967F] py-4 border-b-2 border-transparent hover:border-[#14967F] transition-colors whitespace-nowrap">
                {tab}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: About + Services + Book */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            <div id="about" className="bg-white rounded-2xl p-6">
              <h2 className="font-bold text-[#191919] mb-3">About Dr. {lastName}</h2>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                {doc.bio ?? `${doc.name} is a specialist in ${doc.specialty} based in ${doc.city ?? "Bangladesh"}. With ${stats.experience}+ years of clinical experience, they have served over ${stats.patients} patients with dedication and expertise. Accepting new patients for both in-person and online consultations.`}
              </p>
            </div>

            {/* Services */}
            <div id="services" className="bg-white rounded-2xl p-6">
              <h2 className="font-bold text-[#191919] mb-4">Services Offered</h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {services.map((service, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F4F5] hover:bg-[#e8f5f2] transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-[#14967F] flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-sm font-medium text-[#191919]">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book CTA */}
            <div id="book" className="bg-[#14967F] rounded-2xl p-6 sm:p-8 text-white">
              <h2 className="font-bold text-xl mb-2">Book an Appointment</h2>
              <p className="text-white/70 text-sm mb-5">Select your preferred date and time slot. Instant confirmation for every booking.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/d/${doc.slug}/book`}
                  className="flex-1 text-center bg-white text-[#14967F] rounded-xl py-3.5 font-bold text-sm hover:bg-gray-50 transition-colors">
                  🏥 In-Person Visit
                </Link>
                <Link href={`/d/${doc.slug}/book?type=online`}
                  className="flex-1 text-center bg-white/20 text-white border border-white/30 rounded-xl py-3.5 font-semibold text-sm hover:bg-white/30 transition-colors">
                  💻 Online Consultation
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-white/50 text-xs">
                <span>✓ Instant confirmation</span>
                <span>✓ No registration fee</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right: Schedule + Contact + Patient Login */}
          <div className="space-y-5">

            {/* Schedule */}
            <div id="schedule" className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-[#191919] text-sm mb-4">Working Hours</h3>
              <div className="space-y-2.5">
                {Object.entries(hours).map(([day, time]) => {
                  const isClosed = time === "Closed" || time === "—";
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#191919] w-10">{day}</span>
                      {isClosed ? (
                        <span className="text-xs text-red-400 font-medium">Closed</span>
                      ) : (
                        <span className="text-xs text-[#6b7280]">{time}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link href={`/d/${doc.slug}/book`}
                className="w-full mt-5 block text-center bg-[#14967F] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0d7a66] transition-colors">
                See Available Slots →
              </Link>
            </div>

            {/* Contact */}
            {(doc.hospital || doc.phone || doc.email) && (
              <div className="bg-white rounded-2xl p-5">
                <h3 className="font-bold text-[#191919] text-sm mb-4">Contact</h3>
                <div className="space-y-3">
                  {doc.hospital && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0">🏥</span>
                      <div>
                        <p className="text-xs font-semibold text-[#191919]">{doc.hospital}</p>
                        {doc.address && <p className="text-[10px] text-[#A3A3A3] mt-0.5">{doc.address}{doc.city ? `, ${doc.city}` : ""}</p>}
                      </div>
                    </div>
                  )}
                  {doc.phone && (
                    <a href={`tel:${doc.phone}`} className="flex items-center gap-2.5 hover:text-[#14967F] transition-colors">
                      <span className="text-base">📞</span>
                      <span className="text-xs text-[#14967F] font-medium">{doc.phone}</span>
                    </a>
                  )}
                  {doc.email && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">✉️</span>
                      <span className="text-xs text-[#6b7280]">{doc.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient portal nudge */}
            <div className="bg-[#F4F4F5] rounded-2xl p-5">
              <h3 className="font-bold text-[#191919] text-sm mb-1.5">Already a Patient?</h3>
              <p className="text-xs text-[#6b7280] mb-3">Track appointments, download prescriptions, and manage your records.</p>
              <Link href={`/d/${doc.slug}/patient/login`}
                className="block text-center border-2 border-[#14967F] text-[#14967F] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#e8f5f2] transition-colors">
                Patient Login →
              </Link>
            </div>

            {/* Powered by BookMyDoc */}
            <div className="bg-[#191919] rounded-2xl p-4 text-center">
              <p className="text-white/40 text-[10px] mb-1">Powered by</p>
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-5 h-5 rounded bg-[#14967F] flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "white" }}>Book<span style={{ color: "#14967F" }}>My</span>Doc</span>
              </div>
              <Link href="/" className="text-[#14967F] text-[10px] mt-1 block hover:underline">Create your own portal →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
