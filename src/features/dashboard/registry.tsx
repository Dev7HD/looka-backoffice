import type { ReactNode } from "react";
import type { WidgetId } from "./types";
import { KpiWidget } from "./widgets/KpiWidget";
import {
  DriverStatusWidget,
  OutcomesDoughnutWidget,
  RevenueBarWidget,
  RidesLineWidget,
  TopPoisWidget,
} from "./widgets/charts";
import { PendingPartnersWidget } from "./widgets/ListWidget";

/** Grid size + hard min/max constraints (in grid units) per widget. RGL
 *  enforces these on resize so nothing gets unreadably small or oversized. */
export interface WidgetSize {
  w: number;
  h: number;
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
}

export interface WidgetMeta {
  id: WidgetId;
  /** Library glyph. */
  icon: string;
  size: WidgetSize;
  render: () => ReactNode;
}

export const WIDGETS: Record<WidgetId, WidgetMeta> = {
  "kpi-active-rides": {
    id: "kpi-active-rides",
    icon: "🚗",
    size: { w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 4 },
    render: () => <KpiWidget field="activeRides" />,
  },
  "kpi-escrow": {
    id: "kpi-escrow",
    icon: "💰",
    size: { w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 4 },
    render: () => <KpiWidget field="escrowBalance" currency />,
  },
  "kpi-pending-partners": {
    id: "kpi-pending-partners",
    icon: "🧑‍💼",
    size: { w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 4 },
    render: () => <KpiWidget field="pendingPartners" />,
  },
  "kpi-abandoned": {
    id: "kpi-abandoned",
    icon: "⚠️",
    size: { w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 4 },
    render: () => <KpiWidget field="abandoned24h" />,
  },
  "chart-rides": {
    id: "chart-rides",
    icon: "📈",
    size: { w: 6, h: 8, minW: 4, minH: 6, maxW: 12, maxH: 12 },
    render: () => <RidesLineWidget />,
  },
  "chart-rides-30d": {
    id: "chart-rides-30d",
    icon: "🗓️",
    size: { w: 6, h: 8, minW: 4, minH: 6, maxW: 12, maxH: 12 },
    render: () => <RidesLineWidget range="30d" />,
  },
  "chart-revenue": {
    id: "chart-revenue",
    icon: "📊",
    size: { w: 6, h: 8, minW: 4, minH: 6, maxW: 12, maxH: 12 },
    render: () => <RevenueBarWidget />,
  },
  "chart-outcomes": {
    id: "chart-outcomes",
    icon: "🍩",
    size: { w: 4, h: 8, minW: 3, minH: 6, maxW: 6, maxH: 10 },
    render: () => <OutcomesDoughnutWidget />,
  },
  "chart-driver-status": {
    id: "chart-driver-status",
    icon: "🚦",
    size: { w: 4, h: 8, minW: 3, minH: 6, maxW: 6, maxH: 10 },
    render: () => <DriverStatusWidget />,
  },
  "chart-top-pois": {
    id: "chart-top-pois",
    icon: "🏛️",
    size: { w: 5, h: 8, minW: 4, minH: 6, maxW: 8, maxH: 12 },
    render: () => <TopPoisWidget />,
  },
  "list-pending-partners": {
    id: "list-pending-partners",
    icon: "📋",
    size: { w: 4, h: 8, minW: 3, minH: 5, maxW: 6, maxH: 12 },
    render: () => <PendingPartnersWidget />,
  },
};

export const WIDGET_IDS = Object.keys(WIDGETS) as WidgetId[];
