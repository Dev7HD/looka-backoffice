import type { Layout } from "react-grid-layout";

/** Stable identifier for every widget the library can offer. */
export type WidgetId =
  | "kpi-active-rides"
  | "kpi-escrow"
  | "kpi-pending-partners"
  | "kpi-abandoned"
  | "chart-rides"
  | "chart-rides-30d"
  | "chart-revenue"
  | "chart-outcomes"
  | "chart-driver-status"
  | "chart-top-pois"
  | "list-pending-partners";

/** Breakpoint keys mirror the react-grid-layout `cols` map below. */
export type Breakpoint = "lg" | "md" | "sm" | "xs";

/** Per-breakpoint layout arrays, exactly what react-grid-layout consumes. */
export type Layouts = Record<Breakpoint, Layout[]>;

/** Everything we persist to localStorage. `active` is the source of truth for
 *  which widgets are on the board; `layouts` holds their geometry per bp. */
export interface DashboardState {
  version: number;
  active: WidgetId[];
  layouts: Layouts;
}

/** Grid sizing contract shared by the grid and the registry. */
export const GRID = {
  cols: { lg: 12, md: 8, sm: 4, xs: 2 } satisfies Record<Breakpoint, number>,
  breakpoints: { lg: 1200, md: 900, sm: 600, xs: 0 } satisfies Record<Breakpoint, number>,
  rowHeight: 32,
  margin: [16, 16] as [number, number],
} as const;
