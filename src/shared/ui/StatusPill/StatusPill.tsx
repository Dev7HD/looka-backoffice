import { Chip, type ChipIntent } from "../Chip/Chip";

/** Ride lifecycle — identical vocabulary to backend + mobile apps. */
export type RideStatus =
  | "PENDING"
  | "VALIDATED"
  | "IN_TOUR"
  | "COMPLETED"
  | "CANCELLED" // muted — full refund
  | "ABANDONED"; // critical — points consumed + partner compensated

const MAP: Record<RideStatus, { intent: ChipIntent; label: string }> = {
  PENDING: { intent: "info", label: "Pending" },
  VALIDATED: { intent: "primary", label: "Validated" },
  IN_TOUR: { intent: "brass", label: "In tour" },
  COMPLETED: { intent: "success", label: "Completed" },
  CANCELLED: { intent: "neutral", label: "Cancelled" },
  ABANDONED: { intent: "critical", label: "Abandoned" },
};

export function StatusPill({
  status,
  label,
  size = "md",
}: {
  status: RideStatus;
  /** Override the default English label (e.g. i18n-translated). */
  label?: string;
  size?: "sm" | "md";
}) {
  const cfg = MAP[status];
  return (
    <Chip intent={cfg.intent} size={size} dot>
      {label ?? cfg.label}
    </Chip>
  );
}
