import type { ChipIntent } from "@shared/ui";
import type { DriverStatus } from "./types";

export const DRIVER_INTENT: Record<DriverStatus, ChipIntent> = {
  ONLINE: "success",
  ON_RIDE: "brass",
  OFFLINE: "neutral",
  SUSPENDED: "critical",
};

export const DRIVER_STATUSES: DriverStatus[] = [
  "ONLINE",
  "ON_RIDE",
  "OFFLINE",
  "SUSPENDED",
];
