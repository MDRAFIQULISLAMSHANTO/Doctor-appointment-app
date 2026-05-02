"use client";
import { useState } from "react";
import Link from "next/link";

const services = [
  {
    title: "Arthritis Treatment",
    description: "Comprehensive diagnosis and management of all forms of arthritis including Rheumatoid, Osteoarthritis, and Gouty arthritis with modern treatment protocols.",
    icon: "🦴",
  },
  {
    title: "Pain Management",
    description: "Advanced pain relief solutions for chronic and acute pain conditions using evidence-based techniques including interventional procedures and rehabilitation.",
    icon: "💊",
  },
  {
    title: "Paralysis Rehabilitation",
    description: "Specialized rehabilitation programs for stroke, spinal cord injury, and nerve damage patients to restore maximum functional independence.",
    icon: "🧠",
  },
  {
    title: "Physical Medicine",
    description: "Complete physical medicine services including electrotherapy, manual therapy, exercise therapy, and functional restoration programs.",
    icon: "⚕️",
  },
  {
    title: "Sports Injury",
    description: "Expert management of sports-related injuries with focus on rapid recovery and return to optimal performance levels.",
    icon: "🏃",
  },
  {
    title: "Occupational Therapy",
    description: "Helping patients regain independence in daily living activities through targeted occupational therapy programs.",
    icon: "🤝",
  },
];

export default function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="py-20 bg-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-4">
            Expert Care for You
          </h2>
          <p className="text-[#A3A3A3] max-w-xl mx-auto">
            Comprehensive physical medicine and rehabilitation services tailored to restore your health and quality of life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Service list */}
          <div className="space-y-3">
            {services.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left rounded-2xl p-5 transition-all ${
                  active === i
                    ? "bg-[#14967F] text-white shadow-lg"
                    : "bg-white text-[#191919] hover:bg-white/80"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className={`font-semibold ${active === i ? "text-white" : "text-[#191919]"}`}>
                      {s.title}
                    </p>
                    {active === i && (
                      <p className="text-sm text-white/80 mt-1 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>
                  {active !== i && (
                    <svg className="ml-auto text-[#A3A3A3]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  )}
                </div>
                {active === i && (
                  <div className="mt-4">
                    <Link
                      href="/appointment"
                      className="inline-flex items-center gap-2 bg-[#FAD069] text-[#191919] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#e8bb45] transition-colors"
                    >
                      Book Appointment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </Link>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Service image/info */}
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="w-full h-48 bg-[#e8f5f2] rounded-2xl flex items-center justify-center mb-6">
                <span className="text-7xl">{services[active].icon}</span>
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-3">{services[active].title}</h3>
              <p className="text-[#A3A3A3] leading-relaxed mb-6">{services[active].description}</p>
              <Link
                href="/appointment"
                className="w-full bg-[#14967F] text-white rounded-full py-3 font-medium hover:bg-[#0d7a66] transition-colors flex items-center justify-center gap-2"
              >
                Book This Service
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
