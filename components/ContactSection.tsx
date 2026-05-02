"use client";
import { useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";

function DNA3D() {
  const [thetaOff, setThetaOff] = useState(0);

  useAnimationFrame((t) => {
    setThetaOff((t * 0.00032) % (2 * Math.PI));
  });

  const N = 14;
  const maxTheta = 4.5 * Math.PI;
  const CX = 170;
  const R = 72;

  const gradients = [
    { id: "dna-red",  c1: "#FF9090", c2: "#C22020" },
    { id: "dna-blue", c1: "#88AAFF", c2: "#2244CC" },
    { id: "dna-gray", c1: "#BBBBCC", c2: "#444466" },
    { id: "dna-tan",  c1: "#FFCC88", c2: "#BB7720" },
  ];

  const colorNames = ["red", "blue", "gray", "tan"] as const;
  type ColorName = (typeof colorNames)[number];

  const nodes = Array.from({ length: N }, (_, i) => {
    const t = (maxTheta * i) / (N - 1) + thetaOff;
    const y = 20 + (460 * i) / (N - 1);
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    const ci = i % 4;
    const colorA: ColorName = colorNames[ci];
    const colorB: ColorName = colorNames[(ci + 2) % 4];
    return {
      y,
      ax: CX + R * sinT,
      bx: CX - R * sinT,
      cosT,
      colorA,
      colorB,
      sizeA: Math.max(6, 9 + 7 * (cosT + 1) / 2),
      sizeB: Math.max(6, 9 + 7 * (1 - cosT) / 2),
    };
  });

  const pathA =
    "M " + nodes.map((n) => `${n.ax.toFixed(1)} ${n.y.toFixed(1)}`).join(" L ");
  const pathB =
    "M " + nodes.map((n) => `${n.bx.toFixed(1)} ${n.y.toFixed(1)}`).join(" L ");

  return (
    <svg
      viewBox="0 0 340 500"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {gradients.map((g) => (
          <radialGradient key={g.id} id={g.id} cx="33%" cy="28%" r="65%">
            <stop offset="0%" stopColor={g.c1} />
            <stop offset="70%" stopColor={g.c2} />
            <stop offset="100%" stopColor={g.c2} />
          </radialGradient>
        ))}
      </defs>

      {/* Scattered atom clusters */}
      <circle cx="28" cy="75"  r="13" fill="url(#dna-blue)" opacity="0.3" />
      <circle cx="44" cy="125" r="8"  fill="url(#dna-red)"  opacity="0.25" />
      <line x1="28" y1="75" x2="44" y2="125" stroke="#CCCCCC" strokeWidth="2" opacity="0.4" />

      <circle cx="310" cy="130" r="11" fill="url(#dna-tan)"  opacity="0.3" />
      <circle cx="298" cy="175" r="7"  fill="url(#dna-gray)" opacity="0.25" />
      <line x1="310" y1="130" x2="298" y2="175" stroke="#CCCCCC" strokeWidth="2" opacity="0.4" />

      <circle cx="305" cy="350" r="14" fill="url(#dna-red)"  opacity="0.25" />
      <circle cx="290" cy="395" r="9"  fill="url(#dna-blue)" opacity="0.22" />
      <line x1="305" y1="350" x2="290" y2="395" stroke="#CCCCCC" strokeWidth="2" opacity="0.4" />

      <circle cx="22"  cy="390" r="10" fill="url(#dna-tan)"  opacity="0.28" />
      <circle cx="38"  cy="440" r="6"  fill="url(#dna-gray)" opacity="0.22" />
      <line x1="22" y1="390" x2="38" y2="440" stroke="#CCCCCC" strokeWidth="2" opacity="0.4" />

      {/* Backbone strands */}
      <path d={pathA} stroke="#D0D0D8" strokeWidth="2.5" fill="none" />
      <path d={pathB} stroke="#D0D0D8" strokeWidth="2.5" fill="none" />

      {/* Back spheres */}
      {nodes.map((n, i) => {
        const isAFront = n.cosT >= 0;
        return (
          <circle
            key={`back-${i}`}
            cx={isAFront ? n.bx : n.ax}
            cy={n.y}
            r={isAFront ? n.sizeB : n.sizeA}
            fill={`url(#dna-${isAFront ? n.colorB : n.colorA})`}
            opacity="0.65"
          />
        );
      })}

      {/* Rungs */}
      {nodes.map((n, i) => (
        <line
          key={`rung-${i}`}
          x1={n.ax.toFixed(1)} y1={n.y.toFixed(1)}
          x2={n.bx.toFixed(1)} y2={n.y.toFixed(1)}
          stroke="#C8C8D0"
          strokeWidth="2.5"
        />
      ))}

      {/* Front spheres */}
      {nodes.map((n, i) => {
        const isAFront = n.cosT >= 0;
        return (
          <circle
            key={`front-${i}`}
            cx={isAFront ? n.ax : n.bx}
            cy={n.y}
            r={isAFront ? n.sizeA : n.sizeB}
            fill={`url(#dna-${isAFront ? n.colorA : n.colorB})`}
          />
        );
      })}
    </svg>
  );
}

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", whatsapp: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — DNA + info */}
          <div>
            <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">
              Contact us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-4 leading-tight">
              Discover the Best
              <br />
              In Home Care
            </h2>
            <p className="text-[#6b7280] leading-relaxed mb-8 max-w-sm">
              Providing compassionate, reliable medical services tailored to
              individuals and families, whether you visit in person or online.
            </p>

            {/* 3D DNA — scroll entrance + float + rotation */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full mb-8 flex items-center justify-center"
              style={{ height: "320px" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "loop",
                }}
                style={{ width: "220px", height: "320px" }}
              >
                <DNA3D />
              </motion.div>
            </motion.div>

            {/* Contact info */}
            <div className="space-y-3">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  text: "Chittagong Maa-O-Shishu Hospital Medical College, Chittagong",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.9v2.02z" />
                    </svg>
                  ),
                  text: "+880 1XXXXXXXXX",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  text: "Sat–Thu: 9AM–5PM · Friday: Closed",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e8f5f2] flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <span className="text-sm text-[#6b7280] pt-1.5">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form card */}
          <div
            className="rounded-3xl p-8 relative overflow-hidden shadow-xl"
            style={{
              background:
                "linear-gradient(160deg, #FAD069 0%, #a8d5a2 45%, #14967F 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, white 0%, transparent 55%)",
              }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-6">
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1.5">
                    First and last name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/25 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1.5">
                    WhatsApp / Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/25 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/25 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1.5">
                    About / Message
                  </label>
                  <textarea
                    placeholder="Writing ........."
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/25 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white focus:bg-white/30 transition-all resize-none text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-[#14967F] font-bold py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm shadow-md"
                >
                  {sent ? "Message Sent ✓" : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
