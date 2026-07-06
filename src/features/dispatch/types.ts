import type { RideStatus } from "@shared/ui";
import type { GeofencePoint } from "@shared/map/types";

export interface LiveRide {
  id: string; // RD-xxxx
  status: RideStatus;
  partner: string;
  driver: string;
  passengers: number;
  pos: GeofencePoint;
  updatedAt: number; // epoch ms
}

/** WebSocket frames from the dispatch channel. */
export type RideEvent =
  | { type: "snapshot"; rides: LiveRide[] }
  | { type: "position"; id: string; pos: GeofencePoint; at: number }
  | { type: "state"; id: string; status: RideStatus; at: number };

/** Terminal states — ride drops off the active board. */
export const TERMINAL: RideStatus[] = ["COMPLETED", "CANCELLED", "ABANDONED"];

export function isTerminal(s: RideStatus): boolean {
  return TERMINAL.includes(s);
}
