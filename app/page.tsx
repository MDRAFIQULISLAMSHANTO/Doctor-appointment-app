import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Services from "@/components/Services";
import Specialties from "@/components/Specialties";
import WhyChooseUs from "@/components/WhyChooseUs";
import DoctorCard from "@/components/DoctorCard";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import BlogPreview from "@/components/BlogPreview";
import CTABanner from "@/components/CTABanner";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Specialties />
        <WhyChooseUs />
        <FAQ />
        <DoctorCard />
        <Testimonials />
        <BlogPreview />
        <CTABanner />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
