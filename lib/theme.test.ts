import { describe, expect, it } from "vitest";

import {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  resolveStoredTheme,
} from "@/lib/theme";

describe("lib/theme", () => {
  it("uses a stable storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("expense-tracker-theme");
  });

  it("accepts only light or dark stored values", () => {
    expect(resolveStoredTheme("light")).toBe("light");
    expect(resolveStoredTheme("dark")).toBe("dark");
    expect(resolveStoredTheme(null)).toBeNull();
    expect(resolveStoredTheme("system")).toBeNull();
  });

  it("inits from storage, else the OS preference, before paint", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_INIT_SCRIPT).toContain("prefers-color-scheme: dark");
    expect(THEME_INIT_SCRIPT).toContain('classList.add(t)');
  });
});
