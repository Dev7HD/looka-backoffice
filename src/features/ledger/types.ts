/** Points ledger — read-only oversight. Mutations are backend-owned. */

export type TxnType =
  | "LOCK" // points escrowed at ride validation
  | "CAPTURE" // escrow released to partner (completed / abandoned)
  | "REFUND" // escrow returned to user (cancelled)
  | "TOPUP" // user wallet credited (CMI)
  | "COMPENSATION"; // partner paid for an abandoned ride

export type EscrowHealth = "HEALTHY" | "WATCH" | "CRITICAL";

export interface LedgerEntry {
  id: string; // TXN-xxxx
  type: TxnType;
  /** Signed points delta on the escrow pool. */
  points: number;
  /** Escrow balance after this entry. */
  balanceAfter: number;
  rideId?: string; // RD-xxxx reference
  partner?: string; // set on CAPTURE / COMPENSATION
  at: string; // ISO
}

export interface EscrowSummary {
  escrowBalance: number;
  refundedToday: number;
  topUpsToday: number;
  lockRetries: number;
  health: EscrowHealth;
}

export interface LedgerPage {
  entries: LedgerEntry[];
  total: number;
}
