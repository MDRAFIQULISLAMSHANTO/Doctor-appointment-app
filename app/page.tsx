"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Calendar, Check, ChevronDown,
  Clock, Bell, CreditCard, Sparkles, Stethoscope,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const serif = { fontFamily: "'Noto Serif', ui-serif, Georgia, serif", letterSpacing: "-0.02em" };
const mono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
const sans = { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.01em" };

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#242424] px-3 py-1 text-[12px] uppercase"
      style={{ ...mono, letterSpacing: "0.05em" }}>
      {children}
    </span>
  );
}

function FilledButton({ children, className = "", href }: { children: React.ReactNode; className?: string; href?: string }) {
  const cls = `group inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-[14px] text-[#f6f3f1] transition hover:bg-black ${className}`;
  if (href) return <Link href={href} className={cls} style={mono}>{children}</Link>;
  return <button className={cls} style={mono}>{children}</button>;
}

function GhostButton({ children, className = "", href }: { children: React.ReactNode; className?: string; href?: string }) {
  const cls = `inline-flex items-center gap-2 rounded-full border border-[#242424] px-5 py-3 text-[14px] text-[#242424] transition hover:bg-[#242424] hover:text-[#f6f3f1] ${className}`;
  if (href) return <Link href={href} className={cls} style={mono}>{children}</Link>;
  return <button className={cls} style={mono}>{children}</button>;
}

function NotificationBar() {
  return (
    <div className="bg-black text-[#f6f3f1]">
      <div className="mx-auto flex max-w-[1432px] items-center justify-between gap-4 px-6 py-2.5 text-[13px]" style={mono}>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#a7fccd]" />
          <span className="opacity-80">New — Automated appointment reminders now available for all plans.</span>
        </div>
        <a className="hidden items-center gap-1 underline-offset-4 hover:underline sm:inline-flex" href="#">
          Learn more <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f6f3f1]/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1432px] items-center justify-between px-6 py-4">
        <Link href="/"><Logo size={28} /></Link>
        <nav className="hidden items-center gap-1 md:flex" style={mono}>
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how" },
            { label: "Pricing", href: "#pricing" },
          ].map((l) => (
            <a key={l.label} href={l.href}
              className="rounded-full px-3 py-2 text-[14px] text-[#242424] hover:underline underline-offset-4">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/admin/login"
            className="hidden text-[14px] text-[#242424] hover:underline underline-offset-4 sm:inline" style={mono}>
            Sign in
          </Link>
          <GhostButton href="/admin/register">
            Start free <ArrowRight className="h-4 w-4" />
          </GhostButton>
        </div>
      </div>
    </header>
  );
}

