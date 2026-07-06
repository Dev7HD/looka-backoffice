import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getPartner,
  listPartners,
  reviewPartner,
  setDocStatus,
} from "./api";
import type { KycDocStatus, PartnerDetail, PartnerStatus } from "./types";

export const partnerKeys = {
  all: ["partners"] as const,
  list: (status?: PartnerStatus) => ["partners", "list", status ?? "all"] as const,
  detail: (id: string) => ["partners", "detail", id] as const,
};

export function usePartners(status?: PartnerStatus) {
  return useQuery({
    queryKey: partnerKeys.list(status),
    queryFn: () => listPartners(status),
  });
}

export function usePartner(id: string | null) {
  return useQuery({
    queryKey: partnerKeys.detail(id ?? ""),
    queryFn: () => getPartner(id as string),
    enabled: !!id,
  });
}

/** Shared cache-write after any mutation returns fresh detail. */
function useApplyDetail() {
  const qc = useQueryClient();
  return (data: PartnerDetail) => {
    qc.setQueryData(partnerKeys.detail(data.id), data);
    void qc.invalidateQueries({ queryKey: ["partners", "list"] });
  };
}

export function useReviewPartner() {
  const apply = useApplyDetail();
  return useMutation({
    mutationFn: (v: {
      id: string;
      decision: "VERIFIED" | "REJECTED" | "CHANGES_REQUESTED";
      note?: string;
    }) => reviewPartner(v.id, v.decision, { note: v.note }),
    onSuccess: apply,
  });
}

export function useSetDocStatus() {
  const apply = useApplyDetail();
  return useMutation({
    mutationFn: (v: { partnerId: string; docId: string; status: KycDocStatus }) =>
      setDocStatus(v.partnerId, v.docId, v.status),
    onSuccess: apply,
  });
}
