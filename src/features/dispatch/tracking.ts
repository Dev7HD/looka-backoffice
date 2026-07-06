import { useReducer } from "react";
import { useLiveChannel } from "@shared/realtime/useLiveChannel";
import { getAuthToken } from "@shared/api/client";
import type { GeofencePoint } from "@shared/map/types";

/** Backend RideStatus (schemas.md) — distinct from the board's display vocab. */
export type BackendRideStatus =
  | "REQUESTED"
  | "VALIDATED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ABANDONED";

/** RideTrackingUpdate frame from `ws://…/ws/rides/{rideId}`. */
export interface RideTrackingUpdate {
  type: "STATUS" | "LOCATION";
  rideId: string;
  status?: BackendRideStatus | null;
  latitude?: number | null;
  longitude?: number | null;
  occurredAt: string; // instant
}

export interface RideTrackingState {
  status: BackendRideStatus | null;
  position: GeofencePoint | null;
  updatedAt: string | null;
}

export function applyTrackingFrame(
  state: RideTrackingState,
  f: RideTrackingUpdate
): RideTrackingState {
  if (f.type === "STATUS" && f.status) {
    return { ...state, status: f.status, updatedAt: f.occurredAt };
  }
  if (f.type === "LOCATION" && f.latitude != null && f.longitude != null) {
    return {
      ...state,
      position: { lat: f.latitude, lng: f.longitude },
      updatedAt: f.occurredAt,
    };
  }
  return state;
}

/**
 * Live per-ride tracking against the real gateway socket
 * `ws://<VITE_WS_URL>/ws/rides/{rideId}` (JWT sent as a query token — browsers
 * can't set a bearer header on the WS handshake). Consumes STATUS + LOCATION
 * frames. Idle (disconnected) when no rideId is given.
 */
export function useRideTracking(rideId: string | null) {
  const [state, dispatch] = useReducer(applyTrackingFrame, {
    status: null,
    position: null,
    updatedAt: null,
  });

  const connection = useLiveChannel<RideTrackingUpdate>({
    path: `/ws/rides/${rideId ?? ""}`,
    onMessage: dispatch,
    token: getAuthToken(),
    enabled: !!rideId,
  });

  return { ...state, connection };
}
