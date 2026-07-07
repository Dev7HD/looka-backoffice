import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignStats, listCampaigns, reviewCampaign, type CampaignStatus } from "./api";

export function useCampaigns(status?: CampaignStatus) {
  return useQuery({ queryKey: ["ads", "campaigns", status ?? "all"], queryFn: () => listCampaigns(status) });
}
export function useReviewCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; decision: "ACTIVE" | "REJECTED"; note?: string }) =>
      reviewCampaign(v.id, v.decision, v.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ads", "campaigns"] }),
  });
}
export function useCampaignStats(id: string | null) {
  return useQuery({ queryKey: ["ads", "stats", id], queryFn: () => campaignStats(id as string), enabled: !!id });
}
