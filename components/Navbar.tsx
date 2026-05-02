"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-transparent border-b border-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#14967F] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-700 text-[#191919] leading-tight">Dr. Jahangir</p>
              <p className="text-[10px] text-[#A3A3A3] leading-tight">Physical Medicine</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/#about" },
              { label: "Services", href: "/#services" },
              { label: "Appointment", href: "/appointment" },
              { label: "Shop", href: "/shop" },
              { label: "Blog", href: "/blog" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] font-medium text-[#191919] hover:text-[#14967F] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/patient/login"
              className="text-[15px] font-medium text-[#14967F] hover:underline"
            >
              Login
            </Link>
            <Link
              href="/appointment"
              className="bg-[#14967F] text-white rounded-full px-5 py-2 text-[14px] font-medium hover:bg-[#0d7a66] transition-colors flex items-center gap-1"
            >
              Book Appointment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/#about" },
            { label: "Services", href: "/#services" },
            { label: "Appointment", href: "/appointment" },
            { label: "Shop", href: "/shop" },
            { label: "Blog", href: "/blog" },
            { label: "Patient Login", href: "/patient/login" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-[15px] font-medium text-[#191919] hover:text-[#14967F] py-1"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/appointment"
            onClick={() => setOpen(false)}
            className="bg-[#14967F] text-white rounded-full px-5 py-2.5 text-[14px] font-medium text-center hover:bg-[#0d7a66] transition-colors mt-2"
          >
            Book Appointment ↗
          </Link>
        </div>
      )}
    </nav>
  );
}
