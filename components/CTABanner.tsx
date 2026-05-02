import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl px-8 py-16 text-center"
          style={{background: "linear-gradient(135deg, #0d7a66 0%, #0a6357 100%)"}}
        >
          <span className="inline-flex items-center border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/70 mb-6">
            Health
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Your Trusted{" "}
            <span className="text-[#FAD069] italic font-serif">Online & Offline</span>
            {" "}Healthcare
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Whether you prefer in-person consultation at our Chittagong clinic or online consultation from home — we&apos;re here for you.
          </p>
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 bg-[#FAD069] text-[#191919] rounded-full px-8 py-4 font-semibold hover:bg-[#e8bb45] transition-colors text-lg"
          >
            Book Appointment
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
