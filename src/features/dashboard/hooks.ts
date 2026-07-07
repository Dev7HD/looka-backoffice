import { useQuery } from "@tanstack/react-query";
import {
  fetchDriverStatus,
  fetchKpis,
  fetchPendingPartners,
  fetchRideOutcomes,
  fetchSeries,
  fetchTopPois,
  type MetricRange,
} from "./api";

export function useKpis() {
  return useQuery({ queryKey: ["dashboard", "kpis"], queryFn: fetchKpis });
}

export function useMetricSeries(metric: "rides" | "revenue", range: MetricRange = "7d") {
  return useQuery({
    queryKey: ["dashboard", "series", metric, range],
    queryFn: () => fetchSeries(metric, range),
  });
}

export function useRideOutcomes(range: MetricRange = "7d") {
  return useQuery({
    queryKey: ["dashboard", "ride-outcomes", range],
    queryFn: () => fetchRideOutcomes(range),
  });
}

export function usePendingPartners() {
  return useQuery({
    queryKey: ["dashboard", "pending-partners"],
    queryFn: fetchPendingPartners,
  });
}

export function useDriverStatus() {
  return useQuery({ queryKey: ["dashboard", "driver-status"], queryFn: fetchDriverStatus });
}

export function useTopPois(range: MetricRange = "7d") {
  return useQuery({
    queryKey: ["dashboard", "top-pois", range],
    queryFn: () => fetchTopPois(range),
  });
}
