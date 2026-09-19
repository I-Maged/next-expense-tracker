import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSession, mockCount, mockCreateMany } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockCount: vi.fn(),
  mockCreateMany: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { category: { count: mockCount, createMany: mockCreateMany } },
}));

import { seedDefaultCategories } from "@/actions/categories";

describe("seedDefaultCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Not authenticated without a session", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockCount).not.toHaveBeenCalled();
  });

  it("seeds 8 defaults when the user has zero categories", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockResolvedValue(0);
    mockCreateMany.mockResolvedValue({ count: 8 });

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: true });
    expect(mockCreateMany).toHaveBeenCalledOnce();
    const data = mockCreateMany.mock.calls[0][0].data as Array<{
      userId: string;
      name: string;
      color: string;
    }>;
    expect(data).toHaveLength(8);
    expect(data.map((c) => c.name)).toEqual([
      "Food",
      "Transport",
      "Rent",
      "Utilities",
      "Shopping",
      "Health",
      "Entertainment",
      "Other",
    ]);
    for (const row of data) {
      expect(row.userId).toBe("user_1");
      expect(row.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("skips seeding when categories already exist", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockResolvedValue(3);

    const result = await seedDefaultCategories();

    expect(result).toEqual({ success: true });
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("returns a friendly error when prisma throws", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user_1" } });
    mockCount.mockRejectedValue(new Error("db down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await seedDefaultCategories();

    expect(result).toEqual({
      success: false,
      error: "Failed to seed categories",
    });
    consoleSpy.mockRestore();
  });
});
