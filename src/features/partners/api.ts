import {
  apiRequest,
  mockDelay,
  USE_MOCK_API,
} from "@shared/api/client";
import type {
  KycDocStatus,
  PartnerDetail,
  PartnerStatus,
  PartnerSummary,
  ReviewDecision,
} from "./types";

/* ---------------------------------------------------------------------------
 * Endpoints (backend contract). When USE_MOCK_API, served from fixtures below.
 * ------------------------------------------------------------------------- */

export function listPartners(status?: PartnerStatus): Promise<PartnerSummary[]> {
  if (USE_MOCK_API) return mockListPartners(status);
  return apiRequest<PartnerSummary[]>("/partners", { query: { status } });
}

export function getPartner(id: string): Promise<PartnerDetail> {
  if (USE_MOCK_API) return mockGetPartner(id);
  return apiRequest<PartnerDetail>(`/partners/${id}`);
}

export function reviewPartner(
  id: string,
  decision: "VERIFIED" | "REJECTED" | "CHANGES_REQUESTED",
  payload: ReviewDecision = {}
): Promise<PartnerDetail> {
  if (USE_MOCK_API) return mockReview(id, decision);
  return apiRequest<PartnerDetail>(`/partners/${id}/review`, {
    method: "POST",
    body: { decision, ...payload },
  });
}

export function setDocStatus(
  partnerId: string,
  docId: string,
  status: KycDocStatus
): Promise<PartnerDetail> {
  if (USE_MOCK_API) return mockSetDoc(partnerId, docId, status);
  return apiRequest<PartnerDetail>(
    `/partners/${partnerId}/documents/${docId}`,
    { method: "PATCH", body: { status } }
  );
}

/* ---------------------------------------------------------------------------
 * Mock fixtures — in-memory store, mutations persist for the session.
 * ------------------------------------------------------------------------- */

const store: Record<string, PartnerDetail> = {
  "ptr-01": {
    id: "ptr-01",
    businessName: "Medina Tours",
    status: "PENDING",
    city: "Marrakech",
    submittedAt: "2026-07-01T09:20:00Z",
    contactName: "Yassine El Amrani",
    email: "yassine@medinatours.ma",
    phone: "+212 6 61 20 33 44",
    addressLine: "12 Rue Riad Zitoun, Marrakech",
    catalogCount: 8,
    pendingDocs: 2,
    documents: [
      { id: "d1", type: "REGISTRATION", fileName: "rc-medina.pdf", status: "VERIFIED", uploadedAt: "2026-07-01T09:20:00Z" },
      { id: "d2", type: "LICENSE", fileName: "licence-tour.pdf", status: "PENDING", uploadedAt: "2026-07-01T09:21:00Z" },
      { id: "d3", type: "ID", fileName: "cin-yassine.jpg", status: "PENDING", uploadedAt: "2026-07-01T09:22:00Z" },
      { id: "d4", type: "BANK", fileName: "rib-medina.pdf", status: "VERIFIED", uploadedAt: "2026-07-01T09:23:00Z" },
    ],
  },
  "ptr-02": {
    id: "ptr-02",
    businessName: "Atlas Guides",
    status: "PENDING",
    city: "Imlil",
    submittedAt: "2026-07-02T14:05:00Z",
    contactName: "Fatima Ouhaddou",
    email: "contact@atlasguides.ma",
    phone: "+212 6 62 88 11 90",
    addressLine: "Route de l'Atlas, Imlil",
    catalogCount: 5,
    pendingDocs: 1,
    documents: [
      { id: "d1", type: "REGISTRATION", fileName: "rc-atlas.pdf", status: "VERIFIED", uploadedAt: "2026-07-02T14:05:00Z" },
      { id: "d2", type: "LICENSE", fileName: "licence-atlas.pdf", status: "VERIFIED", uploadedAt: "2026-07-02T14:06:00Z" },
      { id: "d3", type: "ID", fileName: "passport-fatima.jpg", status: "PENDING", uploadedAt: "2026-07-02T14:07:00Z" },
      { id: "d4", type: "BANK", fileName: "rib-atlas.pdf", status: "VERIFIED", uploadedAt: "2026-07-02T14:08:00Z" },
    ],
  },
  "ptr-03": {
    id: "ptr-03",
    businessName: "Sahara Nomads Co.",
    status: "CHANGES_REQUESTED",
    city: "Merzouga",
    submittedAt: "2026-06-28T10:00:00Z",
    contactName: "Omar Ait Ben",
    email: "omar@saharanomads.ma",
    phone: "+212 6 70 45 12 08",
    addressLine: "Erg Chebbi, Merzouga",
    catalogCount: 3,
    pendingDocs: 0,
    documents: [
      { id: "d1", type: "REGISTRATION", fileName: "rc-sahara.pdf", status: "VERIFIED", uploadedAt: "2026-06-28T10:00:00Z" },
      { id: "d2", type: "LICENSE", fileName: "licence-sahara.pdf", status: "REJECTED", uploadedAt: "2026-06-28T10:01:00Z" },
      { id: "d3", type: "ID", fileName: "cin-omar.jpg", status: "VERIFIED", uploadedAt: "2026-06-28T10:02:00Z" },
      { id: "d4", type: "BANK", fileName: "rib-sahara.pdf", status: "VERIFIED", uploadedAt: "2026-06-28T10:03:00Z" },
    ],
  },
};

function recomputePending(p: PartnerDetail) {
  p.pendingDocs = p.documents.filter((d) => d.status === "PENDING").length;
}

function toSummary(p: PartnerDetail): PartnerSummary {
  return {
    id: p.id,
    businessName: p.businessName,
    status: p.status,
    city: p.city,
    submittedAt: p.submittedAt,
    pendingDocs: p.pendingDocs,
  };
}

function mockListPartners(status?: PartnerStatus): Promise<PartnerSummary[]> {
  const rows = Object.values(store)
    .filter((p) => !status || p.status === status)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    .map(toSummary);
  return mockDelay(rows);
}

function mockGetPartner(id: string): Promise<PartnerDetail> {
  const p = store[id];
  if (!p) return Promise.reject(new Error(`Partner ${id} not found`));
  return mockDelay(structuredClone(p));
}

function mockReview(
  id: string,
  decision: PartnerStatus
): Promise<PartnerDetail> {
  const p = store[id];
  if (!p) return Promise.reject(new Error(`Partner ${id} not found`));
  p.status = decision;
  return mockDelay(structuredClone(p));
}

function mockSetDoc(
  partnerId: string,
  docId: string,
  status: KycDocStatus
): Promise<PartnerDetail> {
  const p = store[partnerId];
  const doc = p?.documents.find((d) => d.id === docId);
  if (!p || !doc) return Promise.reject(new Error("Not found"));
  doc.status = status;
  recomputePending(p);
  return mockDelay(structuredClone(p));
}
