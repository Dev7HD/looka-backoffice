import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { listDrivers, setDriverStatus } from "./api";
import type { DriverStatus } from "./types";

export const driverKeys = {
  all: ["drivers"] as const,
  list: (status: DriverStatus | undefined, page: number) =>
    ["drivers", "list", status ?? "all", page] as const,
};

export function useDrivers(status: DriverStatus | undefined, page: number, pageSize = 10) {
  return useQuery({
    queryKey: driverKeys.list(status, page),
    queryFn: () => listDrivers({ status, page, pageSize }),
    placeholderData: keepPreviousData,
  });
}

export function useSetDriverStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: DriverStatus }) =>
      setDriverStatus(v.id, v.status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: driverKeys.all }),
  });
}
