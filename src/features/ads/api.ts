import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";

export type CampaignStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "PAUSED" | "ENDED" | "REJECTED";

export interface Campaign {
  id: string;
  partnerId: string;
  name: string;
  title: Record<string, string>;
  body: Record<string, string>;
  bidModel: "CPM" | "CPC";
  bidPoints: number;
  budgetPoints: number;
  spentPoints: number;
  status: CampaignStatus;
}

export interface CampaignStats {
  impressions: number;
  clicks: number;
  ctr: number;
  spentPoints: number;
  remainingBudget: number;
}

const store: Record<string, Campaign> = {
  "c-1": { id: "c-1", partnerId: "ptr-01", name: "Medina Tours summer", title: { en: "Discover the medina" }, body: { en: "Guided tours daily" }, bidModel: "CPM", bidPoints: 20, budgetPoints: 5000, spentPoints: 1200, status: "PENDING_REVIEW" },
  "c-2": { id: "c-2", partnerId: "ptr-02", name: "Atlas trek promo", title: { en: "Atlas day trek" }, body: { en: "Book now" }, bidModel: "CPC", bidPoints: 8, budgetPoints: 3000, spentPoints: 0, status: "PENDING_REVIEW" },
};

export function listCampaigns(status?: CampaignStatus): Promise<Campaign[]> {
  if (USE_MOCK_API) return mockDelay(Object.values(store).filter((c) => !status || c.status === status));
  return apiRequest<Campaign[]>("/admin/ads/campaigns", { query: { status } });
}
export function reviewCampaign(id: string, decision: "ACTIVE" | "REJECTED", note?: string): Promise<Campaign> {
  if (USE_MOCK_API) { if (store[id]) store[id].status = decision; return mockDelay({ ...store[id] }); }
  return apiRequest<Campaign>(`/admin/ads/campaigns/${id}/review`, { method: "POST", body: { decision, note } });
}
export function campaignStats(id: string): Promise<CampaignStats> {
  if (USE_MOCK_API) {
    const c = store[id];
    return mockDelay({ impressions: 3400, clicks: 210, ctr: 0.062, spentPoints: c?.spentPoints ?? 0, remainingBudget: (c?.budgetPoints ?? 0) - (c?.spentPoints ?? 0) });
  }
  return apiRequest<CampaignStats>(`/admin/ads/campaigns/${id}/stats`);
}
