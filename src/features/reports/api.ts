import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";

export type ReportStatus = "OPEN" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN";
export type ReportReason = "FRAUD" | "SAFETY" | "BEHAVIOR" | "OTHER";

export interface Report {
  id: string;
  partnerId: string;
  reporterId: string;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: string;
}

const store: Record<string, Report> = {
  r1: { id: "r1", partnerId: "ptr-03", reporterId: "u-1", reason: "BEHAVIOR", comment: "Guide was rude.", status: "OPEN", resolutionNote: null, createdAt: "2026-07-05T10:00:00Z" },
  r2: { id: "r2", partnerId: "ptr-01", reporterId: "u-2", reason: "FRAUD", comment: "Overcharged me.", status: "OPEN", resolutionNote: null, createdAt: "2026-07-06T14:00:00Z" },
};

export function listReports(status?: ReportStatus): Promise<Report[]> {
  if (USE_MOCK_API) return mockDelay(Object.values(store).filter((r) => !status || r.status === status));
  return apiRequest<Report[]>("/admin/partners/reports", { query: { status } });
}
export function resolveReport(id: string, status: ReportStatus, note?: string): Promise<Report> {
  if (USE_MOCK_API) { if (store[id]) { store[id].status = status; store[id].resolutionNote = note ?? null; } return mockDelay({ ...store[id] }); }
  return apiRequest<Report>(`/admin/partners/reports/${id}/resolve`, { method: "POST", body: { status, note } });
}
