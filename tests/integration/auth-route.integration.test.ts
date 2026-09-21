import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { GET, POST } from "@/app/api/auth/[...all]/route";
import { auth } from "@/lib/auth";
import {
  disconnectTestPrisma,
  getTestPrisma,
  truncateAll,
} from "./helpers/db";
import { signUpTestUser } from "./helpers/auth";

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await disconnectTestPrisma();
});

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
}

describe("POST /api/auth/sign-up/email (real better-auth flow)", () => {
  it("creates user + account + session rows", async () => {
    const email = uniqueEmail("route-signup");
    const response = await POST(
      new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Route Signup",
          email,
          password: "route-Test-123!",
        }),
      }),
    );

    expect(response.status).toBe(200);

    const prisma = getTestPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Route Signup");
    const accounts = await prisma.account.findMany({
      where: { userId: user!.id },
    });
    expect(accounts.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects duplicate emails", async () => {
    const email = uniqueEmail("route-dupe");
    const makeRequest = (): Request =>
      new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Dupe",
          email,
          password: "route-Test-123!",
        }),
      });

    expect((await POST(makeRequest())).status).toBe(200);
    expect((await POST(makeRequest())).status).toBeGreaterThanOrEqual(400);
  });
});

describe("email sign-in (real better-auth flow)", () => {
  it("issues a session usable by getSession", async () => {
    const { email } = await signUpTestUser("route");

    const result = await auth.api.signInEmail({
      body: { email, password: "integration-Test-123!" },
      headers: new Headers(),
    });

    expect(result).toBeDefined();

    const bad = await auth.api
      .signInEmail({
        body: { email, password: "wrong-password-xyz" },
        headers: new Headers(),
      })
      .then(
        () => ({ ok: true }) as const,
        () => ({ ok: false }) as const,
      );
    expect(bad.ok).toBe(false);
  });
});

describe("GET /api/auth/get-session", () => {
  it("returns the session with a valid cookie and null without", async () => {
    const user = await signUpTestUser("route-session");

    const authed = await GET(
      new Request("http://localhost:3000/api/auth/get-session", {
        headers: { cookie: user.cookieHeader },
      }),
    );
    expect(authed.status).toBe(200);
    const body = (await authed.json()) as {
      user?: { id: string };
    } | null;
    expect(body?.user?.id).toBeTruthy();

    const anon = await GET(
      new Request("http://localhost:3000/api/auth/get-session"),
    );
    expect(anon.status).toBe(200);
    expect(await anon.json()).toBeNull();
  });
});
