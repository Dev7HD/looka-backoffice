import { LOCALES, type Locale } from "@shared/i18n/config";

/** Full locale map — every localized field carries all UI languages. */
export type LocalizedText = Record<Locale, string>;

export function emptyLocalized(): LocalizedText {
  return LOCALES.reduce((acc, l) => {
    acc[l] = "";
    return acc;
  }, {} as LocalizedText);
}

/** Matches backend PoiCategory (schemas.md). */
export type PoiCategory =
  | "MONUMENT"
  | "MUSEUM"
  | "VIEWPOINT"
  | "RESTAURANT"
  | "CAFE"
  | "PARK"
  | "BEACH"
  | "MARKET"
  | "RELIGIOUS_SITE"
  | "OTHER";

export const POI_CATEGORIES: PoiCategory[] = [
  "MONUMENT", "MUSEUM", "VIEWPOINT", "RESTAURANT", "CAFE", "PARK",
  "BEACH", "MARKET", "RELIGIOUS_SITE", "OTHER",
];

export interface LngLat {
  lng: number;
  lat: number;
}

export interface Poi {
  id: string;
  category: PoiCategory;
  name: LocalizedText;
  description: LocalizedText;
  /** Audio-guide narration script per locale (backend PoiUpsertRequest). */
  audioGuide: LocalizedText;
  center: LngLat;
  /** Geofence polygon — client-side only; the catalog stores a point, not a
   *  polygon, so this is not round-tripped to the backend. */
  geofence: LngLat[];
  published: boolean;
}

export interface PoiDraft extends Omit<Poi, "id" | "published"> {
  id?: string;
}

/** One image in a POI's gallery (backend `poi_image` → media-storage asset). */
export interface PoiImage {
  mediaId: string;
  position: number;
  cover: boolean;
}
