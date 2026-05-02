import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — text */}
          <div>
            <span className="inline-flex items-center border border-gray-200 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">About us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-5 leading-tight tracking-tight">
              Dedicated to Your Health,<br/>Every Step of the Way
            </h2>
            <p className="text-[#6b7280] leading-relaxed mb-4 text-sm">
              At our clinic, we provide compassionate, reliable medical services tailored to individuals and families. Whether you visit us in person or consult online, Dr. Jahangir delivers expert physical medicine and rehabilitation care.
            </p>
            <p className="text-[#6b7280] leading-relaxed mb-8 text-sm">
              Dr. Md. Jahangir Alam Chowdhury holds MBBS and FCPS (Physical Medicine) qualifications and serves as Associate Professor & Head of Physical Medicine & Rehabilitation at Chittagong Maa-O-Shishu Hospital Medical College.
            </p>
            <Link href="/appointment" className="inline-flex items-center gap-2 bg-[#14967F] text-white rounded-full px-6 py-3 font-semibold text-sm hover:bg-[#0d7a66] transition-all hover:-translate-y-0.5 shadow-md shadow-[#14967F]/20">
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </Link>
          </div>

          {/* RIGHT — image + stats */}
          <div className="relative">
            {/* Doctor image card */}
            <div className="rounded-3xl overflow-hidden h-72 flex items-center justify-center relative" style={{background:"linear-gradient(135deg, #e8f5f2 0%, #c8e8e0 100%)"}}>
              <div className="text-center">
                <div className="w-28 h-28 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="1.2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-[#14967F]">Dr. Jahangir with Patient</p>
                <p className="text-xs text-[#A3A3A3] mt-1">Compassionate Care</p>
              </div>
            </div>

            {/* Stats boxes — 2x2 grid below */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { num: "12+",  label: "Years of Experience",  bg: "#FFF3C9", border: "#FAD069" },
                { num: "99%",  label: "Client Satisfaction",  bg: "#e8f5f2", border: "#14967F" },
                { num: "10K+", label: "Patients Treated",     bg: "#FFF3C9", border: "#FAD069" },
                { num: "3+",   label: "Certifications",       bg: "#e8f5f2", border: "#14967F" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-4 text-center" style={{background: s.bg, borderBottom: `3px solid ${s.border}`}}>
                  <p className="text-xl font-bold text-[#191919]">{s.num}</p>
                  <p className="text-[10px] text-[#6b7280] mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
