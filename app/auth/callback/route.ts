import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/patient/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Super admin — skip patient profile check, go straight to panel
        if (user.email === process.env.SUPER_ADMIN_EMAIL) {
          return NextResponse.redirect(`${origin}/super-admin`);
        }

        // Regular Google user — check if patient profile exists
        if (next !== "/super-admin") {
          const { data: patient } = await supabase
            .from("patients").select("id").eq("user_id", user.id).single();
          if (!patient) {
            return NextResponse.redirect(`${origin}/patient/complete-profile?next=${next}`);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/patient/login?error=1`);
}
