import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDevice, listDevices, registerDevice, type Platform } from "./api";

export const deviceKeys = { all: ["devices"] as const };

export function useDevices(enabled = true) {
  return useQuery({
    queryKey: deviceKeys.all,
    queryFn: listDevices,
    enabled,
  });
}

export function useRegisterDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { token: string; platform?: Platform }) =>
      registerDevice(v.token, v.platform),
    onSuccess: () => void qc.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

export function useDeleteDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => deleteDevice(token),
    onSuccess: () => void qc.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}
