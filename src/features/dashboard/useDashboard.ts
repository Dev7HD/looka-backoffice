import { useCallback, useEffect, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import type { Breakpoint, DashboardState, Layouts, WidgetId } from "./types";
import {
  BREAKPOINTS,
  bottomOf,
  buildLayouts,
  defaultState,
  loadState,
  makeItem,
  saveState,
} from "./storage";

/** Owns the dashboard state: initialises from localStorage, persists every
 *  change, and exposes add/remove/reset + the react-grid-layout change hook. */
export function useDashboard() {
  const [state, setState] = useState<DashboardState>(loadState);
  // Skip the very first write so we don't rewrite identical state on mount.
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveState(state);
  }, [state]);

  /** Persist geometry as the user drags/resizes. RGL hands us every breakpoint
   *  it has computed; keep only items for still-active widgets. */
  const onLayoutChange = useCallback((_current: Layout[], all: Layouts) => {
    setState((prev) => {
      const activeSet = new Set(prev.active);
      const next: Layouts = { ...prev.layouts };
      for (const bp of BREAKPOINTS) {
        const items = all[bp];
        if (items) next[bp] = items.filter((it) => activeSet.has(it.i as WidgetId));
      }
      return { ...prev, layouts: next };
    });
  }, []);

  const addWidget = useCallback((id: WidgetId) => {
    setState((prev) => {
      if (prev.active.includes(id)) return prev;
      const layouts: Layouts = { ...prev.layouts };
      for (const bp of BREAKPOINTS) {
        const items = prev.layouts[bp] ?? [];
        // Drop the new widget at the bottom of the column.
        layouts[bp] = [...items, makeItem(id, bp as Breakpoint, 0, bottomOf(items))];
      }
      return { ...prev, active: [...prev.active, id], layouts };
    });
  }, []);

  const removeWidget = useCallback((id: WidgetId) => {
    setState((prev) => {
      const layouts: Layouts = { ...prev.layouts };
      for (const bp of BREAKPOINTS) {
        layouts[bp] = (prev.layouts[bp] ?? []).filter((it) => it.i !== id);
      }
      return { ...prev, active: prev.active.filter((w) => w !== id), layouts };
    });
  }, []);

  const reset = useCallback(() => setState(defaultState()), []);

  /** Replace the whole board with a prebuilt template's widget set. */
  const applyTemplate = useCallback((widgets: WidgetId[]) => {
    setState((prev) => ({
      ...prev,
      active: [...widgets],
      layouts: buildLayouts(widgets),
    }));
  }, []);

  return { state, onLayoutChange, addWidget, removeWidget, reset, applyTemplate };
}
