import type { Layout } from "react-grid-layout";
import { GRID, type Breakpoint, type DashboardState, type Layouts, type WidgetId } from "./types";
import { WIDGETS } from "./registry";

const KEY = "louka.dashboard.v1";
const VERSION = 1;

const BREAKPOINTS: Breakpoint[] = ["lg", "md", "sm", "xs"];

/** Starter board shown until the user customises it. */
const DEFAULT_ACTIVE: WidgetId[] = [
  "kpi-active-rides",
  "kpi-escrow",
  "chart-rides",
  "chart-outcomes",
];

/** A layout item with the widget's constraints, clamped to the breakpoint's
 *  column count so nothing is wider (or has a larger min) than the grid. */
export function makeItem(id: WidgetId, bp: Breakpoint, x = 0, y = 0): Layout {
  const cols = GRID.cols[bp];
  const s = WIDGETS[id].size;
  return {
    i: id,
    x,
    y,
    w: Math.min(s.w, cols),
    h: s.h,
    minW: Math.min(s.minW, cols),
    minH: s.minH,
    maxW: Math.min(s.maxW, cols),
    maxH: s.maxH,
  };
}

/** Bottom edge (grid rows) currently occupied — where a new item drops in. */
export function bottomOf(items: Layout[]): number {
  return items.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}

/** Row-pack a set of widgets into a breakpoint for the initial/default board. */
function packLayout(ids: WidgetId[], bp: Breakpoint): Layout[] {
  const cols = GRID.cols[bp];
  let x = 0;
  let y = 0;
  let rowH = 0;
  const out: Layout[] = [];
  for (const id of ids) {
    const it = makeItem(id, bp);
    if (x + it.w > cols) {
      x = 0;
      y += rowH;
      rowH = 0;
    }
    it.x = x;
    it.y = y;
    x += it.w;
    rowH = Math.max(rowH, it.h);
    out.push(it);
  }
  return out;
}

export function buildLayouts(ids: WidgetId[]): Layouts {
  return {
    lg: packLayout(ids, "lg"),
    md: packLayout(ids, "md"),
    sm: packLayout(ids, "sm"),
    xs: packLayout(ids, "xs"),
  };
}

export function defaultState(): DashboardState {
  return { version: VERSION, active: [...DEFAULT_ACTIVE], layouts: buildLayouts(DEFAULT_ACTIVE) };
}

function isValid(s: unknown): s is DashboardState {
  if (!s || typeof s !== "object") return false;
  const st = s as DashboardState;
  return (
    st.version === VERSION &&
    Array.isArray(st.active) &&
    // Drop any persisted widget id we no longer ship.
    st.active.every((id) => id in WIDGETS) &&
    !!st.layouts &&
    BREAKPOINTS.every((bp) => Array.isArray(st.layouts[bp]))
  );
}

export function loadState(): DashboardState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValid(parsed)) return parsed;
    }
  } catch {
    /* corrupt / stale schema — fall back to defaults */
  }
  return defaultState();
}

export function saveState(state: DashboardState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

export { BREAKPOINTS };
