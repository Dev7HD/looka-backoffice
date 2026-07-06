import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPoi, savePoi } from "./api";
import type { PoiDraft } from "./types";

export const poiKeys = {
  detail: (id: string) => ["pois", "detail", id] as const,
};

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
    },
  });
}
