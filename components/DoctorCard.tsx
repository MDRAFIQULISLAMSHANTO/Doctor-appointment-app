import Link from "next/link";

export default function DoctorCard() {
  return (
    <section className="py-20 bg-[#F4F4F5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">Our Medical Service</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191919]">A Specialist Doctor for You</h2>
          <p className="text-[#6b7280] mt-3 max-w-lg mx-auto text-sm">Expert care from a certified physical medicine and rehabilitation specialist in Chittagong.</p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-sm w-full">
            {/* Featured doctor card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image area */}
              <div className="h-56 flex items-center justify-center relative" style={{background:"linear-gradient(135deg, #e8f5f2 0%, #d0ede8 100%)"}}>
                <div className="absolute top-3 right-3 bg-[#14967F] rounded-full px-3 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                  <span className="text-white text-[10px] font-semibold">Available Today</span>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/70 flex items-center justify-center mx-auto shadow-md">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14967F" strokeWidth="1.2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#191919]">Dr. Md. Jahangir Alam Chowdhury</h3>
                    <p className="text-sm text-[#14967F] font-medium mt-0.5">Physical Medicine & Rehabilitation</p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#FFF3C9] rounded-full px-2 py-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#FAD069"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span className="text-xs font-bold text-[#191919]">4.9</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-4">
                  <span className="bg-[#F4F4F5] rounded-full px-2.5 py-1">MBBS</span>
                  <span className="bg-[#F4F4F5] rounded-full px-2.5 py-1">FCPS (PM)</span>
                  <span className="bg-[#F4F4F5] rounded-full px-2.5 py-1">15+ yrs exp</span>
                </div>

                <p className="text-xs text-[#6b7280] leading-relaxed mb-5">
                  Arthritis · Chronic Pain · Paralysis Rehabilitation · Physical Medicine · Cervical Spondylosis · Sports Injuries
                </p>

                <div className="flex gap-2">
                  <Link href="/appointment" className="flex-1 bg-[#14967F] text-white rounded-xl py-2.5 text-sm font-semibold text-center hover:bg-[#0d7a66] transition-colors">
                    Book Appointment
                  </Link>
                  <Link href="/#contact" className="px-4 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#6b7280] hover:border-[#14967F] hover:text-[#14967F] transition-colors flex items-center">
                    Message
                  </Link>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                  {[
                    { num: "10K+", label: "Patients" },
                    { num: "1K+",  label: "Reviews" },
                    { num: "15+",  label: "Yrs Exp" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="text-sm font-bold text-[#191919]">{s.num}</p>
                      <p className="text-[10px] text-[#A3A3A3]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
