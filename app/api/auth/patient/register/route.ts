import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/auth/patient/register
// body: { phone, name, age, gender, password }
export async function POST(req: NextRequest) {
  const { phone, name, age, gender, password } = await req.json();

  if (!phone || !name || !password) {
    return NextResponse.json({ error: "Phone, name and password required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Create auth user with phone as email proxy
  const email = `${phone.replace(/\D/g, "")}@patient.docapp.local`;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already")) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const cleanPhone = phone.replace(/\D/g, "");

  // If doctor pre-created a patient record for this phone, link it instead of creating new
  const { data: existing } = await supabase
    .from("patients").select("id").eq("phone", cleanPhone).is("user_id", null).maybeSingle();

  if (existing) {
    const { error: linkErr } = await supabase.from("patients").update({
      user_id: authData.user.id,
      name,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      has_portal_access: true,
    }).eq("id", existing.id);
    if (linkErr) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 201 });
  }

  // Insert patient profile
  const { error: patientError } = await supabase.from("patients").insert({
    user_id: authData.user.id,
    phone: cleanPhone,
    name,
    age: age ? parseInt(age) : null,
    gender: gender || null,
    has_portal_access: true,
  });

  if (patientError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: patientError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
