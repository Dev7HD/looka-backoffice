import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";

/** Range selector shared by the time-series endpoints. */
export type MetricRange = "7d" | "30d";

/** GET /admin/dashboard/kpis */
export interface DashboardKpis {
  activeRides: number;
  pendingPartners: number;
  escrowBalance: number;
  abandoned24h: number;
}

/** GET /admin/dashboard/series?metric=&range= */
export interface MetricSeries {
  metric: string;
  labels: string[];
  values: number[];
}

/** GET /admin/dashboard/ride-outcomes?range= */
export interface RideOutcomes {
  completed: number;
  cancelled: number;
  abandoned: number;
}

/** GET /admin/dashboard/pending-partners */
export interface PendingPartner {
  id: string;
  name: string;
  submittedAt: string;
}

/** GET /admin/dashboard/driver-status */
export interface DriverStatus {
  online: number;
  onRide: number;
  offline: number;
}

/** GET /admin/dashboard/top-pois?range= */
export interface TopPoi {
  id: string;
  name: string;
  visits: number;
}

// --- Mock fixtures (served when VITE_USE_MOCK_API !== "false") --------------
const MOCK_KPIS: DashboardKpis = {
  activeRides: 42,
  pendingPartners: 7,
  escrowBalance: 128_400,
  abandoned24h: 3,
};

function series(metric: string, range: MetricRange, base: number, spread: number): MetricSeries {
  const n = range === "7d" ? 7 : 30;
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = n - 1; i >= 0; i--) {
    labels.push(`D-${i}`);
    // Deterministic pseudo-variation so mock charts look alive without RNG.
    values.push(Math.round(base + Math.sin(i * 1.1) * spread + (i % 3) * spread * 0.2));
  }
  return { metric, labels, values };
}

const MOCK_OUTCOMES: RideOutcomes = { completed: 312, cancelled: 28, abandoned: 11 };

const MOCK_PENDING: PendingPartner[] = [
  { id: "ptr-08", name: "Atlas Riads", submittedAt: "2026-07-06T09:00:00Z" },
  { id: "ptr-09", name: "Medina Guides Co.", submittedAt: "2026-07-06T15:30:00Z" },
  { id: "ptr-10", name: "Sahara Trek Ltd.", submittedAt: "2026-07-07T08:10:00Z" },
];

const MOCK_DRIVER_STATUS: DriverStatus = { online: 54, onRide: 42, offline: 18 };

const MOCK_TOP_POIS: TopPoi[] = [
  { id: "poi-01", name: "Koutoubia", visits: 1280 },
  { id: "poi-02", name: "Jardin Majorelle", visits: 1104 },
  { id: "poi-03", name: "Bahia Palace", visits: 870 },
  { id: "poi-04", name: "Medina Souks", visits: 645 },
  { id: "poi-05", name: "Menara Gardens", visits: 412 },
];

export function fetchKpis(): Promise<DashboardKpis> {
  if (USE_MOCK_API) return mockDelay(MOCK_KPIS);
  return apiRequest<DashboardKpis>("/admin/dashboard/kpis");
}

export function fetchSeries(metric: "rides" | "revenue", range: MetricRange = "7d"): Promise<MetricSeries> {
  if (USE_MOCK_API) {
    return mockDelay(
      metric === "revenue" ? series(metric, range, 4200, 900) : series(metric, range, 48, 14)
    );
  }
  return apiRequest<MetricSeries>("/admin/dashboard/series", { query: { metric, range } });
}

export function fetchRideOutcomes(range: MetricRange = "7d"): Promise<RideOutcomes> {
  if (USE_MOCK_API) return mockDelay(MOCK_OUTCOMES);
  return apiRequest<RideOutcomes>("/admin/dashboard/ride-outcomes", { query: { range } });
}

export function fetchPendingPartners(): Promise<PendingPartner[]> {
  if (USE_MOCK_API) return mockDelay(MOCK_PENDING);
  return apiRequest<PendingPartner[]>("/admin/dashboard/pending-partners");
}

export function fetchDriverStatus(): Promise<DriverStatus> {
  if (USE_MOCK_API) return mockDelay(MOCK_DRIVER_STATUS);
  return apiRequest<DriverStatus>("/admin/dashboard/driver-status");
}

export function fetchTopPois(range: MetricRange = "7d"): Promise<TopPoi[]> {
  if (USE_MOCK_API) return mockDelay(MOCK_TOP_POIS);
  return apiRequest<TopPoi[]>("/admin/dashboard/top-pois", { query: { range } });
}
