import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const GLOBAL_KEY = "prisma";

describe("lib/prisma", () => {
  let savedUrl: string | undefined;
  let savedGlobal: unknown;

  beforeEach(() => {
    savedUrl = process.env.DATABASE_URL;
    savedGlobal = (globalThis as Record<string, unknown>)[GLOBAL_KEY];
    delete (globalThis as Record<string, unknown>)[GLOBAL_KEY];
    vi.resetModules();
  });

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
    if (savedGlobal === undefined)
      delete (globalThis as Record<string, unknown>)[GLOBAL_KEY];
    else (globalThis as Record<string, unknown>)[GLOBAL_KEY] = savedGlobal;
    vi.resetModules();
  });

  it("throws a clear error when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    await expect(import("@/lib/prisma")).rejects.toThrow(
      "DATABASE_URL is not set",
    );
  });

  it("creates a client and reuses the global singleton", async () => {
    process.env.DATABASE_URL =
      "postgresql://postgres:postgres@localhost:5432/expense_tracker";

    const first = await import("@/lib/prisma");
    const second = await import("@/lib/prisma");

    expect(first.prisma).toBeDefined();
    expect(second.prisma).toBe(first.prisma);
    expect(
      (globalThis as Record<string, unknown>)[GLOBAL_KEY],
    ).toBe(first.prisma);

    await first.prisma.$disconnect().catch(() => {});
  });
});
