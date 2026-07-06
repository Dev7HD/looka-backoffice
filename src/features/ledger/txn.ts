import type { ChipIntent } from "@shared/ui";
import type { EscrowHealth, TxnType } from "./types";

export const TXN_INTENT: Record<TxnType, ChipIntent> = {
  LOCK: "info",
  CAPTURE: "primary",
  REFUND: "neutral",
  TOPUP: "success",
  COMPENSATION: "brass",
};

export const HEALTH_INTENT: Record<EscrowHealth, ChipIntent> = {
  HEALTHY: "success",
  WATCH: "warning",
  CRITICAL: "critical",
};

export const TXN_TYPES: TxnType[] = [
  "LOCK",
  "CAPTURE",
  "REFUND",
  "TOPUP",
  "COMPENSATION",
];
