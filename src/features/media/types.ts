/** Uploaded media pending moderation. Mirror backend DTOs. */

export type MediaType = "IMAGE" | "AUDIO";
export type MediaStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MediaItem {
  id: string; // MED-xxxx
  type: MediaType;
  title: string;
  poiName: string;
  uploadedBy: string; // partner
  locale: string; // fr | en | es | ar (audio narration / caption language)
  status: MediaStatus;
  uploadedAt: string; // ISO
  durationSec?: number; // AUDIO
}

export interface MediaPage {
  items: MediaItem[];
  total: number;
}
