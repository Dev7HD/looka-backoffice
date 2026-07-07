import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listReports, resolveReport, type ReportStatus } from "./api";

export function useReports(status?: ReportStatus) {
  return useQuery({ queryKey: ["reports", status ?? "all"], queryFn: () => listReports(status) });
}
export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: ReportStatus; note?: string }) => resolveReport(v.id, v.status, v.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
