/** Admin theme preference. "system" follows the OS color scheme. */
export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "louka.theme";
export const THEMES: Theme[] = ["light", "dark", "system"];

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

export function getStoredTheme(): Theme {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

/** Apply the resolved scheme to <html data-theme> and persist the choice. */
export function applyTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", resolveTheme(theme));
}

/** Call once at startup, before first paint. */
export function initTheme(): void {
  applyTheme(getStoredTheme());
  // React to OS changes while on "system".
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (getStoredTheme() === "system") applyTheme("system");
  });
}
