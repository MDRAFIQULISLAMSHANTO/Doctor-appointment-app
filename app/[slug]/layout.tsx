import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export default async function DoctorLayout({ children, params }: Props) {
  const { slug } = await params;

  // Don't intercept platform-level routes
  const RESERVED = ["super-admin", "admin", "patient", "api", "auth", "appointment", "_next"];
  if (RESERVED.includes(slug)) return <>{children}</>;

  const supabase = createServiceClient();
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, slug, name, specialty")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!doctor) notFound();
  return <>{children}</>;
}
