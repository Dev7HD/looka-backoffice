import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFees, listAssignments, updateFee, type AssignmentKind, type AssignmentStatus } from "./api";

export function useFees() {
  return useQuery({ queryKey: ["fulfillment", "fees"], queryFn: getFees });
}
export function useUpdateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { kind: AssignmentKind; points: number }) => updateFee(v.kind, v.points),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fulfillment", "fees"] }),
  });
}
export function useAssignments(status?: AssignmentStatus) {
  return useQuery({ queryKey: ["fulfillment", "assignments", status ?? "all"], queryFn: () => listAssignments(status) });
}
