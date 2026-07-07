import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";

export type AssignmentKind = "DRIVER_LEG" | "FOOD_STOP" | "COFFEE_STOP";
export type AssignmentStatus = "CONFIRMED" | "UNFILLED" | "CANCELLED" | "COMPLETED";
export type Fees = Record<AssignmentKind, number>;

export interface Assignment {
  id: string;
  tourId: string;
  kind: AssignmentKind;
  partnerId: string | null;
  scheduledAt: string | null;
  feePoints: number;
  status: AssignmentStatus;
}

const mockFees: Fees = { DRIVER_LEG: 50, FOOD_STOP: 20, COFFEE_STOP: 10 };
const mockAssignments: Assignment[] = [
  { id: "a1", tourId: "t-100", kind: "DRIVER_LEG", partnerId: "DRV-2101", scheduledAt: "2026-08-01T09:00:00Z", feePoints: 50, status: "CONFIRMED" },
  { id: "a2", tourId: "t-100", kind: "COFFEE_STOP", partnerId: "ptr-01", scheduledAt: "2026-08-01T09:00:00Z", feePoints: 10, status: "CONFIRMED" },
  { id: "a3", tourId: "t-100", kind: "FOOD_STOP", partnerId: null, scheduledAt: "2026-08-01T09:00:00Z", feePoints: 20, status: "UNFILLED" },
];

export function getFees(): Promise<Fees> {
  if (USE_MOCK_API) return mockDelay({ ...mockFees });
  return apiRequest<Fees>("/admin/fulfillment/fees");
}
export function updateFee(kind: AssignmentKind, points: number): Promise<void> {
  if (USE_MOCK_API) { mockFees[kind] = points; return mockDelay(undefined); }
  return apiRequest<void>(`/admin/fulfillment/fees/${kind}`, { method: "PUT", body: { points } });
}
export function listAssignments(status?: AssignmentStatus): Promise<Assignment[]> {
  if (USE_MOCK_API) return mockDelay(mockAssignments.filter((a) => !status || a.status === status));
  return apiRequest<Assignment[]>("/admin/fulfillment/assignments", { query: { status } });
}
