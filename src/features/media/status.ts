import type { ChipIntent } from "@shared/ui";
import type { MediaStatus } from "./types";

export const MEDIA_INTENT: Record<MediaStatus, ChipIntent> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "critical",
};

export const MEDIA_STATUSES: MediaStatus[] = ["PENDING", "APPROVED", "REJECTED"];
