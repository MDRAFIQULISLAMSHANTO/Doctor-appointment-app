import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/admin/patients?phone=01XXXXXXXXX — search patient by phone
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const phone = req.nextUrl.searchParams.get("phone")?.replace(/\D/g, "");
  if (!phone) return NextResponse.json({ patient: null });

  const svc = createServiceClient();
  const { data: patient } = await svc
    .from("patients").select("id, name, phone, age, gender, has_portal_access").eq("phone", phone).maybeSingle();

  return NextResponse.json({ patient: patient ?? null });
}
