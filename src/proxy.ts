import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Edge-of-app gate. Cheap check only — it confirms a *validly signed* admin
 * session cookie exists before letting a request reach the admin area. The
 * authoritative check (account exists, not disabled, role) runs server-side in
 * `requireAdmin()` for every admin page and server action.
 */
const SESSION_COOKIE = "monor_admin";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret, {
      issuer: "monor-store",
      audience: "monor-admin",
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard the private admin area; /admin/login stays public.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await hasValidSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Bounce an authenticated admin away from the login page.
  if (pathname === "/admin/login") {
    const ok = await hasValidSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
