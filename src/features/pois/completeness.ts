import { LOCALES, type Locale } from "@shared/i18n/config";
import type { LocalizedText, PoiDraft } from "./types";

/** Locales with a non-empty value for a localized field. */
export function filledLocales(text: LocalizedText): Locale[] {
  return LOCALES.filter((l) => text[l].trim().length > 0);
}

/** Locales missing at least one required localized field. */
export function missingLocales(draft: PoiDraft): Locale[] {
  return LOCALES.filter(
    (l) => !draft.name[l].trim() || !draft.description[l].trim()
  );
}

/** Publish requires every language complete on every localized field. */
export function isPublishable(draft: PoiDraft): boolean {
  return missingLocales(draft).length === 0 && draft.geofence.length >= 3;
}
