"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY, resolveStoredTheme } from "@/lib/theme";
import type { Theme } from "@/lib/theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = resolveStoredTheme(
      window.localStorage.getItem(THEME_STORAGE_KEY),
    );
    if (stored) return stored;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
      return "dark";
  } catch {
    return "light";
  }
  return "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

export function ThemeToggle() {
  // Lazy initializer reads the pre-paint script result; the <html>
  // suppressHydrationWarning in app/layout.tsx covers the first paint.
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleToggle(): void {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="secondary"
      onClick={handleToggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-11 w-11 items-center justify-center p-0"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Moon aria-hidden="true" className="h-4 w-4" />
      )}
    </Button>
  );
}
