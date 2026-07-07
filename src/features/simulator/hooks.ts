import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTour,
  listSavedTours,
  nearbyDrivers,
  saveTour,
  suggestTour,
} from "./api";
import type { SaveTourRequest, SuggestRequest } from "./types";

export const simKeys = {
  savedTours: ["simulator", "savedTours"] as const,
};

export function useSuggestTour() {
  return useMutation({ mutationFn: (req: SuggestRequest) => suggestTour(req) });
}

export function useNearbyDrivers() {
  return useMutation({
    mutationFn: (p: { lat: number; lon: number }) => nearbyDrivers(p.lat, p.lon),
  });
}

export function useSavedTours() {
  return useQuery({ queryKey: simKeys.savedTours, queryFn: listSavedTours });
}

export function useSaveTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: SaveTourRequest) => saveTour(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: simKeys.savedTours }),
  });
}

export function useDeleteTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTour(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: simKeys.savedTours }),
  });
}
