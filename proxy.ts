import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // ── SUBDOMAIN ROUTING ────────────────────────────────────────────────────────
  const rootDomain = process.env.ROOT_DOMAIN || "localhost:3000";
  const subdomain = hostname
    .replace(`.${rootDomain}`, "")
    .replace(rootDomain, "");

  const RESERVED = ["www", "", "super-admin", "api"];
  if (subdomain && !RESERVED.includes(subdomain) && !hostname.startsWith("localhost:")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── SUPABASE AUTH ────────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Super admin — /super-admin/*
  if (pathname.startsWith("/super-admin")) {
    if (pathname === "/super-admin/login") return supabaseResponse;
    if (!user) return NextResponse.redirect(new URL("/super-admin/login", origin));
    if (user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", origin));
    }
  }

  // Doctor admin dashboard — /admin/dashboard
  if (pathname.startsWith("/admin/dashboard") && !user) {
    return NextResponse.redirect(new URL("/admin/login", origin));
  }

  // Patient dashboard (old path)
  if (pathname.startsWith("/patient/dashboard") && !user) {
    return NextResponse.redirect(new URL("/patient/login", origin));
  }

  // Doctor-scoped patient dashboard — /[slug]/patient/dashboard
  const slugDashboardMatch = pathname.match(/^\/([^/]+)\/patient\/dashboard/);
  if (slugDashboardMatch) {
    const slug = slugDashboardMatch[1];
    const reserved = ["super-admin", "admin", "patient", "api", "auth", "appointment", "_next"];
    if (!reserved.includes(slug) && !user) {
      return NextResponse.redirect(new URL(`/${slug}/login`, origin));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
