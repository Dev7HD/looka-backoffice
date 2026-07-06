import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPreferences, updatePreferences } from "./api";
import type { AdminPreferences } from "./types";

export const prefKeys = { me: ["me", "preferences"] as const };

export function usePreferences() {
  return useQuery({ queryKey: prefKeys.me, queryFn: getPreferences });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: AdminPreferences) => updatePreferences(prefs),
    onSuccess: (data) => qc.setQueryData(prefKeys.me, data),
  });
}
