import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";
import { emptyLocalized, type LocalizedText, type Poi, type PoiCategory, type PoiDraft } from "./types";

/** Backend PoiAdminResponse (tour-poi-catalog). */
interface PoiAdminResponse {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  audioGuide: LocalizedText;
  latitude: number;
  longitude: number;
  category: PoiCategory;
  owner: string | null;
  published: boolean;
}
interface CreatedResponse {
  id: string;
}

function fromAdmin(r: PoiAdminResponse): Poi {
  return {
    id: r.id,
    category: r.category,
    name: { ...emptyLocalized(), ...r.name },
    description: { ...emptyLocalized(), ...r.description },
    audioGuide: { ...emptyLocalized(), ...(r.audioGuide ?? {}) },
    center: { lng: r.longitude, lat: r.latitude },
    geofence: [], // not stored by the catalog (point only)
    published: r.published,
  };
}

/** PoiUpsertRequest — full locale maps + point. */
function toUpsert(draft: PoiDraft) {
  return {
    name: draft.name,
    description: draft.description,
    audioGuide: draft.audioGuide,
    latitude: draft.center.lat,
    longitude: draft.center.lng,
    category: draft.category,
    owner: null,
  };
}

export function getPoi(id: string): Promise<Poi> {
  if (USE_MOCK_API) return mockGetPoi(id);
  return apiRequest<PoiAdminResponse>(`/admin/pois/${id}`).then(fromAdmin);
}

export async function savePoi(draft: PoiDraft, publish: boolean): Promise<Poi> {
  if (USE_MOCK_API) return mockSavePoi(draft, publish);
  const body = toUpsert(draft);
  if (draft.id) {
    await apiRequest<void>(`/admin/pois/${draft.id}`, { method: "PUT", body });
    return getPoi(draft.id);
  }
  const created = await apiRequest<CreatedResponse>("/admin/pois", {
    method: "POST",
    body,
  });
  return getPoi(created.id);
}

/* --- Mock ---------------------------------------------------------------- */

const seed: Poi = {
  id: "poi-01",
  category: "MONUMENT",
  name: {
    fr: "Mosquée Koutoubia",
    en: "Koutoubia Mosque",
    es: "Mezquita de la Kutubía",
    ar: "مسجد الكتبية",
  },
  description: {
    fr: "Grande mosquée du XIIe siècle, emblème de Marrakech.",
    en: "12th-century grand mosque, emblem of Marrakech.",
    es: "",
    ar: "",
  },
  audioGuide: { fr: "", en: "", es: "", ar: "" },
  center: { lng: -7.9938, lat: 31.6242 },
  geofence: [
    { lng: -7.9948, lat: 31.6252 },
    { lng: -7.9928, lat: 31.6252 },
    { lng: -7.9926, lat: 31.6234 },
    { lng: -7.995, lat: 31.6234 },
  ],
  published: false,
};

const store: Record<string, Poi> = { "poi-01": structuredClone(seed) };

function mockGetPoi(id: string): Promise<Poi> {
  const p = store[id];
  if (!p) return Promise.reject(new Error(`POI ${id} not found`));
  return mockDelay(structuredClone(p));
}

function mockSavePoi(draft: PoiDraft, publish: boolean): Promise<Poi> {
  const id = draft.id ?? `poi-${Object.keys(store).length + 1}`;
  const saved: Poi = { ...draft, id, published: publish };
  store[id] = structuredClone(saved);
  return mockDelay(structuredClone(saved));
}