function HeroScheduleMock() {
  const slots = [
    { t: "09:00", name: "Sarah Johnson", note: "Consultation · 30m", tone: "mint" },
    { t: "09:45", name: "James Mitchell", note: "Follow-up · 20m", tone: "sky" },
    { t: "10:30", name: "—", note: "Buffer", tone: "muted" },
    { t: "11:00", name: "Emily Clarke", note: "Check-up · 45m", tone: "peach" },
    { t: "13:15", name: "Omar Hassan", note: "Consultation · 30m", tone: "sky" },
  ];
  const tones: Record<string, string> = {
    mint: "bg-[#a7fccd]",
    sky: "bg-[#cfdaf5]",
    peach: "bg-[#ffd1bf]",
    muted: "bg-[#ececea]",
  };
  return (
    <div className="relative">
      <div className="absolute -inset-10 -z-10 rounded-[60px] opacity-70 blur-3xl"
        style={{ background: "linear-gradient(160deg, rgba(255,148,115,0.45) 0%, rgba(160,181,235,0.55) 60%, rgba(167,252,205,0.5) 100%)" }} />
      <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="mb-4 flex items-center justify-between" style={mono}>
          <div className="flex items-center gap-2 text-[13px] text-[#242424]">
            <Calendar className="h-4 w-4" />
            Today&apos;s Schedule
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#797776]">
            <span className="rounded-full bg-[#f6f3f1] px-2 py-1">Dr. Your Name</span>
          </div>
        </div>
        <ul className="space-y-2">
          {slots.map((s, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#f6f3f1]/60 p-3">
              <div className="w-14 shrink-0 text-[12px] text-[#4e4d4d]" style={mono}>{s.t}</div>
              <div className={`h-9 w-1.5 rounded-full ${tones[s.tone]}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] text-[#000]" style={mono}>{s.name}</div>
                <div className="truncate text-[12px] text-[#797776]" style={mono}>{s.note}</div>
              </div>
              {s.tone !== "muted" && (
                <span className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-[#4e4d4d]" style={mono}>
                  Booked
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-black px-4 py-3 text-[#f6f3f1]">
          <div className="flex items-center gap-2 text-[12px]" style={mono}>
            <Bell className="h-3.5 w-3.5" />
            4 patients confirmed · 0 no-shows
          </div>
          <span className="text-[12px]" style={mono}>Live</span>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-black/10 bg-white p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] sm:block">
        <div className="flex items-center gap-2 text-[12px] text-[#242424]" style={mono}>
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#cfdaf5]">
            <Check className="h-3.5 w-3.5" />
          </div>
          <div>
            <div>Emily confirmed</div>
            <div className="text-[#797776]">2 minutes ago</div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 -top-6 hidden rounded-2xl border border-black/10 bg-white p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] md:block">
        <div className="text-[11px] uppercase tracking-[0.05em] text-[#797776]" style={mono}>Today</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[28px]" style={serif}>12</span>
          <span className="text-[12px] text-[#4e4d4d]" style={mono}>appointments</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[520px] opacity-60"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(207,218,245,0.9) 0%, rgba(246,243,241,0) 70%)" }} />
      <div className="mx-auto grid max-w-[1432px] grid-cols-1 gap-12 px-6 pb-24 pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-32 lg:pt-24">
        <div className="lg:col-span-7">
          <Tag>
            <Sparkles className="h-3 w-3" /> Built for independent practices worldwide
          </Tag>
          <h1 className="mt-6 text-[44px] leading-[1.05] text-black sm:text-[64px] lg:text-[78px]" style={serif}>
            Your entire practice,
            <br />
            <span className="italic text-[#4e4d4d]">online</span> in minutes.
          </h1>
          <p className="mt-6 max-w-xl text-[16px] text-[#4e4d4d]" style={sans}>
            BookMyDoc gives every doctor their own patient portal — appointment booking,
            digital prescriptions, patient records, and a branded landing page.
            No receptionist needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <FilledButton href="/admin/register">
              Start free — no credit card <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </FilledButton>
            <GhostButton href="/admin/login">See a demo portal</GhostButton>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[12px] uppercase text-[#797776]"
            style={{ ...mono, letterSpacing: "0.05em" }}>
            <span>Patient privacy protected</span>
            <span className="h-1 w-1 rounded-full bg-[#797776]" />
            <span>No card required</span>
            <span className="h-1 w-1 rounded-full bg-[#797776]" />
            <span>Setup in 10 minutes</span>
          </div>
        </div>
        <div className="lg:col-span-5">
          <HeroScheduleMock />
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const names = [
    "London Family Clinic",
    "NYC Health Partners",
    "Toronto Med Centre",
    "Sydney Specialist",
    "Dubai Health Hub",
    "Berlin Clinic",
  ];
  return (
    <section className="border-y border-black/10 bg-[#f6f3f1]">
      <div className="mx-auto max-w-[1432px] px-6 py-8">
        <p className="text-center text-[12px] uppercase text-[#797776]" style={{ ...mono, letterSpacing: "0.08em" }}>
          Trusted by independent practices worldwide
        </p>
        <div className="mt-5 grid grid-cols-2 items-center gap-y-4 text-center sm:grid-cols-3 lg:grid-cols-6">
          {names.map((l) => (
            <div key={l} className="text-[15px] text-[#3d3d3d]" style={serif}>{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Calendar,
      title: "Smart self-booking",
      body: "A shareable page that respects your hours and slot durations. Patients pick a real slot with automatic serial numbers — no double bookings.",
      tone: "bg-[#cfdaf5]",
    },
    {
      icon: Bell,
      title: "Digital prescriptions",
      body: "Write and send prescriptions digitally. Patients download from their dashboard. Full medication list, diagnosis, and bill — formatted and printable.",
      tone: "bg-[#a7fccd]",
    },
    {
      icon: CreditCard,
      title: "Patient management",
      body: "Complete patient records, visit history, and health data — all in one place. Search by phone, add notes, and track every appointment.",
      tone: "bg-[#ffd1bf]",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-[1432px] px-6 py-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <Tag>Features</Tag>
          <h2 className="mt-4 text-[40px] leading-[1.1] text-black sm:text-[56px]" style={serif}>
            A clinic management desk,
            <br />
            without the complexity.
          </h2>
        </div>
        <p className="max-w-sm text-[15px] text-[#4e4d4d]" style={sans}>
          Three things every doctor&apos;s practice needs, done well. Nothing you&apos;ll never use.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.title}
            className="group flex flex-col rounded-[32px] border border-black/10 bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.3)]">
            <div className={`mb-8 grid h-12 w-12 place-items-center rounded-2xl ${f.tone}`}>
              <f.icon className="h-5 w-5 text-black" />
            </div>
            <h3 className="text-[24px] text-black" style={serif}>{f.title}</h3>
            <p className="mt-3 text-[15px] text-[#4e4d4d]" style={sans}>{f.body}</p>
            <div className="mt-8 flex items-center gap-1 text-[13px] text-[#242424] underline-offset-4 group-hover:underline" style={mono}>
              Learn more <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SplitBlock() {
  return (
    <section className="mx-auto max-w-[1432px] px-6 pb-24">
      <div className="overflow-hidden rounded-[40px] border border-black/10 bg-[#cfdaf5]">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          <div className="p-10 lg:p-14">
            <Tag>For doctors</Tag>
            <h2 className="mt-5 text-[36px] leading-[1.1] text-black sm:text-[44px]" style={serif}>
              Your day, planned
              <br />
              before you open the door.
            </h2>
            <p className="mt-5 max-w-md text-[15px] text-[#3d3d3d]" style={sans}>
              Set your schedule per day of the week, block holidays, and control slot duration.
              BookMyDoc hides unavailable times. No double-bookings, no confusion.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Custom schedule per day — open/close individual days",
                "Block specific dates for holidays or leave",
                "Patient intake: name, age, gender, problem description",
              ].map((l) => (
                <li key={l} className="flex items-start gap-3 text-[14px] text-[#242424]" style={mono}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  {l}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <FilledButton href="/admin/register">
                Tour the doctor dashboard <ArrowRight className="h-4 w-4" />
              </FilledButton>
            </div>
          </div>
          <div className="relative min-h-[420px] bg-[#e6edfa] p-8 lg:p-12">
            <div className="absolute inset-6 rounded-[28px] border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between text-[12px] text-[#4e4d4d]" style={mono}>
                <span>This week</span>
                <span>47 visits scheduled</span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2 text-[10px] uppercase text-[#797776]" style={mono}>
                {["Sat", "Sun", "Mon", "Tue", "Wed"].map((d) => (
                  <div key={d} className="text-center">{d}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, i) => {
                  const variants = ["bg-[#cfdaf5]", "bg-[#a7fccd]", "bg-[#ffd1bf]", "bg-[#f6f3f1]", "bg-[#ececea]"];
                  const h = [44, 28, 60, 36, 52, 24, 70, 40][i % 8];
                  const c = variants[(i * 3) % variants.length];
                  return <div key={i} className={`rounded-md ${c} border border-black/5`} style={{ height: h }} />;
                })}
              </div>
              <div className="mt-5 rounded-2xl bg-[#f6f3f1] p-3 text-[12px] text-[#242424]" style={mono}>
                <div className="flex items-center justify-between">
                  <span>Mon · 10:00 — Consultation</span>
                  <span className="text-[#797776]">30m</span>
                </div>
                <div className="mt-1 text-[#797776]">Serial #08 · Returning patient</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { n: "01", t: "Register your practice", b: "Sign up with your email. Set your specialty, schedule, and clinic details. Takes 10 minutes." },
    { n: "02", t: "Share your booking link", b: "Send patients your portal link or QR code. They book a slot in seconds — no app download needed." },
    { n: "03", t: "Walk in to a confirmed day", b: "Appointments lined up, serials assigned, patient details collected. You focus on care." },
  ];
  return (
    <section id="how" className="mx-auto max-w-[1432px] px-6 pb-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Tag>How it works</Tag>
          <h2 className="mt-4 text-[40px] leading-[1.1] text-black sm:text-[52px]" style={serif}>
            From signup to first
            <br />
            booked patient: one afternoon.
          </h2>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-0 overflow-hidden rounded-[32px] border border-black/10 bg-white lg:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.n} className={`p-10 ${i < 2 ? "lg:border-r border-black/10" : ""}`}>
            <div className="text-[12px] uppercase text-[#797776]" style={{ ...mono, letterSpacing: "0.08em" }}>{s.n}</div>
            <h3 className="mt-6 text-[26px] text-black" style={serif}>{s.t}</h3>
            <p className="mt-3 text-[15px] text-[#4e4d4d]" style={sans}>{s.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { k: "100%", v: "free to start — no credit card" },
    { k: "10m", v: "average setup time, end to end" },
    { k: "24/7", v: "patient self-booking, even at night" },
    { k: "$0", v: "owed to a receptionist agency" },
  ];
  return (
    <section className="bg-[#242424] text-[#f6f3f1]">
      <div className="mx-auto max-w-[1432px] px-6 py-20">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {items.map((s) => (
            <div key={s.k}>
              <div className="text-[56px] leading-none" style={serif}>{s.k}</div>
              <div className="mt-3 max-w-[180px] text-[14px] text-[#cfd0cf]" style={sans}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: "I used to spend 2 hours a day on phone calls for appointments. Now patients book themselves, I get serial numbers in order, and my day actually flows.",
      n: "Dr. Michael Reeves",
      r: "General Practice · London",
    },
    {
      q: "The digital prescription feature is a game-changer. Patients get their prescription on their phone. No more lost papers, no more repeat calls.",
      n: "Dr. Priya Nair",
      r: "Pediatrician · Toronto",
    },
    {
      q: "I gave patients a portal link instead of my personal number. My evenings are my own again. BookMyDoc genuinely changed how I practice.",
      n: "Dr. Carlos Mendez",
      r: "Internal Medicine · Sydney",
    },
  ];
  return (
    <section className="mx-auto max-w-[1432px] px-6 py-24">
      <div className="max-w-2xl">
        <Tag>What doctors say</Tag>
        <h2 className="mt-4 text-[40px] leading-[1.1] text-black sm:text-[52px]" style={serif}>
          Quiet software for
          <br />
          people who run busy clinics.
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {quotes.map((t) => (
          <figure key={t.n} className="flex h-full flex-col justify-between rounded-[32px] border border-black/10 bg-white p-8">
            <blockquote className="text-[18px] leading-[1.45] text-black" style={sans}>
              &ldquo;{t.q}&rdquo;
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#cfdaf5] text-[14px] text-black" style={serif}>
                {t.n.split(" ").slice(-1)[0][0]}
              </div>
              <div style={mono}>
                <div className="text-[13px] text-black">{t.n}</div>
                <div className="text-[12px] text-[#797776]">{t.r}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      tag: "Forever free to start",
      features: [
        "30 appointments / month",
        "Patient self-booking portal",
        "Digital prescriptions",
        "Your public profile page",
        "Appointment serial numbers",
      ],
      cta: "Start free",
      featured: false,
    },
    {
      name: "Starter",
      price: "$9",
      tag: "Most chosen by doctors",
      features: [
        "200 appointments / month",
        "Everything in Free",
        "500 patient records",
        "Blog posts",
        "Priority appointment slots",
      ],
      cta: "Start free",
      featured: true,
    },
    {
      name: "Pro",
      price: "$29",
      tag: "Full-featured practice",
      features: [
        "Unlimited appointments",
        "Everything in Starter",
        "Unlimited patients",
        "Online shop",
        "Custom domain",
        "Priority support",
      ],
      cta: "Get started",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-[1432px] px-6 pb-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <Tag>Pricing</Tag>
          <h2 className="mt-4 text-[40px] leading-[1.1] text-black sm:text-[52px]" style={serif}>
            One flat price.
            <br />
            Free forever on basic.
          </h2>
        </div>
        <p className="max-w-sm text-[15px] text-[#4e4d4d]" style={sans}>
          Upgrade as you grow. Cancel any time — your data is always yours.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name}
            className={`flex flex-col rounded-[32px] border p-8 ${
              t.featured ? "border-black bg-black text-[#f6f3f1]" : "border-black/10 bg-white text-black"
            }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-[24px]" style={serif}>{t.name}</h3>
              {t.featured && (
                <span className="rounded-full bg-[#a7fccd] px-3 py-1 text-[11px] uppercase text-black"
                  style={{ ...mono, letterSpacing: "0.05em" }}>Popular</span>
              )}
            </div>
            <p className={`mt-1 text-[13px] ${t.featured ? "text-[#cfd0cf]" : "text-[#797776]"}`} style={mono}>{t.tag}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-[56px] leading-none" style={serif}>{t.price}</span>
              <span className={`${t.featured ? "text-[#cfd0cf]" : "text-[#797776]"} text-[13px]`} style={mono}>/month</span>
            </div>
            <ul className="mt-8 flex-1 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[14px]" style={mono}>
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${t.featured ? "text-[#a7fccd]" : "text-black"}`} />
                  <span className={t.featured ? "text-[#f6f3f1]" : "text-[#242424]"}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/register"
              className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] transition ${
                t.featured
                  ? "bg-[#f6f3f1] text-black hover:bg-white"
                  : "border border-[#242424] text-[#242424] hover:bg-[#242424] hover:text-[#f6f3f1]"
              }`}
              style={mono}>
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Do my patients need to create an account?",
      a: "No. Patients can book as a guest — just name, phone, and time slot. An account is offered after booking, never required.",
    },
    {
      q: "Can I create appointments for walk-in patients?",
      a: "Yes. From your dashboard you can manually create appointments for walk-in patients, add their details, and write a prescription — all in one flow.",
    },
    {
      q: "Can I write and send prescriptions digitally?",
      a: "Yes. Write the diagnosis, add medications with dosage, and generate a printable prescription. Patients with a portal account can download it directly.",
    },
    {
      q: "How do serial numbers work?",
      a: "Each appointment for the same doctor on the same date gets an auto-assigned serial number (01, 02, 03...). Patients see their serial when booking.",
    },
    {
      q: "Can I block specific days?",
      a: "Yes. Block individual dates for holidays, leave, or emergencies. You can also set a weekly schedule — different hours per day, Friday closed, etc.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-[1432px] px-6 pb-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Tag>FAQ</Tag>
          <h2 className="mt-4 text-[40px] leading-[1.1] text-black sm:text-[48px]" style={serif}>
            Questions doctors
            <br />
            actually ask us.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] text-[#4e4d4d]" style={sans}>
            Can&apos;t find what you&apos;re looking for? Email us at{" "}
            <span className="underline">support@bookmydoc.online</span> — a real human responds.
          </p>
        </div>
        <div className="lg:col-span-8">
          <div className="border-t border-black/15">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b border-black/15">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="text-[18px] text-black" style={sans}>{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#242424] transition ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <p className="pb-6 pr-12 text-[15px] text-[#4e4d4d]" style={sans}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-[1432px] px-6 pb-24">
      <div className="relative overflow-hidden rounded-[40px] bg-black p-10 text-[#f6f3f1] sm:p-16">
        <div className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
          style={{ background: "linear-gradient(135deg, rgba(255,148,115,0.5), rgba(160,181,235,0.6) 50%, rgba(167,252,205,0.45))" }} />
        <div className="relative grid grid-cols-1 items-end gap-10 lg:grid-cols-2">
          <div>
            <Tag>
              <Stethoscope className="h-3 w-3" /> For your practice
            </Tag>
            <h2 className="mt-6 text-[44px] leading-[1.05] sm:text-[64px]" style={serif}>
              A quieter clinic day,
              <br />
              starting Monday.
            </h2>
          </div>
          <div className="flex flex-col items-start gap-5 lg:items-end">
            <p className="max-w-md text-[16px] text-[#cfd0cf]" style={sans}>
              Free forever on the starter plan. No credit card. Bring your patient list — we&apos;ll bring the calm.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admin/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#f6f3f1] px-5 py-3 text-[14px] text-black transition hover:bg-white"
                style={mono}>
                Create your portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#f6f3f1]/40 px-5 py-3 text-[14px] text-[#f6f3f1] transition hover:bg-[#f6f3f1]/10"
                style={mono}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Product", l: ["Features", "Pricing", "How it works", "Changelog"] },
    { h: "For", l: ["General Doctors", "Specialists", "Dentists", "Therapists"] },
    { h: "Company", l: ["About", "Customers", "Contact", "Press"] },
    { h: "Resources", l: ["Docs", "Help center", "Privacy", "Status"] },
  ];
  return (
    <footer className="border-t border-black/10 bg-[#f6f3f1]">
      <div className="mx-auto max-w-[1432px] px-6 py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-6">
          <div className="col-span-2">
            <Logo size={32} />
            <p className="mt-4 max-w-xs text-[14px] text-[#4e4d4d]" style={sans}>
              A smart appointment and patient management platform for independent doctors worldwide.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[12px] text-[#797776]" style={mono}>
              <Clock className="h-3.5 w-3.5" /> Support replies within 24 hours
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="text-[12px] uppercase text-[#797776]" style={{ ...mono, letterSpacing: "0.08em" }}>{c.h}</div>
              <ul className="mt-4 space-y-2.5">
                {c.l.map((x) => (
                  <li key={x}>
                    <a href="#" className="text-[14px] text-[#242424] hover:underline underline-offset-4" style={mono}>{x}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-black/10 pt-6 text-[12px] text-[#797776] sm:flex-row sm:items-center" style={mono}>
          <span>© 2026 BookMyDoc. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f3f1] text-black">
      <NotificationBar />
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <SplitBlock />
      <Workflow />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
