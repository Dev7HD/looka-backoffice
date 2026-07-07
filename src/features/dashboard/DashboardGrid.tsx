import { useMemo } from "react";
import { Responsive, WidthProvider, type Layout, type Layouts as RGLayouts } from "react-grid-layout";
import { useTranslation } from "react-i18next";
import { GRID, type Layouts, type WidgetId } from "./types";
import { WIDGETS } from "./registry";
import { WidgetFrame } from "./widgets/WidgetFrame";

// WidthProvider measures the container so the grid is fully responsive.
const ResponsiveGrid = WidthProvider(Responsive);

export function DashboardGrid({
  active,
  layouts,
  editing,
  onLayoutChange,
  onRemove,
}: {
  active: WidgetId[];
  layouts: Layouts;
  editing: boolean;
  onLayoutChange: (current: Layout[], all: Layouts) => void;
  onRemove: (id: WidgetId) => void;
}) {
  const { t } = useTranslation("dashboard");

  // react-grid-layout mutates/reads the object; memo keeps identity stable.
  const rglLayouts = useMemo<RGLayouts>(() => layouts as RGLayouts, [layouts]);

  return (
    <ResponsiveGrid
      className="layout"
      layouts={rglLayouts}
      breakpoints={GRID.breakpoints}
      cols={GRID.cols}
      rowHeight={GRID.rowHeight}
      margin={GRID.margin}
      draggableHandle=".widget-drag"
      draggableCancel=".widget-action"
      isDraggable={editing}
      isResizable={editing}
      isBounded
      compactType="vertical"
      onLayoutChange={(current, all) => onLayoutChange(current, all as Layouts)}
    >
      {active.map((id) => (
        <div key={id}>
          <WidgetFrame
            title={t(`widgets.${id}`)}
            editing={editing}
            onRemove={() => onRemove(id)}
          >
            {WIDGETS[id].render()}
          </WidgetFrame>
        </div>
      ))}
    </ResponsiveGrid>
  );
}
