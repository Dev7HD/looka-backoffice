import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPoiImage,
  deletePoi,
  getPoi,
  listPoiImages,
  listPois,
  removePoiImage,
  savePoi,
  setPoiCover,
  setPoiPublished,
} from "./api";
import type { PoiDraft } from "./types";

export const poiKeys = {
  list: ["pois", "list"] as const,
  detail: (id: string) => ["pois", "detail", id] as const,
  images: (id: string) => ["pois", "images", id] as const,
};

/** Existing catalog POIs for the editor's picker. */
export function usePoiList() {
  return useQuery({
    queryKey: poiKeys.list,
    queryFn: listPois,
  });
}

export function usePoi(id: string | null) {
  return useQuery({
    queryKey: poiKeys.detail(id ?? ""),
    queryFn: () => getPoi(id as string),
    enabled: !!id,
  });
}

export function useSavePoi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { draft: PoiDraft; publish: boolean }) =>
      savePoi(v.draft, v.publish),
    onSuccess: (poi) => {
      qc.setQueryData(poiKeys.detail(poi.id), poi);
      qc.invalidateQueries({ queryKey: poiKeys.list });
    },
  });
}

export function useDeletePoi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePoi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: poiKeys.list }),
  });
}

export function useSetPoiPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; published: boolean }) =>
      setPoiPublished(v.id, v.published),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: poiKeys.detail(v.id) });
      qc.invalidateQueries({ queryKey: poiKeys.list });
    },
  });
}

/* --- Gallery -------------------------------------------------------------- */

export function usePoiImages(poiId: string | null) {
  return useQuery({
    queryKey: poiKeys.images(poiId ?? ""),
    queryFn: () => listPoiImages(poiId as string),
    enabled: !!poiId,
  });
}

export function useAddPoiImage(poiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { mediaId: string; cover?: boolean }) =>
      addPoiImage(poiId, v.mediaId, v.cover),
    onSuccess: () => qc.invalidateQueries({ queryKey: poiKeys.images(poiId) }),
  });
}

export function useRemovePoiImage(poiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => removePoiImage(poiId, mediaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: poiKeys.images(poiId) }),
  });
}

export function useSetPoiCover(poiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => setPoiCover(poiId, mediaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: poiKeys.images(poiId) }),
  });
}
