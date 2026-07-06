import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listMedia, moderateMedia } from "./api";
import type { MediaStatus } from "./types";

export const mediaKeys = {
  all: ["media"] as const,
  list: (status: MediaStatus | undefined) => ["media", "list", status ?? "all"] as const,
};

export function useMedia(status: MediaStatus | undefined) {
  return useQuery({
    queryKey: mediaKeys.list(status),
    queryFn: () => listMedia({ status }),
  });
}

export function useModerateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: "APPROVED" | "REJECTED" }) =>
      moderateMedia(v.id, v.status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}
