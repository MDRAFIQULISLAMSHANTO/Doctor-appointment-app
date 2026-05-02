"use client";
import { useState } from "react";

const faqs = [
  { q: "What services do you offer?", a: "We primarily focus on Physical Medicine & Rehabilitation including treatment for Arthritis, Chronic Pain, Paralysis, Stroke Rehabilitation, Cervical Spondylosis, Sports Injuries, and Occupational Therapy. Both in-person (Chittagong) and online consultations are available." },
  { q: "How much does a consultation cost?", a: "Consultation fees vary by service type. Online consultation starts from ৳ 500. In-person consultation fees can be confirmed by calling our clinic. Prescription download requires a one-time fee of ৳ 500." },
  { q: "How do I get my prescription after consultation?", a: "After your consultation, Dr. Jahangir will upload your prescription PDF to the patient portal. You will receive a notification to complete payment (৳ 500 via SSLCommerz/bKash/Nagad), after which the prescription unlocks for download." },
  { q: "Can I submit my health problem online before visiting?", a: "Yes. Register as a patient, go to your dashboard, and use 'Submit Problem' to describe symptoms in text, upload reports/X-rays, or record a voice note. Dr. Jahangir will review and respond within 24 hours." },
  { q: "Do you offer home visits or teleconsultation?", a: "Online consultations are available where you submit your problem with supporting files and receive a digital prescription. Home visits are not currently offered, but telemedicine via WhatsApp can be arranged for follow-ups." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">FAQs</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-4 leading-tight">
              Frequently Asked<br />Questions
            </h2>
            <p className="text-[#A3A3A3] leading-relaxed mb-8">
              Everything you need to know about booking, prescriptions, payments, and online consultations.
            </p>
            <div className="bg-[#14967F] rounded-2xl p-6 text-white">
              <p className="font-semibold mb-1">Still have questions?</p>
              <p className="text-white/70 text-sm mb-4">Contact us via WhatsApp for a quick response.</p>
              <a href="/#contact" className="inline-flex items-center gap-2 bg-white text-[#14967F] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors">
                Contact Us
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </a>
            </div>
          </div>

          {/* Right - accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden transition-all ${open === i ? "bg-white shadow-sm" : "bg-white/60"}`}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className={`font-semibold text-sm ${open === i ? "text-[#14967F]" : "text-[#191919]"}`}>{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-colors ${open === i ? "bg-[#14967F] text-white" : "bg-[#F4F4F5] text-[#A3A3A3]"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d={open === i ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
                    </svg>
                  </div>
                </button>
                {open === i && (
                  <div className="px-6 pb-5">
                    <p className="text-[#6b7280] text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
