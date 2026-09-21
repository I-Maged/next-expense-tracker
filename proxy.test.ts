import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";

import { config, proxy } from "@/proxy";

function makeRequest(
  pathname: string,
  hasSession: boolean,
  cookieName = "better-auth.session_token",
): NextRequest {
  return {
    cookies: {
      has: (name: string) => name === cookieName && hasSession,
    },
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    // Minimal NextRequest stub — proxy reads only cookies/nextUrl/url.
  } as unknown as NextRequest;
}

function locationOf(response: Response | undefined): string | null {
  if (!response) return null;
  return response.headers.get("location");
}

describe("proxy", () => {
  it.each(["/dashboard", "/transactions", "/budgets", "/settings"])(
    "redirects logged-out %s to /login",
    (pathname) => {
      const response = proxy(makeRequest(pathname, false));

      expect(locationOf(response)).toContain("/login");
    },
  );

  it("redirects logged-out nested protected paths to /login", () => {
    const response = proxy(makeRequest("/settings/account", false));

    expect(locationOf(response)).toContain("/login");
  });

  it.each(["/login", "/signup"])(
    "redirects logged-in %s to /dashboard",
    (pathname) => {
      const response = proxy(makeRequest(pathname, true));

      expect(locationOf(response)).toContain("/dashboard");
    },
  );

  it.each(["/dashboard", "/transactions", "/budgets", "/settings"])(
    "lets logged-in %s through",
    (pathname) => {
      const response = proxy(makeRequest(pathname, true));

      expect(locationOf(response)).toBeNull();
    },
  );

  it.each(["/login", "/signup", "/"])(
    "lets logged-out %s through when no guard applies",
    (pathname) => {
      const response = proxy(makeRequest(pathname, false));

      expect(locationOf(response)).toBeNull();
    },
  );

  it.each(["/dashboard", "/transactions", "/budgets", "/settings"])(
    "recognizes the secure session cookie on protected %s",
    (pathname) => {
      const response = proxy(
        makeRequest(pathname, true, "__Secure-better-auth.session_token"),
      );

      expect(locationOf(response)).toBeNull();
    },
  );

  it.each(["/login", "/signup"])(
    "redirects %s to /dashboard with the secure session cookie",
    (pathname) => {
      const response = proxy(
        makeRequest(pathname, true, "__Secure-better-auth.session_token"),
      );

      expect(locationOf(response)).toContain("/dashboard");
    },
  );

  it("redirects logged-out protected paths with the secure cookie name to /login", () => {
    const response = proxy(
      makeRequest("/dashboard", false, "__Secure-better-auth.session_token"),
    );

    expect(locationOf(response)).toContain("/login");
  });

  it("covers protected and auth routes in matcher", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        "/dashboard/:path*",
        "/transactions/:path*",
        "/budgets/:path*",
        "/settings/:path*",
        "/login",
        "/signup",
      ]),
    );
  });
});
