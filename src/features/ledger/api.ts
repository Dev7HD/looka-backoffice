import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";
import type { EscrowSummary, LedgerEntry, LedgerPage, TxnType } from "./types";

interface ListParams {
  type?: TxnType;
  page?: number;
  pageSize?: number;
}

export function listLedger(params: ListParams = {}): Promise<LedgerPage> {
  if (USE_MOCK_API) return mockList(params);
  return apiRequest<LedgerPage>("/ledger/entries", {
    query: {
      type: params.type,
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 20,
    },
  });
}

export function getEscrowSummary(): Promise<EscrowSummary> {
  if (USE_MOCK_API) return mockDelay(SUMMARY);
  return apiRequest<EscrowSummary>("/ledger/escrow");
}

/* --- Mock fixtures -------------------------------------------------------- */

const SUMMARY: EscrowSummary = {
  escrowBalance: 48_650,
  refundedToday: 1_320,
  topUpsToday: 6_400,
  lockRetries: 4,
  health: "HEALTHY",
};

const PARTNERS = ["Medina Tours", "Atlas Guides", "Sahara Co.", "Coastal Trips"];

/** Build a deterministic chronological ledger, then compute running balance. */
function buildEntries(): LedgerEntry[] {
  const raw: Omit<LedgerEntry, "balanceAfter">[] = [];
  let ride = 4700;
  let txn = 90_000;
  let day = 1;
  const stamp = (h: number) =>
    `2026-07-${String(day).padStart(2, "0")}T${String(h).padStart(2, "0")}:15:00Z`;

  const push = (
    type: TxnType,
    points: number,
    extra: Partial<LedgerEntry> = {},
    hour = 9
  ) => {
    txn += 1;
    raw.push({ id: `TXN-${txn}`, type, points, at: stamp(hour), ...extra });
  };

  for (let i = 0; i < 8; i++) {
    ride += 1;
    day = 1 + (i % 4);
    const rideId = `RD-${ride}`;
    const partner = PARTNERS[i % PARTNERS.length];
    const amount = 60 + (i % 5) * 30;

    if (i % 4 === 0) push("TOPUP", amount + 200, {}, 8);
    push("LOCK", amount, { rideId }, 9);

    // Resolve: completed/abandoned → capture (+ compensation if abandoned);
    // cancelled → refund.
    const outcome = i % 3;
    if (outcome === 0) {
      push("CAPTURE", -amount, { rideId, partner }, 11);
    } else if (outcome === 1) {
      push("CAPTURE", -amount, { rideId, partner }, 12);
      push("COMPENSATION", -Math.round(amount * 0.4), { rideId, partner }, 12);
    } else {
      push("REFUND", -amount, { rideId }, 13);
    }
  }

  // Compute running escrow balance backwards from the known current total.
  let balance = SUMMARY.escrowBalance;
  const withBalance: LedgerEntry[] = [];
  for (let i = raw.length - 1; i >= 0; i--) {
    withBalance[i] = { ...raw[i], balanceAfter: balance };
    balance -= raw[i].points;
  }
  // Newest first.
  return withBalance.reverse();
}

const ENTRIES = buildEntries();

function mockList({ type, page = 0, pageSize = 20 }: ListParams): Promise<LedgerPage> {
  const filtered = type ? ENTRIES.filter((e) => e.type === type) : ENTRIES;
  const start = page * pageSize;
  return mockDelay({
    entries: filtered.slice(start, start + pageSize),
    total: filtered.length,
  });
}
