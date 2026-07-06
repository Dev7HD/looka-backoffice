/** Partner onboarding / approval domain types. Mirror backend DTOs. */

export type PartnerStatus =
  | "PENDING" // awaiting review
  | "CHANGES_REQUESTED" // sent back to partner
  | "VERIFIED" // approved
  | "REJECTED";

export type KycDocType =
  | "REGISTRATION" // business registration
  | "LICENSE" // touristic license
  | "ID" // owner ID / passport
  | "BANK"; // IBAN / bank proof

export type KycDocStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface KycDocument {
  id: string;
  type: KycDocType;
  fileName: string;
  status: KycDocStatus;
  uploadedAt: string; // ISO
}

export interface PartnerSummary {
  id: string;
  businessName: string;
  status: PartnerStatus;
  city: string;
  submittedAt: string; // ISO
  /** Count of KYC docs still pending review. */
  pendingDocs: number;
}

export interface PartnerDetail extends PartnerSummary {
  contactName: string;
  email: string;
  phone: string;
  addressLine: string;
  catalogCount: number;
  documents: KycDocument[];
}

/** Reviewer decision payloads. */
export interface ReviewDecision {
  note?: string;
}
