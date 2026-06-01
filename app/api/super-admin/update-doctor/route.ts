import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, plan, active, features, theme_color, photo_url, logo_url, bio, city, name, specialty, phone, hospital, address, stats, services } = body;

  if (!id) return NextResponse.json({ error: "Missing doctor id" }, { status: 400 });

  const updatePayload: Record<string, unknown> = {};
  if (plan !== undefined) updatePayload.plan = plan;
  if (active !== undefined) updatePayload.active = active;
  if (features !== undefined) updatePayload.features = features;
  if (theme_color !== undefined) updatePayload.theme_color = theme_color;
  if (photo_url !== undefined) updatePayload.photo_url = photo_url;
  if (logo_url !== undefined) updatePayload.logo_url = logo_url;
  if (bio !== undefined) updatePayload.bio = bio;
  if (city !== undefined) updatePayload.city = city;
  if (name !== undefined) updatePayload.name = name;
  if (specialty !== undefined) updatePayload.specialty = specialty;
  if (phone !== undefined) updatePayload.phone = phone;
  if (hospital !== undefined) updatePayload.hospital = hospital;
  if (address !== undefined) updatePayload.address = address;
  if (stats !== undefined) updatePayload.stats = stats;
  if (services !== undefined) updatePayload.services = services;

  const service = createServiceClient();
  const { error } = await service
    .from("doctors")
    .update(updatePayload)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
