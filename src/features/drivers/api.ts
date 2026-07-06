import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";
import type { Driver, DriverStatus, DriversPage } from "./types";

interface ListParams {
  status?: DriverStatus;
  page?: number;
  pageSize?: number;
}

export function listDrivers(params: ListParams = {}): Promise<DriversPage> {
  if (USE_MOCK_API) return mockList(params);
  return apiRequest<DriversPage>("/drivers", {
    query: {
      status: params.status,
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 20,
    },
  });
}

export function setDriverStatus(
  id: string,
  status: DriverStatus
): Promise<Driver> {
  if (USE_MOCK_API) return mockSetStatus(id, status);
  return apiRequest<Driver>(`/drivers/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

/* --- Mock fixtures -------------------------------------------------------- */

const NAMES = [
  "Rachid Bennani", "Hind Kabbaj", "Omar Tazi", "Leila Mansouri",
  "Samir Alaoui", "Nora Fassi", "Younes Berrada", "Salma Idrissi",
  "Karim Ouazzani", "Amina Sqalli", "Hamza Cherkaoui", "Sofia Bennis",
];
const VEHICLES = ["Dacia Lodgy", "Toyota Prius", "Mercedes Vito", "Renault Express"];
const CITIES = ["Marrakech", "Imlil", "Merzouga", "Essaouira"];
const STATUSES: DriverStatus[] = ["ONLINE", "ON_RIDE", "OFFLINE", "SUSPENDED"];

const store: Record<string, Driver> = Object.fromEntries(
  NAMES.map((name, i) => {
    const id = `DRV-${2100 + i}`;
    const status = STATUSES[i % 4];
    return [
      id,
      {
        id,
        name,
        phone: `+212 6 ${60 + i} ${String(10 + i).padStart(2, "0")} ${String(20 + i).padStart(2, "0")} ${String(30 + i).padStart(2, "0")}`,
        vehicle: VEHICLES[i % VEHICLES.length],
        city: CITIES[i % CITIES.length],
        status,
        rating: Math.round((3.6 + (i % 7) * 0.2) * 10) / 10,
        ridesToday: status === "OFFLINE" ? 0 : (i * 3) % 11,
        currentRideId: status === "ON_RIDE" ? `RD-${4900 + i}` : undefined,
      } satisfies Driver,
    ];
  })
);

function mockList({ status, page = 0, pageSize = 20 }: ListParams): Promise<DriversPage> {
  const all = Object.values(store).filter((d) => !status || d.status === status);
  const start = page * pageSize;
  return mockDelay({ drivers: all.slice(start, start + pageSize), total: all.length });
}

function mockSetStatus(id: string, status: DriverStatus): Promise<Driver> {
  const d = store[id];
  if (!d) return Promise.reject(new Error(`Driver ${id} not found`));
  d.status = status;
  if (status !== "ON_RIDE") d.currentRideId = undefined;
  return mockDelay({ ...d });
}
