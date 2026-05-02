import Link from "next/link";

const specialties = [
  {
    title: "Scope of Services",
    icon: "🏥",
    items: ["Arthritis & Joint Disorders", "Chronic Pain Management", "Post-Surgical Rehab", "Electrotherapy", "Manual Therapy", "Exercise Therapy", "In-Clinic Services"],
    featured: false,
  },
  {
    title: "Specialties",
    icon: "⚕️",
    items: ["Rheumatoid Arthritis", "Osteoarthritis", "Cervical Spondylosis", "Paralysis Rehab", "Stroke Recovery", "Back Pain", "Neuropathy"],
    featured: true,
    cta: true,
  },
  {
    title: "Super Specialties",
    icon: "🎯",
    items: ["Physical Medicine", "Rehabilitation Medicine", "Pain Medicine", "Occupational Therapy", "Orthopaedic Conditions", "Dermatology-related", "Paediatric Rehab"],
    featured: false,
  },
];

export default function Specialties() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">Services</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-4">Specialties Service</h2>
          <p className="text-[#6b7280] max-w-xl mx-auto">Comprehensive physical medicine and rehabilitation services tailored to restore your health.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {specialties.map((s, i) => (
            <div
              key={i}
              className={`rounded-3xl p-7 flex flex-col ${
                s.featured
                  ? "text-white shadow-xl shadow-[#14967F]/20"
                  : "border border-gray-100 hover:border-[#14967F]/30 transition-colors"
              }`}
              style={s.featured ? {background: "linear-gradient(160deg, #14967F 0%, #0a6357 100%)"} : {background: "#F9FAFB"}}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 ${s.featured ? "bg-white/20" : "bg-[#e8f5f2]"}`}>
                {s.icon}
              </div>

              <h3 className={`text-lg font-bold mb-1 ${s.featured ? "text-white" : "text-[#191919]"}`}>{s.title}</h3>

              {s.featured && (
                <p className={`text-sm mb-4 ${s.featured ? "text-white/70" : "text-[#6b7280]"}`}>
                  Expert care for all physical medicine needs
                </p>
              )}

              {s.cta && (
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 bg-[#FAD069] text-[#191919] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#e8bb45] transition-colors mb-5 w-fit"
                >
                  Book Appointment
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </Link>
              )}

              {!s.featured && <div className="w-full h-px bg-gray-100 mb-4 mt-2"></div>}
              {s.featured && <div className="w-full h-px bg-white/20 mb-4"></div>}

              <ul className="space-y-2.5 flex-1">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2.5">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={s.featured ? "rgba(250,208,105,0.9)" : "#14967F"} strokeWidth="2.5">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className={`text-sm ${s.featured ? "text-white/85" : "text-[#374151]"}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
