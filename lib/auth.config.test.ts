import { beforeAll, describe, expect, it, vi } from "vitest";

describe("lib/auth config", () => {
  beforeAll(() => {
    // Importing the real auth module needs a DATABASE_URL for the prisma
    // singleton, but nothing connects until the first query.
    process.env.DATABASE_URL ??=
      "postgresql://postgres:postgres@localhost:5432/expense_tracker";
    process.env.BETTER_AUTH_SECRET ??=
      "unit-test-secret-0123456789abcdef-0123456789";
    vi.resetModules();
  });

  it("enables email+password auth", async () => {
    const { auth } = await import("@/lib/auth");

    expect(auth.options.emailAndPassword).toMatchObject({ enabled: true });
  });

  it("uses a 7-day session with daily refresh", async () => {
    const { auth } = await import("@/lib/auth");

    expect(auth.options.session?.expiresIn).toBe(60 * 60 * 24 * 7);
    expect(auth.options.session?.updateAge).toBe(60 * 60 * 24);
  });

  it("wires google/github providers and the postgres adapter", async () => {
    const { auth } = await import("@/lib/auth");

    expect(auth.options.socialProviders?.google).toBeDefined();
    expect(auth.options.socialProviders?.github).toBeDefined();
    // prismaAdapter(postgres) — options.database must be present.
    expect(auth.options.database).toBeDefined();
  });
});
