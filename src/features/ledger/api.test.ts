import { describe, expect, it } from "vitest";
import { getEscrowSummary, listLedger } from "./api";

describe("ledger mock api", () => {
  it("keeps a consistent running escrow balance", async () => {
    const [{ entries }, summary] = await Promise.all([
      listLedger({ pageSize: 100 }),
      getEscrowSummary(),
    ]);
    // Newest first: top row balance equals current escrow balance.
    expect(entries[0].balanceAfter).toBe(summary.escrowBalance);
    // Each row's balance minus its delta equals the next (older) row's balance.
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i].balanceAfter - entries[i].points).toBe(
        entries[i + 1].balanceAfter
      );
    }
  });

  it("pairs a LOCK with a CAPTURE or REFUND per ride", async () => {
    const { entries } = await listLedger({ pageSize: 100 });
    const byRide = new Map<string, Set<string>>();
    for (const e of entries) {
      if (!e.rideId) continue;
      if (!byRide.has(e.rideId)) byRide.set(e.rideId, new Set());
      byRide.get(e.rideId)!.add(e.type);
    }
    for (const types of byRide.values()) {
      expect(types.has("LOCK")).toBe(true);
      expect(types.has("CAPTURE") || types.has("REFUND")).toBe(true);
    }
  });

  it("filters by type", async () => {
    const { entries } = await listLedger({ type: "CAPTURE", pageSize: 100 });
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.type === "CAPTURE")).toBe(true);
  });
});
