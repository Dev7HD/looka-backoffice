import type { HTMLAttributes } from "react";
import { cx } from "../cx";
import "./Chip.css";

export type ChipIntent =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "brass"
  | "info"
  | "critical";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: ChipIntent;
  size?: "sm" | "md";
  /** Show a leading status dot. */
  dot?: boolean;
}

export function Chip({
  intent = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cx("chip", `chip--${intent}`, size === "sm" && "chip--sm", className)}
      {...rest}
    >
      {dot && <span className="chip__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
