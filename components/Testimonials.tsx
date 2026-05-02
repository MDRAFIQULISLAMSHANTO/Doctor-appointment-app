const testimonials = [
  {
    name: "Rahima Begum",
    role: "Arthritis Patient",
    text: "Dr. Jahangir's treatment completely changed my life. After years of severe knee pain, I can now walk without difficulty. His approach is thorough, compassionate, and highly effective.",
    date: "March 2025",
    rating: 5,
  },
  {
    name: "Mohammad Karim",
    role: "Stroke Rehabilitation Patient",
    text: "After my stroke, I was told recovery would be very limited. Dr. Jahangir's rehabilitation program proved otherwise. Within 6 months, I regained most of my mobility.",
    date: "January 2025",
    rating: 5,
    featured: true,
  },
  {
    name: "Fatema Khatun",
    role: "Back Pain Patient",
    text: "Excellent doctor with great patience. He explained everything clearly and the treatment plan worked perfectly. Highly recommend for any pain management needs.",
    date: "February 2025",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">
            Testimonial
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-4">
            What Our Patients Say
          </h2>
          <p className="text-[#A3A3A3] max-w-xl mx-auto">
            Real stories from patients who experienced the difference of expert, caring treatment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 flex flex-col ${
                t.featured
                  ? "bg-[#14967F] text-white"
                  : "bg-white text-[#191919]"
              }`}
            >
              {/* Date + quote icon */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs ${t.featured ? "text-white/60" : "text-[#A3A3A3]"}`}>
                  {t.date}
                </span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={t.featured ? "rgba(255,255,255,0.3)" : "#e8f5f2"}>
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                </svg>
              </div>

              <p className={`text-sm leading-relaxed flex-1 mb-5 ${t.featured ? "text-white/90" : "text-[#A3A3A3]"}`}>
                {t.text}
              </p>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({length: t.rating}).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={t.featured ? "#FAD069" : "#FAD069"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${t.featured ? "bg-white/20" : "bg-[#14967F]"}`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${t.featured ? "text-white" : "text-[#191919]"}`}>
                    {t.name}
                  </p>
                  <p className={`text-xs ${t.featured ? "text-white/60" : "text-[#A3A3A3]"}`}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
