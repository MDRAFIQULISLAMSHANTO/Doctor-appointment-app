"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, Phone, Mail, MapPin, Star, Menu, X, Check,
  ArrowRight, ArrowUpRight, ShieldCheck, Award, Stethoscope,
  Activity, ChevronLeft, ChevronRight, Plus, Minus,
  Droplets, Sparkles, Scan, Smile, Gem, Heart, Brain, Eye,
} from "lucide-react";

const SERIF = { fontFamily: "'Noto Serif', ui-serif, Georgia, serif", letterSpacing: "-0.02em" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;
const SANS = { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.01em" } as const;

const SERVICE_ICONS = [Droplets, Sparkles, Scan, Smile, Activity, Gem, Heart, Brain, Eye, Stethoscope];
const SERVICE_GRADIENTS = [
  "linear-gradient(135deg,rgba(160,181,235,0.85),rgba(167,252,205,0.85))",
  "linear-gradient(135deg,rgba(255,209,191,0.85),rgba(255,148,115,0.85))",
  "linear-gradient(135deg,rgba(226,193,97,0.75),rgba(243,122,10,0.75))",
  "linear-gradient(135deg,rgba(167,252,205,0.85),rgba(160,181,235,0.85))",
  "linear-gradient(135deg,rgba(255,148,115,0.5),rgba(160,181,235,0.6),rgba(167,252,205,0.45))",
];

type Doctor = {
  id: string; slug: string; name: string; specialty: string;
  phone?: string; hospital?: string; address?: string; city?: string; bio?: string;
  photo_url?: string; logo_url?: string; theme_color?: string;
  hours?: Record<string, string>; services?: string[];
  stats?: { patients: string; experience: string; rating: string; reviews: string };
};

type Props = {
  doc: Doctor;
  brand: string;
  brandLight: string;
};

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];

function isSunday(d: Date) { return d.getDay() === 0; }
function isPast(d: Date) { const t = new Date(); t.setHours(0,0,0,0); return d < t; }
function isFullyBooked(d: Date) { return (d.getDate() * (d.getMonth() + 1)) % 6 === 0; }
function isAvailable(d: Date) { return !isSunday(d) && !isPast(d) && !isFullyBooked(d); }

function MiniCalendar({ slug, brand }: { slug: string; brand: string }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ...Array(totalCells - startOffset - daysInMonth).fill(null),
  ];
  const monthLabel = viewMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const slots = selectedDate ? TIME_SLOTS.filter((_, i) => i % (selectedDate.getDate() % 2 === 0 ? 1 : 2) === 0) : [];

  return (
    <div style={MONO}>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[14px] text-[#000]" style={SERIF}>{monthLabel}</span>
        <div className="flex gap-1.5">
          <button onClick={() => { setViewMonth(new Date(year, month - 1, 1)); setSelectedDate(null); setSelectedTime(""); }}
            className="w-8 h-8 rounded-full border border-[#242424] flex items-center justify-center text-[#242424] hover:bg-[#242424] hover:text-[#f6f3f1] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setViewMonth(new Date(year, month + 1, 1)); setSelectedDate(null); setSelectedTime(""); }}
            className="w-8 h-8 rounded-full border border-[#242424] flex items-center justify-center text-[#242424] hover:bg-[#242424] hover:text-[#f6f3f1] transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#797776] py-2 tracking-[0.05em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const avail = isAvailable(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          return (
            <button key={i} disabled={!avail} onClick={() => avail && setSelectedDate(date)}
              className={[
                "relative mx-auto flex items-center justify-center w-10 h-10 rounded-full text-[14px] transition-colors",
                isSelected ? "text-white" : avail
                  ? "text-[#242424] hover:opacity-80 cursor-pointer"
                  : "text-[#797776]/40 cursor-not-allowed",
              ].join(" ")}
              style={isSelected ? { background: brand } : avail ? { background: hexToRgba(brand, 0.15) } : {}}>
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#242424]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mt-6 border-t border-[#242424]/10 pt-5">
          <p className="text-[12px] text-[#797776] uppercase tracking-[0.05em] mb-3">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <div className="grid grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
            {slots.map((t) => (
              <button key={t} onClick={() => setSelectedTime(t)}
                className="px-2 py-2.5 rounded-[100px] text-[12px] border transition-colors text-center"
                style={selectedTime === t
                  ? { background: brand, color: "#fff", borderColor: brand }
                  : { borderColor: "#242424", color: "#242424" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-[#242424]/10 flex items-center justify-between gap-4">
        <p className="text-[11px] text-[#797776]">
          {selectedDate && selectedTime
            ? `${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${selectedTime}`
            : selectedDate ? "Now pick a time →" : "Select an available date"}
        </p>
        <Link href={`/${slug}/appointment${selectedDate && selectedTime
          ? `?date=${selectedDate.toISOString().slice(0,10)}&time=${selectedTime}`
          : ""}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[100px] text-[13px] transition-colors text-white"
          style={{ background: selectedDate && selectedTime ? brand : "#cccccc" }}>
          {selectedDate && selectedTime ? "Book this slot" : "Continue"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

const DAY_SHORT: Record<number, string> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

function getNextSlot(hours: Record<string, string>): { label: string; date: string } | null {
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dayName = DAY_SHORT[d.getDay()];
    const timeStr = hours[dayName];
    if (!timeStr || timeStr === "Closed" || timeStr === "—") continue;
    const startMatch = timeStr.match(/^(\d+:\d+\s*(?:AM|PM))/i);
    const firstSlot = startMatch ? startMatch[1] : "9:00 AM";
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label: `${label} · ${firstSlot}`, date: dateStr };
  }
  return null;
}

export default function DoctorLanding({ doc, brand, brandLight }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const services = doc.services ?? ["General Consultation"];
  const stats = doc.stats ?? { patients: "500", experience: "5", rating: "4.9", reviews: "120" };
  const hours = doc.hours ?? {
    Sat: "9:00 AM – 2:00 PM", Sun: "9:00 AM – 12:00 PM",
    Mon: "9:00 AM – 5:00 PM", Tue: "9:00 AM – 5:00 PM",
    Wed: "9:00 AM – 5:00 PM", Thu: "9:00 AM – 5:00 PM", Fri: "Closed",
  };
  const lastName = doc.name.split(" ").slice(-1)[0];
  const initials = doc.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const nextSlot = getNextSlot(hours);

  const faqs = [
    { q: "Do I need to register to book?", a: "No. You can book as a guest — just your name, phone number, and preferred slot. Patient portal registration is optional, offered after booking." },
    { q: "How quickly is an appointment confirmed?", a: "Booking is instant. You receive a serial number immediately. The doctor's team may follow up by phone for additional details." },
    { q: "Can I book for someone else?", a: "Yes. During booking you can enter the patient's name and details. The contact number can be yours or the patient's." },
    { q: "How do I get my prescription?", a: "If you have a patient portal account, prescriptions are available to download from your dashboard. Guest patients receive them directly from the clinic." },
    { q: "Can I cancel or reschedule?", a: "Contact the clinic directly by phone. The number is listed below." },
  ];

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  const navLinks = ["Services", "About", "Appointment", "FAQ"];

  return (
    <div className="min-h-screen bg-[#f6f3f1] text-[#000]" style={MONO}>

      {/* NOTIFICATION BAR */}
      {bannerOpen && (
        <div className="text-[#f6f3f1] text-[13px]" style={{ background: "#242424" }}>
          <div className="max-w-[1432px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <p className="truncate">
              <span className="opacity-50 mr-2">●</span>
              Now accepting new patients — book your appointment online in seconds.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => scrollTo("appointment")}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[100px] border border-[#f6f3f1] text-[12px] hover:bg-[#f6f3f1] hover:text-[#242424] transition-colors" style={MONO}>
                Book now <ArrowRight className="w-3 h-3" />
              </button>
              <button onClick={() => setBannerOpen(false)} className="opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#f6f3f1]/90 backdrop-blur-md border-b border-[#242424]/10">
        <div className="max-w-[1432px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2.5">
            {doc.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.logo_url} alt={doc.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#f6f3f1] text-[10px]" style={{ background: brand }}>
                {initials}
              </div>
            )}
            <span className="text-[18px] text-[#000]" style={SERIF}>{doc.name}</span>
          </a>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link}>
                <button onClick={() => scrollTo(link.toLowerCase())}
                  className="px-3 py-2 text-[14px] text-[#242424] hover:underline underline-offset-4">
                  {link}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            {doc.phone && (
              <a href={`tel:${doc.phone}`} className="text-[13px] text-[#4e4d4d] hover:text-[#000] inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                {doc.phone}
              </a>
            )}
            <Link href={`/${doc.slug}/login`}
              className="px-4 py-2.5 rounded-[100px] text-[13px] text-[#242424] border border-[#242424]/30 hover:border-[#242424] transition-colors"
              style={MONO}>
              Login
            </Link>
          </div>

          <button className="md:hidden p-2 text-[#000]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#242424]/10 px-6 py-4 flex flex-col gap-1 bg-[#f6f3f1]">
            {navLinks.map((link) => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase())}
                className="text-sm text-[#000] text-left py-2.5 border-b border-[#242424]/10">
                {link}
              </button>
            ))}
            <Link href={`/${doc.slug}/login`}
              className="py-2.5 border-b border-[#242424]/10 text-sm text-[#242424]"
              onClick={() => setMobileOpen(false)}>
              Login
            </Link>
            <button onClick={() => { scrollTo("appointment"); setMobileOpen(false); }}
              className="mt-3 w-full px-5 py-3 rounded-[100px] text-sm text-white" style={{ background: brand }}>
              Book Appointment
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[760px] h-[420px] opacity-50 blur-3xl rounded-full"
          style={{ background: `radial-gradient(ellipse, ${hexToRgba(brand, 0.4)} 0%, transparent 70%)` }} />
        <div className="max-w-[1432px] mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

          {/* Photo card */}
          <div className="lg:col-span-5">
            <div className="rounded-[40px] p-0 relative overflow-hidden aspect-[4/5]" style={{ background: brandLight }}>
              {doc.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.photo_url} alt={doc.name} className="absolute inset-0 w-full h-full object-cover rounded-[40px]" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[80px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${brand}, ${hexToRgba(brand, 0.6)})` }}>
                  {initials}
                </div>
              )}
              <div className="absolute top-8 left-8 px-3 py-1.5 rounded-[2000px] border border-[#242424] bg-[#f6f3f1] text-[11px] tracking-[0.05em] uppercase" style={MONO}>
                {doc.specialty}
              </div>
              <div className="absolute bottom-8 right-8 px-3 py-1.5 rounded-[2000px] border border-[#242424] bg-[#f6f3f1] text-[11px] tracking-[0.05em] uppercase" style={MONO}>
                {stats.experience}+ years
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[2000px] border border-[#242424] text-[12px] tracking-[0.05em] uppercase text-[#242424] mb-8 bg-[#f6f3f1]/60 backdrop-blur-sm" style={MONO}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: brand }} />
              Accepting new patients
            </div>
            <h1 className="text-[40px] lg:text-[56px] text-[#000]" style={SERIF}>
              {doc.name},<br />
              <em className="italic text-[#4e4d4d]">{doc.specialty}.</em>
            </h1>
            {(doc.hospital || doc.city) && (
              <p className="mt-4 text-[14px] text-[#797776] flex items-center gap-2" style={MONO}>
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                {[doc.hospital, doc.address, doc.city].filter(Boolean).join(" · ")}
              </p>
            )}

            <p className="mt-8 text-[16px] text-[#4e4d4d] leading-[1.55] max-w-[60ch]" style={SANS}>
              {doc.bio ?? `${doc.name} is a specialist in ${doc.specialty} with ${stats.experience}+ years of clinical experience. Serving over ${stats.patients} patients with dedication and expertise. Accepting new patients for both in-person and online consultations.`}
            </p>

            {/* Next available slot */}
            {nextSlot && (
              <div className="mt-7 inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#242424]/15 bg-white/60 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: hexToRgba(brand, 0.15) }}>
                  <Calendar className="w-4 h-4" strokeWidth={1.5} style={{ color: brand }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.06em] text-[#797776]" style={MONO}>Next Available</p>
                  <p className="text-[13px] font-semibold text-[#242424]" style={MONO}>{nextSlot.label}</p>
                </div>
                <Link href={`/${doc.slug}/appointment?date=${nextSlot.date}`}
                  className="ml-2 px-3 py-1.5 rounded-[100px] text-[12px] text-white shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: brand }}>
                  Book →
                </Link>
              </div>
            )}

            <div className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                `${doc.specialty}`,
                `${stats.experience}+ years experience`,
                `${stats.patients}+ patients treated`,
                `⭐ ${stats.rating} patient rating`,
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-t border-[#242424]/15 pt-3">
                  <Check className="w-3.5 h-3.5 mt-1 shrink-0" strokeWidth={2} style={{ color: brand }} />
                  <p className="text-[13px] text-[#242424]" style={MONO}>{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("appointment")}
                className="inline-flex items-center gap-2 px-5 py-4 rounded-[100px] text-[14px] text-white hover:opacity-90 transition-opacity"
                style={{ background: brand }}>
                Book an appointment <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo("services")}
                className="inline-flex items-center gap-2 px-5 py-4 rounded-[100px] border border-[#242424] text-[#242424] text-[14px] hover:bg-[#242424] hover:text-[#f6f3f1] transition-colors">
                Browse services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-t border-[#242424]/10">
        <div className="max-w-[1432px] mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-8 mb-14">
            <div className="lg:col-span-5">
              <p className="uppercase text-[11px] tracking-[0.05em] text-[#797776] mb-6" style={MONO}>[02] Services</p>
              <h2 className="text-[40px] lg:text-[56px] text-[#000]" style={SERIF}>
                Comprehensive care,<br /><em className="italic text-[#4e4d4d]">end-to-end.</em>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 self-end">
              <p className="text-[16px] text-[#4e4d4d] leading-[1.5] max-w-[52ch]" style={SANS}>
                Every treatment is tailored to the patient&apos;s needs. Click any service to book directly.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <Link key={svc} href={`/${doc.slug}/appointment`}
                  className="group text-left rounded-[40px] p-10 transition-transform hover:-translate-y-1 duration-300 flex flex-col"
                  style={{ background: hexToRgba(brand, 0.12) }}>
                  <div className="flex items-start justify-between mb-12">
                    <div className="w-14 h-14 rounded-[100px] flex items-center justify-center"
                      style={{ background: SERVICE_GRADIENTS[i % SERVICE_GRADIENTS.length] }}>
                      <Icon className="w-6 h-6 text-[#242424]" strokeWidth={1.25} />
                    </div>
                  </div>
                  <h3 className="text-[24px] text-[#000] mb-3" style={SERIF}>{svc}</h3>
                  <p className="text-[14px] text-[#4e4d4d] leading-[1.4] mb-8" style={SANS}>
                    Professional care by {doc.name}. Book online to reserve your slot.
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] text-[#242424] group-hover:gap-2.5 transition-all" style={MONO}>
                    Book this service <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <section className="border-t border-[#242424]/10">
        <div className="max-w-[1432px] mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: ShieldCheck, label: "Safe & hygienic", sub: "Highest care standards" },
              { Icon: Award, label: `${stats.experience}+ years`, sub: "Clinical experience" },
              { Icon: Stethoscope, label: "Patient-first care", sub: "Gentle, modern techniques" },
              { Icon: Activity, label: `${stats.patients}+ patients`, sub: `⭐ ${stats.rating} avg. rating` },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex flex-col gap-3 border-t border-[#242424]/30 pt-5">
                <Icon className="w-5 h-5 text-[#000]" strokeWidth={1.25} />
                <p className="text-[15px] text-[#000]" style={MONO}>{label}</p>
                <p className="text-[12px] text-[#797776] tracking-[0.05em] uppercase" style={MONO}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-[#242424]/10">
        <div className="max-w-[1432px] mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <p className="uppercase text-[11px] tracking-[0.05em] text-[#797776] mb-6" style={MONO}>[03] About</p>
              <h2 className="text-[40px] lg:text-[52px] text-[#000] mb-6" style={SERIF}>
                Dr. {lastName},<br /><em className="italic text-[#4e4d4d]">{doc.specialty}.</em>
              </h2>
              <p className="text-[16px] text-[#4e4d4d] leading-[1.55] mb-8" style={SANS}>
                {doc.bio ?? `${doc.name} is a specialist in ${doc.specialty} based in ${doc.city ?? "Bangladesh"}. With ${stats.experience}+ years of clinical experience and ${stats.patients}+ patients treated, they bring expertise and genuine care to every consultation.`}
              </p>
              <button onClick={() => scrollTo("appointment")}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-[100px] text-[14px] text-white hover:opacity-90 transition-opacity"
                style={{ background: brand }}>
                Book a consultation <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-7">
              {/* Working hours card */}
              <div className="rounded-[40px] border border-[#242424]/15 bg-white p-8">
                <h3 className="text-[18px] text-[#000] mb-6" style={SERIF}>Working Hours</h3>
                <div className="space-y-0">
                  {Object.entries(hours).map(([day, time]) => {
                    const closed = time === "Closed" || time === "—";
                    return (
                      <div key={day} className="flex items-center justify-between py-3.5 border-b border-[#242424]/10 last:border-0">
                        <span className="text-[14px] text-[#242424] w-12" style={MONO}>{day}</span>
                        {closed ? (
                          <span className="text-[12px] text-[#797776] uppercase tracking-[0.05em]" style={MONO}>Closed</span>
                        ) : (
                          <span className="text-[13px] px-3 py-1 rounded-[100px]" style={{ ...MONO, background: hexToRgba(brand, 0.12), color: brand }}>{time}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Link href={`/${doc.slug}/appointment`}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-[100px] text-[14px] text-white hover:opacity-90 transition-opacity"
                  style={{ background: brand }}>
                  See available slots <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPOINTMENT / BOOKING */}
      <section id="appointment" className="border-t border-[#242424]/10" style={{ background: hexToRgba(brand, 0.06) }}>
        <div className="max-w-[1432px] mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className="uppercase text-[11px] tracking-[0.05em] text-[#797776] mb-6" style={MONO}>[04] Appointment</p>
            <h2 className="text-[40px] lg:text-[56px] text-[#000] mb-8" style={SERIF}>
              Reserve your<br /><em className="italic text-[#4e4d4d]">slot.</em>
            </h2>
            <p className="text-[16px] text-[#4e4d4d] leading-[1.5] mb-10 max-w-[44ch]" style={SANS}>
              Select a date and time slot below. Your booking is instant — serial number assigned immediately.
            </p>
            <div className="space-y-0">
              {[
                ...(doc.hours ? [{ Icon: Clock, title: "Opening hours", sub: Object.entries(doc.hours).filter(([,t]) => t !== "Closed").slice(0,2).map(([d,t]) => `${d}: ${t}`).join(" · ") }] : []),
                ...(doc.phone ? [{ Icon: Phone, title: doc.phone, sub: "Call for emergency" }] : []),
                ...(doc.address ? [{ Icon: MapPin, title: [doc.address, doc.city].filter(Boolean).join(", "), sub: "Clinic address" }] : []),
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-4 py-4 border-t border-[#242424]/15 last:border-b">
                  <Icon className="w-4 h-4 text-[#000] shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[14px] text-[#000]" style={MONO}>{title}</p>
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[#797776] mt-0.5" style={MONO}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#f6f3f1] rounded-[40px] p-8 lg:p-10 border border-[#242424]/15">
              <p className="text-[11px] uppercase tracking-[0.05em] text-[#797776] mb-1" style={MONO}>Step 1 of 2</p>
              <h3 className="text-[24px] text-[#000] mb-8" style={SERIF}>Pick a date & time</h3>
              <MiniCalendar slug={doc.slug} brand={brand} />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="border-t border-[#242424]/10">
        <div className="max-w-[1432px] mx-auto px-6 py-24 lg:py-32">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
            <div>
              <p className="uppercase text-[11px] tracking-[0.05em] text-[#797776] mb-6" style={MONO}>[05] Patient stories</p>
              <h2 className="text-[40px] lg:text-[56px] text-[#000] max-w-[18ch]" style={SERIF}>
                Said back to us, <em className="italic text-[#4e4d4d]">unprompted.</em>
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[2000px] border border-[#242424] text-[12px]" style={MONO}>
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-[#000] text-[#000]" />)}
              <span className="text-[#000] ml-1">{stats.rating} · {stats.reviews}+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { q: `"${doc.name} listened carefully and explained everything. The booking process was incredibly simple — I got a slot the same day."`, n: "Fatema K.", r: "Patient" },
              { q: `"I used to call the clinic 3 times to book. Now I book online in 30 seconds and get my serial number right away. Game-changer."`, n: "Md. Hossain", r: "Returning Patient" },
              { q: `"The online prescription feature is exactly what I needed. I can access my prescription from my phone anytime, anywhere."`, n: "Nasreen A.", r: "Patient" },
            ].map((t) => (
              <div key={t.n} className="rounded-[40px] border border-[#242424]/20 p-8 flex flex-col bg-white">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#000] text-[#000]" />)}
                </div>
                <p className="text-[16px] text-[#000] leading-[1.4] mb-8 flex-1" style={SANS}>{t.q}</p>
                <div className="flex items-center gap-3 pt-6 border-t border-[#242424]/15">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] text-white" style={{ background: brand }}>
                    {t.n[0]}
                  </div>
                  <div style={MONO}>
                    <p className="text-[14px] text-[#000]">{t.n}</p>
                    <p className="text-[11px] text-[#797776] tracking-[0.05em] uppercase">{t.r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#242424]/10">
        <div className="max-w-[1432px] mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="uppercase text-[11px] tracking-[0.05em] text-[#797776] mb-6" style={MONO}>[06] FAQ</p>
            <h2 className="text-[40px] lg:text-[56px] text-[#000]" style={SERIF}>
              Questions, <em className="italic text-[#4e4d4d]">answered.</em>
            </h2>
            {doc.phone && (
              <p className="mt-6 text-[14px] text-[#4e4d4d] leading-[1.5]" style={MONO}>
                Can&apos;t find what you need? Call{" "}
                <a href={`tel:${doc.phone}`} className="text-[#000] underline underline-offset-4">{doc.phone}</a>
              </p>
            )}
          </div>
          <div className="lg:col-span-8">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border-b border-[#4e4d4d]/40">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-6 text-left">
                  <span className="text-[20px] text-[#000]" style={SERIF}>{faq.q}</span>
                  <span className="shrink-0 mt-1">
                    {openFaq === i
                      ? <Minus className="w-4 h-4 text-[#000]" />
                      : <Plus className="w-4 h-4 text-[#000]" />}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="text-[14px] text-[#4e4d4d] leading-[1.5] pb-6 max-w-[60ch]" style={SANS}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section id="contact" className="bg-[#242424] text-[#f6f3f1]">
        <div className="max-w-[1432px] mx-auto px-6 pt-24 lg:pt-32 pb-12">
          <div className="grid lg:grid-cols-12 gap-12 items-end pb-20 border-b border-[#f6f3f1]/15">
            <div className="lg:col-span-7">
              <p className="uppercase text-[11px] tracking-[0.05em] text-[#f6f3f1]/50 mb-6" style={MONO}>[07] Book now</p>
              <h2 className="text-[48px] lg:text-[80px] text-[#f6f3f1] leading-[1.05]" style={SERIF}>
                Ready to meet<br /><em className="italic opacity-70">Dr. {lastName}?</em>
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-4">
              <p className="text-[14px] text-[#f6f3f1]/70 leading-[1.5] max-w-[44ch]" style={SANS}>
                {doc.hospital ? `Located at ${doc.hospital}${doc.city ? `, ${doc.city}` : ""}.` : ""}{" "}
                Book online in seconds. Instant serial number. No registration required.
              </p>
              <div className="flex gap-3 flex-wrap mt-2">
                <Link href={`/${doc.slug}/appointment`}
                  className="px-5 py-4 bg-[#f6f3f1] text-[#242424] rounded-[100px] text-[14px] hover:bg-white transition-colors inline-flex items-center gap-2"
                  style={MONO}>
                  Book online <ArrowRight className="w-4 h-4" />
                </Link>
                {doc.phone && (
                  <a href={`tel:${doc.phone}`}
                    className="px-5 py-4 border border-[#f6f3f1] text-[#f6f3f1] rounded-[100px] text-[14px] hover:bg-[#f6f3f1] hover:text-[#242424] transition-colors inline-flex items-center gap-2"
                    style={MONO}>
                    <Phone className="w-3.5 h-3.5" /> Call now
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
            {[
              ...(doc.address ? [{ Icon: MapPin, label: "Location", value: [doc.address, doc.city].filter(Boolean).join(", ") }] : []),
              ...(doc.hours ? [{ Icon: Clock, label: "Hours", value: "Check schedule above" }] : []),
              ...(doc.phone ? [{ Icon: Phone, label: "Phone", value: doc.phone }] : []),
              { Icon: Mail, label: "Book online", value: `docapp.com/${doc.slug}` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[#f6f3f1]/60" strokeWidth={1.5} />
                  <p className="text-[11px] uppercase tracking-[0.05em] text-[#f6f3f1]/60" style={MONO}>{label}</p>
                </div>
                <p className="text-[14px] text-[#f6f3f1]" style={MONO}>{value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#f6f3f1]/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: brand, color: "#fff" }}>
                {initials}
              </div>
              <span className="text-[13px] text-[#f6f3f1]/80" style={SERIF}>{doc.name}</span>
            </div>
            <p className="text-[11px] text-[#f6f3f1]/40 tracking-[0.05em] uppercase text-center" style={MONO}>
              © 2026 {doc.name} · Powered by DocApp
            </p>
            <div className="flex gap-5">
              {["Privacy", "Terms"].map((link) => (
                <a key={link} href="#" className="text-[12px] text-[#f6f3f1]/50 hover:text-[#f6f3f1] transition-colors" style={MONO}>{link}</a>
              ))}
              <Link href={`/${doc.slug}/login`} className="text-[12px] text-[#f6f3f1]/50 hover:text-[#f6f3f1] transition-colors" style={MONO}>Login</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
