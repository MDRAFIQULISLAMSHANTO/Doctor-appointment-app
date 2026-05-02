import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{background: "linear-gradient(135deg, #14967F 0%, #0d7a66 100%)"}}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          {/* Left - Address */}
          <div>
            <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Address</h4>
            <p className="text-white text-sm leading-relaxed">
              Chittagong Maa-O-Shishu Hospital Medical College<br />
              Chittagong, Bangladesh
            </p>
            <p className="text-white/70 text-sm mt-3">
              Visiting: Sat–Thu 9AM–5PM
            </p>
          </div>

          {/* Center - Logo & CTA */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Dr. Jahangir</p>
                <p className="text-white/60 text-xs">Physical Medicine</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6">Contact Us</p>
            <p className="text-white text-2xl font-bold mb-6">+880 1XXXXXXXXX</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/appointment"
                className="bg-[#FAD069] text-[#191919] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#e8bb45] transition-colors"
              >
                Book Appointment
              </Link>
              <Link
                href="/#contact"
                className="border border-white/40 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                Contact Us
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Right - Quick links */}
          <div>
            <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: "About Us", href: "/#about" },
                { label: "Our Services", href: "/#services" },
                { label: "Book Appointment", href: "/appointment" },
                { label: "Patient Portal", href: "/patient/login" },
                { label: "Shop", href: "/shop" },
                { label: "Health Blog", href: "/blog" },
                { label: "Privacy Policy", href: "#" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="block text-white/70 text-sm hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-sm">© 2025 Dr. Jahangir Alam Chowdhury. All Rights Reserved.</p>
          <p className="text-white/50 text-sm">Physical Medicine & Rehabilitation, Chittagong</p>
        </div>
      </div>
    </footer>
  );
}
