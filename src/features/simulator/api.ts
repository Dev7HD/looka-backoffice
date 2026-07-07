import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";
import type { PoiCategory } from "@/features/pois/types";
import type {
  NearbyDriver,
  SavedTourSummary,
  SaveTourRequest,
  SuggestRequest,
  SuggestedStop,
  TourPreference,
  TourSuggestion,
} from "./types";

export function suggestTour(req: SuggestRequest): Promise<TourSuggestion> {
  if (USE_MOCK_API) return mockSuggest(req);
  return apiRequest<TourSuggestion>("/tours/suggest", { method: "POST", body: req });
}

export function nearbyDrivers(lat: number, lon: number): Promise<NearbyDriver[]> {
  if (USE_MOCK_API) return mockDrivers(lat, lon);
  return apiRequest<NearbyDriver[]>("/drivers/nearby", {
    query: { lat, lon, radius: 5000, limit: 5 },
  });
}

export function saveTour(req: SaveTourRequest): Promise<{ id: string }> {
  if (USE_MOCK_API) return mockSaveTour(req);
  return apiRequest<{ id: string }>("/tours", { method: "POST", body: req });
}

export function listSavedTours(): Promise<SavedTourSummary[]> {
  if (USE_MOCK_API) return mockDelay(Object.values(savedStore));
  return apiRequest<SavedTourSummary[]>("/tours", { query: { status: "PLANNED" } });
}

export function deleteTour(id: string): Promise<void> {
  if (USE_MOCK_API) {
    delete savedStore[id];
    return mockDelay(undefined);
  }
  return apiRequest<void>(`/tours/${id}`, { method: "DELETE" });
}

/* --- Mock fixtures (deterministic around the clicked point) --------------- */

const POI_POOL: { name: string; category: PoiCategory }[] = [
  { name: "Koutoubia Mosque", category: "RELIGIOUS_SITE" },
  { name: "Bahia Palace", category: "MONUMENT" },
  { name: "Jemaa el-Fnaa", category: "MARKET" },
  { name: "Majorelle Garden", category: "PARK" },
  { name: "Saadian Tombs", category: "MONUMENT" },
  { name: "El Badi Palace", category: "MONUMENT" },
  { name: "Café de France", category: "CAFE" },
  { name: "Café des Épices", category: "CAFE" },
  { name: "Dar Yacout", category: "RESTAURANT" },
  { name: "Le Jardin", category: "RESTAURANT" },
];

function allowed(pref: TourPreference): PoiCategory[] {
  const base: PoiCategory[] = [
    "MONUMENT", "MUSEUM", "VIEWPOINT", "PARK", "BEACH", "MARKET", "RELIGIOUS_SITE", "OTHER",
  ];
  if (pref !== "TOURIST") base.push("RESTAURANT");
  if (pref === "TOURIST_FOOD_COFFEE") base.push("CAFE");
  return base;
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371008.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Stable per-name pseudo-random offset so re-suggest with exclude behaves. */
function offsetFor(name: string): { dLat: number; dLon: number } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return { dLat: ((hash % 100) - 50) / 5000, dLon: (((hash >> 5) % 100) - 50) / 5000 };
}

function mockSuggest(req: SuggestRequest): Promise<TourSuggestion> {
  const exclude = new Set(req.exclude ?? []);
  const cats = allowed(req.preference);
  const wantFood = req.preference !== "TOURIST";
  const wantCoffee = req.preference === "TOURIST_FOOD_COFFEE";
  const n = req.stops ?? 5;

  const candidates = POI_POOL.filter((p) => cats.includes(p.category)).map((p) => {
    const o = offsetFor(p.name);
    const lat = req.latitude + o.dLat;
    const lng = req.longitude + o.dLon;
    return { ...p, poiId: `mock-${p.name.replace(/\s+/g, "-").toLowerCase()}`, lat, lng };
  }).filter((c) => !exclude.has(c.poiId));

  // greedy nearest neighbour with role slots
  const roles: ("TOURIST" | "FOOD" | "COFFEE" | "ANY")[] = n === 1
    ? ["ANY"]
    : Array.from({ length: n }, () => "TOURIST" as const);
  if (n >= 2 && wantFood) roles[Math.floor(n / 2)] = "FOOD";
  if (n >= 2 && wantCoffee) roles[Math.floor(n / 4)] = "COFFEE";

  const picked: SuggestedStop[] = [];
  const used = new Set<string>();
  let cur = { lat: req.latitude, lng: req.longitude };
  let cumulative = 0;
  roles.forEach((role, i) => {
    const wantCat: PoiCategory[] | null =
      role === "FOOD" ? ["RESTAURANT"] : role === "COFFEE" ? ["CAFE"] : null;
    const pool = candidates.filter(
      (c) => !used.has(c.poiId) && (!wantCat || wantCat.includes(c.category)) && (role !== "TOURIST" || (c.category !== "RESTAURANT" && c.category !== "CAFE"))
    );
    const nearest = pool.sort((a, b) => haversine(cur, a) - haversine(cur, b))[0];
    if (!nearest) return;
    used.add(nearest.poiId);
    const leg = haversine(cur, nearest);
    cumulative += leg;
    picked.push({
      order: i + 1,
      poiId: nearest.poiId,
      name: nearest.name,
      category: nearest.category,
      role,
      latitude: nearest.lat,
      longitude: nearest.lng,
      legDistanceMeters: Math.round(leg),
      cumulativeDistanceMeters: Math.round(cumulative),
    });
    cur = { lat: nearest.lat, lng: nearest.lng };
  });

  return mockDelay({
    origin: { latitude: req.latitude, longitude: req.longitude },
    preference: req.preference,
    stops: picked.map((s, i) => ({ ...s, order: i + 1 })),
    totalDistanceMeters: Math.round(cumulative),
  });
}

function mockDrivers(lat: number, lon: number): Promise<NearbyDriver[]> {
  const count = Math.floor((Math.abs(lat * 1000 + lon * 1000) % 4)); // 0..3
  return mockDelay(
    Array.from({ length: count }, (_, i) => ({
      driverId: `DRV-${2100 + i}`,
      distanceMeters: 300 + i * 450,
    }))
  );
}

const savedStore: Record<string, SavedTourSummary> = {};

function mockSaveTour(req: SaveTourRequest): Promise<{ id: string }> {
  const id = `tour-${Object.keys(savedStore).length + 1}`;
  savedStore[id] = {
    id,
    name: req.name,
    scheduledAt: req.scheduledAt,
    status: "PLANNED",
    stopCount: req.stops.length,
  };
  return mockDelay({ id });
}
