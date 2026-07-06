/** Driver roster. Mirror backend DTOs. */

export type DriverStatus = "ONLINE" | "ON_RIDE" | "OFFLINE" | "SUSPENDED";

export interface Driver {
  id: string; // DRV-xxxx
  name: string;
  phone: string;
  vehicle: string;
  city: string;
  status: DriverStatus;
  rating: number; // 0–5
  ridesToday: number;
  currentRideId?: string; // RD-xxxx when ON_RIDE
}

export interface DriversPage {
  drivers: Driver[];
  total: number;
}
