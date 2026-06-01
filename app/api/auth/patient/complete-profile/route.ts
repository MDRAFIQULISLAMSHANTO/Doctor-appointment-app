import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/auth/patient/complete-profile
// Called after Google OAuth to save phone + profile
export async function POST(req: NextRequest) {
  const { user_id, phone, name, age, gender } = await req.json();

  if (!user_id || !phone || !name) {
    return NextResponse.json({ error: "user_id, phone and name required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Check phone not already used
  const { data: existing } = await supabase
    .from("patients").select("id").eq("phone", phone).single();
  if (existing) {
    return NextResponse.json({ error: "Phone number already registered to another account" }, { status: 409 });
  }

  const { error } = await supabase.from("patients").insert({
    user_id,
    phone,
    name,
    age: age ? parseInt(age) : null,
    gender: gender || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
