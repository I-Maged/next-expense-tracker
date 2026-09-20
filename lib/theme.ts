export const THEME_STORAGE_KEY = "expense-tracker-theme";

export type Theme = "light" | "dark";

export function resolveStoredTheme(value: string | null): Theme | null {
  if (value === "light" || value === "dark") return value;
  return null;
}

export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(t);}catch(e){}})();`;
