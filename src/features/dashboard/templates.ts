import type { WidgetId } from "./types";

/** A named, prebuilt board. `widgets` order also drives the packed layout
 *  (see buildLayouts in storage.ts), so list them in reading order. */
export interface DashboardTemplate {
  id: string;
  icon: string;
  widgets: WidgetId[];
}

export const TEMPLATES: DashboardTemplate[] = [
  {
    id: "overview",
    icon: "🗂️",
    widgets: ["kpi-active-rides", "kpi-escrow", "chart-rides", "chart-outcomes"],
  },
  {
    id: "operations",
    icon: "🛰️",
    widgets: [
      "kpi-active-rides",
      "kpi-abandoned",
      "chart-driver-status",
      "chart-rides",
      "list-pending-partners",
      "chart-outcomes",
    ],
  },
  {
    id: "finance",
    icon: "💵",
    widgets: ["kpi-escrow", "kpi-abandoned", "chart-revenue", "chart-rides-30d"],
  },
  {
    id: "catalog",
    icon: "🏛️",
    widgets: ["kpi-pending-partners", "chart-top-pois", "list-pending-partners"],
  },
];
