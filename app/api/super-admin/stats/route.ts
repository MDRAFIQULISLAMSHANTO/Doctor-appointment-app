import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
    service.from("doctors").select("id, name, specialty, email, phone, hospital, city, plan, features, active, slug, created_at"),
    service.from("patients").select("id", { count: "exact", head: true }),
    service.from("appointments").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    doctors: doctorsRes.data ?? [],
    stats: {
      doctors: doctorsRes.data?.length ?? 0,
      patients: patientsRes.count ?? 0,
      appointments: appointmentsRes.count ?? 0,
    },
  });
}
