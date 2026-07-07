import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";
import {
  emptyLocalized,
  type LocalizedText,
  type Poi,
  type PoiCategory,
  type PoiDraft,
  type PoiImage,
} from "./types";

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

/** List existing catalog POIs so the editor can pick one (backend `GET /admin/pois`). */
export function listPois(): Promise<Poi[]> {
  if (USE_MOCK_API)
    return mockDelay(Object.values(store).map((p) => structuredClone(p)));
  return apiRequest<PoiAdminResponse[]>("/admin/pois").then((rows) =>
    rows.map(fromAdmin)
  );
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

/** Delete a POI (backend `DELETE /admin/pois/{id}`; gallery links cascade). */
export function deletePoi(id: string): Promise<void> {
  if (USE_MOCK_API) return mockDeletePoi(id);
  return apiRequest<void>(`/admin/pois/${id}`, { method: "DELETE" });
}

/** Enable/disable a POI (backend `PUT /admin/pois/{id}/published`). */
export function setPoiPublished(id: string, published: boolean): Promise<void> {
  if (USE_MOCK_API) return mockSetPublished(id, published);
  return apiRequest<void>(`/admin/pois/${id}/published`, {
    method: "PUT",
    body: { published },
  });
}

/* --- Gallery -------------------------------------------------------------- */

export function listPoiImages(poiId: string): Promise<PoiImage[]> {
  if (USE_MOCK_API) return mockDelay([...(gallery[poiId] ?? [])]);
  return apiRequest<PoiImage[]>(`/admin/pois/${poiId}/images`);
}

export function addPoiImage(
  poiId: string,
  mediaId: string,
  cover = false
): Promise<PoiImage> {
  if (USE_MOCK_API) return mockAddImage(poiId, mediaId, cover);
  return apiRequest<PoiImage>(`/admin/pois/${poiId}/images`, {
    method: "POST",
    body: { mediaId, cover },
  });
}

export function removePoiImage(poiId: string, mediaId: string): Promise<void> {
  if (USE_MOCK_API) return mockRemoveImage(poiId, mediaId);
  return apiRequest<void>(`/admin/pois/${poiId}/images/${mediaId}`, {
    method: "DELETE",
  });
}

export function setPoiCover(poiId: string, mediaId: string): Promise<void> {
  if (USE_MOCK_API) return mockSetCover(poiId, mediaId);
  return apiRequest<void>(`/admin/pois/${poiId}/images/${mediaId}/cover`, {
    method: "PUT",
  });
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
const gallery: Record<string, PoiImage[]> = {
  "poi-01": [
    { mediaId: "med-01", position: 0, cover: true },
    { mediaId: "med-02", position: 1, cover: false },
  ],
};

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

function mockDeletePoi(id: string): Promise<void> {
  delete store[id];
  delete gallery[id];
  return mockDelay(undefined);
}

function mockSetPublished(id: string, published: boolean): Promise<void> {
  if (store[id]) store[id].published = published;
  return mockDelay(undefined);
}

function mockAddImage(
  poiId: string,
  mediaId: string,
  cover: boolean
): Promise<PoiImage> {
  const list = (gallery[poiId] ??= []);
  const img: PoiImage = {
    mediaId,
    position: list.length,
    cover: cover || list.length === 0,
  };
  if (img.cover) list.forEach((i) => (i.cover = false));
  list.push(img);
  return mockDelay({ ...img });
}

function mockRemoveImage(poiId: string, mediaId: string): Promise<void> {
  gallery[poiId] = (gallery[poiId] ?? []).filter((i) => i.mediaId !== mediaId);
  return mockDelay(undefined);
}

function mockSetCover(poiId: string, mediaId: string): Promise<void> {
  (gallery[poiId] ?? []).forEach((i) => (i.cover = i.mediaId === mediaId));
  return mockDelay(undefined);
}
