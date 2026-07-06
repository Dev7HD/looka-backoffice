import type { ChipIntent } from "@shared/ui";
import type { KycDocStatus, PartnerStatus } from "./types";

export const PARTNER_INTENT: Record<PartnerStatus, ChipIntent> = {
  PENDING: "info",
  CHANGES_REQUESTED: "warning",
  VERIFIED: "success",
  REJECTED: "critical",
};

export const DOC_INTENT: Record<KycDocStatus, ChipIntent> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "critical",
};
