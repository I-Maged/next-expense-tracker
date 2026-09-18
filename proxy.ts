import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/settings",
] as const;

const AUTH_PAGES = ["/login", "/signup"] as const;

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("better-auth.session_token");
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname === AUTH_PAGES[0] || pathname === AUTH_PAGES[1]) &&
    hasSession
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
