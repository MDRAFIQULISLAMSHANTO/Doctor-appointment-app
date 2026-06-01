import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/auth/doctor/register
// body: { email, password, name, specialty, phone, hospital, address, city, bio, photo_url, logo_url, theme_color }
export async function POST(req: NextRequest) {
  const { email, password, name, specialty, phone, hospital, address, city, bio, photo_url, logo_url, theme_color } = await req.json();

  if (!email || !password || !name || !specialty) {
    return NextResponse.json({ error: "Email, password, name and specialty required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "doctor";

  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("doctors").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error: doctorError } = await supabase.from("doctors").insert({
    user_id: authData.user.id,
    slug,
    name,
    specialty,
    email,
    phone: phone || null,
    hospital: hospital || null,
    address: address || null,
    city: city || null,
    bio: bio || null,
    photo_url: photo_url || null,
    logo_url: logo_url || null,
    theme_color: theme_color || "#14967F",
  });

  if (doctorError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: doctorError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, slug }, { status: 201 });
}
