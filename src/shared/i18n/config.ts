/** Supported UI locales. AR is RTL. */
export const LOCALES = ["fr", "en", "es", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Locales rendered right-to-left. */
export const RTL_LOCALES: ReadonlySet<Locale> = new Set(["ar"]);

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  ar: "العربية",
};

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale as Locale);
}

export function dirFor(locale: string): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}
