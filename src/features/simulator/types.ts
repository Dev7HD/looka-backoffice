import type { PoiCategory } from "@/features/pois/types";

export type TourPreference = "TOURIST" | "TOURIST_FOOD" | "TOURIST_FOOD_COFFEE";
export type StopRole = "TOURIST" | "FOOD" | "COFFEE" | "ANY";

/** Backend TourSuggestion.stops[]. */
export interface SuggestedStop {
  order: number;
  poiId: string;
  name: string;
  category: PoiCategory;
  role: StopRole;
  latitude: number;
  longitude: number;
  legDistanceMeters: number;
  cumulativeDistanceMeters: number;
}

export interface TourSuggestion {
  origin: { latitude: number; longitude: number };
  preference: TourPreference;
  stops: SuggestedStop[];
  totalDistanceMeters: number;
}

export interface SuggestRequest {
  latitude: number;
  longitude: number;
  preference: TourPreference;
  stops?: number;
  radiusMeters?: number;
  exclude?: string[];
}

export interface NearbyDriver {
  driverId: string;
  distanceMeters: number;
}

export type LegMode = "WALK" | "DRIVE";

/** Saved future tour (backend Tour). */
export interface SavedTourSummary {
  id: string;
  name: string;
  scheduledAt: string;
  status: "PLANNED" | "CANCELLED" | "DONE";
  stopCount: number;
}

export interface SaveTourRequest {
  name: string;
  scheduledAt: string;
  stops: { poiId: string; driver: boolean }[];
}
