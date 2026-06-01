import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DoctorLanding from "./landing";

type Doctor = {
  id: string; slug: string; name: string; specialty: string; email: string;
  phone?: string; hospital?: string; address?: string; city?: string; bio?: string;
  photo_url?: string; logo_url?: string; theme_color?: string;
  hours?: Record<string, string>; services?: string[];
  stats?: { patients: string; experience: string; rating: string; reviews: string };
  plan?: string; active?: boolean;
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("doctors").select("name, specialty, city").eq("slug", slug).eq("active", true).single();
  if (!data) return { title: "Doctor Not Found" };
  return {
    title: `${data.name} — ${data.specialty} | DocApp`,
    description: `Book an appointment with ${data.name}, ${data.specialty} in ${data.city ?? "Bangladesh"}.`,
  };
}

function darkenHex(hex: string, factor = 0.12): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const d = (v: number) => Math.max(0, Math.round(v * (1 - factor))).toString(16).padStart(2, "0");
  return `#${d(r)}${d(g)}${d(b)}`;
}
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params;

  const RESERVED = ["super-admin", "admin", "patient", "api", "auth", "appointment", "_next", "favicon.ico"];
  if (RESERVED.includes(slug)) notFound();

  const supabase = createServiceClient();
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, slug, name, specialty, email, phone, hospital, address, city, bio, photo_url, logo_url, theme_color, hours, services, stats, plan, active")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!doctor) notFound();

  const doc = doctor as Doctor;

  const brand = doc.theme_color && /^#[0-9a-fA-F]{6}$/.test(doc.theme_color) ? doc.theme_color : "#14967F";
  const brandDark = darkenHex(brand, 0.12);
  const brandLight = hexToRgba(brand, 0.10);
  const brandShadow = hexToRgba(brand, 0.25);

  return (
    <>
      <style>{`
        :root {
          --brand: ${brand};
          --brand-dark: ${brandDark};
          --brand-light: ${brandLight};
          --brand-shadow: ${brandShadow};
        }
      `}</style>
      <DoctorLanding doc={doc} brand={brand} brandLight={brandLight} />
    </>
  );
}
