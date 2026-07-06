import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getEscrowSummary, listLedger } from "./api";
import type { TxnType } from "./types";

export const ledgerKeys = {
  summary: ["ledger", "escrow"] as const,
  list: (type: TxnType | undefined, page: number) =>
    ["ledger", "list", type ?? "all", page] as const,
};

export function useEscrowSummary() {
  return useQuery({
    queryKey: ledgerKeys.summary,
    queryFn: getEscrowSummary,
  });
}

export function useLedger(type: TxnType | undefined, page: number, pageSize = 20) {
  return useQuery({
    queryKey: ledgerKeys.list(type, page),
    queryFn: () => listLedger({ type, page, pageSize }),
    placeholderData: keepPreviousData,
  });
}
