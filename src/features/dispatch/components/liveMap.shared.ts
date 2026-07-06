import type { RideStatus } from "@shared/ui";
import type { LiveRide } from "../types";

export interface LiveMapProps {
  rides: LiveRide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const MAP_CENTER = { lng: -7.99, lat: 31.63 };

/** Ride status → CSS color (token references resolved at render). */
export const RIDE_COLOR: Record<RideStatus, string> = {
  PENDING: "var(--c-ride-pending)",
  VALIDATED: "var(--c-ride-validated)",
  IN_TOUR: "var(--c-ride-in-tour)",
  COMPLETED: "var(--c-ride-completed)",
  CANCELLED: "var(--c-ride-cancelled)",
  ABANDONED: "var(--c-ride-abandoned)",
};
