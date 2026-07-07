import { useEffect, useState } from "react";

/** Read a design-system token off :root so charts never hardcode a color and
 *  always follow the active (light/dark) theme. */
export function token(name: string): string {
  if (typeof window === "undefined") return "#000";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Palette pulled from tokens.css — call inside render so a theme flip repaints. */
export function chartPalette() {
  return {
    ink: token("--c-ink"),
    inkSoft: token("--c-ink-soft"),
    line: token("--c-line"),
    surface: token("--c-surface"),
    series: [
      token("--c-primary"),
      token("--c-brass"),
      token("--c-info"),
      token("--c-success"),
      token("--c-critical"),
    ],
  };
}

/** Bumps whenever <html data-theme> changes so token-driven charts re-render. */
export function useThemeVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => setV((n) => n + 1));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);
  return v;
}
