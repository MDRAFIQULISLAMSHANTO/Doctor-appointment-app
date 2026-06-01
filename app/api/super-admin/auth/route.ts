import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Phone → resolve to SUPER_ADMIN_EMAIL (server-side only, env stays private)
export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();
  if (!identifier || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const isPhone = /^\d{10,15}$/.test(identifier.trim());
  const email = isPhone ? process.env.SUPER_ADMIN_EMAIL! : identifier.trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  // Verify it's actually the super admin
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== process.env.SUPER_ADMIN_EMAIL) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
