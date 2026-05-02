export default function WhyChooseUs() {
  const reasons = [
    { icon: "🎯", title: "Specialist Expertise", desc: "FCPS certified Physical Medicine specialist with 15+ years focused practice." },
    { icon: "📋", title: "Personalized Treatment", desc: "Every patient gets a customized treatment plan based on their unique condition." },
    { icon: "💻", title: "Online Consultation", desc: "Submit your problem online with text, file, or voice note from anywhere." },
    { icon: "🔒", title: "Secure Prescriptions", desc: "Digital prescriptions delivered securely after consultation and payment." },
    { icon: "⏰", title: "Flexible Appointments", desc: "Book appointments online, choose your preferred time slot easily." },
    { icon: "🏥", title: "Hospital Affiliation", desc: "Based at Chittagong Maa-O-Shishu Hospital Medical College for full care." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-6 leading-tight">
              We&apos;re Here for One Reason —{" "}
              <span className="text-[#14967F]">Your Recovery</span>
            </h2>
            <p className="text-[#A3A3A3] leading-relaxed mb-8">
              Combining medical excellence with patient-centered care, Dr. Jahangir ensures every patient receives the attention, expertise, and support needed for optimal recovery.
            </p>

            <div className="space-y-4">
              {reasons.slice(0, 4).map((r, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5f2] flex items-center justify-center flex-shrink-0 text-lg">
                    {r.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[#191919]">{r.title}</p>
                    <p className="text-sm text-[#A3A3A3] mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 ${i === 2 ? "bg-[#14967F] text-white" : "bg-[#F4F4F5]"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${i === 2 ? "bg-white/20" : "bg-white"}`}>
                  {r.icon}
                </div>
                <p className={`font-semibold text-sm mb-1 ${i === 2 ? "text-white" : "text-[#191919]"}`}>
                  {r.title}
                </p>
                <p className={`text-xs leading-relaxed ${i === 2 ? "text-white/70" : "text-[#A3A3A3]"}`}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          {[
            { num: "10K+", label: "Patients Treated", sub: "Patient Satisfaction Rate" },
            { num: "94%", label: "Recovery Rate", sub: "Follow-Up Survey Results", featured: true },
            { num: "25K+", label: "Consultations Done", sub: "Online & In-Person" },
          ].map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 text-center ${s.featured ? "bg-[#14967F]" : "bg-[#F4F4F5]"}`}
            >
              <p className={`text-xs font-medium mb-2 ${s.featured ? "text-white/70" : "text-[#A3A3A3]"}`}>
                {s.sub}
              </p>
              <p className={`text-3xl font-bold ${s.featured ? "text-white" : "text-[#191919]"}`}>
                {s.num}
              </p>
              <p className={`text-sm mt-1 ${s.featured ? "text-white/80" : "text-[#A3A3A3]"}`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
