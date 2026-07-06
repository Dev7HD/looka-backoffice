import {
  API_BASE_URL,
  apiRequest,
  apiUpload,
  mockDelay,
  USE_MOCK_API,
} from "@shared/api/client";
import type { MediaItem, MediaPage, MediaStatus } from "./types";

/** Upload media (backend `POST /media`, multipart). Returns the new id. */
export function uploadMedia(file: File): Promise<{ id: string }> {
  if (USE_MOCK_API) return mockDelay({ id: `MED-${Date.now()}` });
  const form = new FormData();
  form.append("file", file);
  return apiUpload<{ id: string }>("/media", form);
}

/** Authenticated media URL (`GET /media/{id}` → 302 presigned). */
export function mediaUrl(id: string): string {
  return `${API_BASE_URL.replace(/\/$/, "")}/media/${id}`;
}

interface ListParams {
  status?: MediaStatus;
}

export function listMedia(params: ListParams = {}): Promise<MediaPage> {
  if (USE_MOCK_API) return mockList(params);
  return apiRequest<MediaPage>("/media", { query: { status: params.status } });
}

export function moderateMedia(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<MediaItem> {
  if (USE_MOCK_API) return mockModerate(id, status);
  return apiRequest<MediaItem>(`/media/${id}/moderate`, {
    method: "POST",
    body: { status },
  });
}

/* --- Mock fixtures -------------------------------------------------------- */

const POIS = ["Jemaa el-Fnaa", "Bahia Palace", "Menara Gardens", "Koutoubia", "Saadian Tombs", "Majorelle"];
const PARTNERS = ["Medina Tours", "Atlas Guides", "Sahara Co.", "Coastal Trips"];
const LOCALES = ["fr", "en", "es", "ar"];

const store: Record<string, MediaItem> = Object.fromEntries(
  Array.from({ length: 9 }, (_, i) => {
    const id = `MED-${700 + i}`;
    const type = i % 3 === 2 ? "AUDIO" : "IMAGE";
    return [
      id,
      {
        id,
        type,
        title: type === "AUDIO" ? `${POIS[i % POIS.length]} narration` : `${POIS[i % POIS.length]} photo`,
        poiName: POIS[i % POIS.length],
        uploadedBy: PARTNERS[i % PARTNERS.length],
        locale: LOCALES[i % LOCALES.length],
        status: (["PENDING", "PENDING", "APPROVED", "REJECTED"] as MediaStatus[])[i % 4],
        uploadedAt: `2026-07-0${1 + (i % 5)}T1${i % 9}:30:00Z`,
        durationSec: type === "AUDIO" ? 45 + i * 12 : undefined,
      } satisfies MediaItem,
    ];
  })
);

function mockList({ status }: ListParams): Promise<MediaPage> {
  const items = Object.values(store)
    .filter((m) => !status || m.status === status)
    .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  return mockDelay({ items, total: items.length });
}

function mockModerate(id: string, status: "APPROVED" | "REJECTED"): Promise<MediaItem> {
  const m = store[id];
  if (!m) return Promise.reject(new Error(`Media ${id} not found`));
  m.status = status;
  return mockDelay({ ...m });
}
