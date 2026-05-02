import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-24 pb-0"
      style={{
        background:
          "linear-gradient(155deg, #B8EDE0 0%, #CCEEE6 18%, #DDF4EE 38%, #ECEEE0 60%, #F4EDD4 80%, #FAF5E2 100%)",
      }}
    >
      {/* Subtle radial glow top-right */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 20%, rgba(250,213,100,0.18) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <div className="flex -space-x-2.5">
            {[11, 32, 47, 53, 12].map((n) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={n}
                src={`https://i.pravatar.cc/40?img=${n}`}
                alt=""
                className="w-9 h-9 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-[#14967F] font-bold text-sm">10K+</span>
            <span className="text-[#6b7280] text-sm">Satisfied Patients</span>
          </div>
        </div>

        {/* Centered heading block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-bold text-[#191919] leading-[1.1] mb-5 tracking-tight">
            Trustworthy Care
            <br />
            for You and
            <br />
            Your Family
          </h1>
          <p className="text-[#6b7280] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Comprehensive, compassionate physical medicine and rehabilitation
            services designed to support your family&apos;s well-being at every
            stage of life.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 text-white rounded-full px-8 py-3.5 font-semibold text-sm hover:opacity-90 transition-all"
              style={{
                background: "#191919",
                boxShadow: "0 8px 24px rgba(25,25,25,0.25)",
              }}
            >
              Book Appointment
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
            <Link
              href="/#services"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-sm border-2 border-[#191919]/20 text-[#191919] hover:border-[#191919]/40 transition-colors bg-white/50 backdrop-blur-sm"
            >
              Explore Services
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Consultation UI mockup card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Card header bar */}
            <div className="flex items-center gap-4 px-5 sm:px-6 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#14967F] flex items-center justify-center">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#191919]">
                  Dr. Jahangir
                </span>
              </div>
              <div className="flex-1 text-center hidden sm:block">
                <p className="text-sm font-semibold text-[#191919]">
                  [Internal] Weekly Health Report
                </p>
                <p className="text-xs text-[#A3A3A3]">
                  20 February 2026 · 11:00 AM
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="hidden md:flex items-center gap-1.5 text-xs text-[#6b7280] border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  Copy to Clipboard
                </button>
                <button className="flex items-center gap-1.5 text-xs text-[#6b7280] border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                  Add Participant
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0M19 8v6M22 11h-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="flex min-h-[300px] sm:min-h-[360px]">
              {/* Main video — doctor */}
              <div
                className="flex-1 relative flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(145deg, #14967F 0%, #0a6357 100%)",
                }}
              >
                {/* Recording timer */}
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-white text-xs font-mono font-medium">
                    24:01:45
                  </span>
                </div>

                {/* Fullscreen */}
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-1.5 cursor-pointer">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                </div>

                {/* Live video indicator center */}
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
                      <path d="M23 7l-7 5 7 5V7z"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <span className="text-white/40 text-xs font-medium tracking-wide">Live Video</span>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="hidden sm:flex w-56 lg:w-64 flex-col border-l border-gray-100 bg-white">
                {/* Patient thumbnail */}
                <div className="p-3 border-b border-gray-100">
                  <div className="relative rounded-2xl overflow-hidden h-32 lg:h-36 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://i.pravatar.cc/200?img=52"
                      alt="Patient"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2.5 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5">
                      <span className="text-white text-[10px] font-medium">
                        Milar Jamser
                      </span>
                    </div>
                    <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#14967F] flex items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2H3v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Live Chat */}
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#191919]">
                      Live Chat
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[9px] text-[#A3A3A3]">Live</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      {
                        name: "Milar Jamser",
                        time: "10:58 AM",
                        msg: "Good morning, Doctor!",
                      },
                      {
                        name: "Dr. Jahangir",
                        time: "10:59 AM",
                        msg: "Good morning, let's start.",
                      },
                      {
                        name: "Milar Jamser",
                        time: "11:00 AM",
                        msg: "Yes, start this meeting.",
                      },
                    ].map((m, i) => (
                      <div key={i} className="bg-[#F4F4F5] rounded-xl p-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-semibold text-[#191919] truncate max-w-[80px]">
                            {m.name}
                          </span>
                          <span className="text-[9px] text-[#A3A3A3] shrink-0">
                            {m.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6b7280] leading-relaxed">
                          {m.msg}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
