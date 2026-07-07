import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { useDashboard } from "./useDashboard";
import { DashboardGrid } from "./DashboardGrid";
import { WidgetLibrary } from "./WidgetLibrary";
import { TemplatesDrawer } from "./TemplatesDrawer";
import type { WidgetId } from "./types";
import "./dashboard.css";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { state, onLayoutChange, addWidget, removeWidget, reset, applyTemplate } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);

  const stopEditing = () => {
    setEditing(false);
    setLibOpen(false);
    setTplOpen(false);
  };

  const useTemplate = (widgets: WidgetId[]) => {
    applyTemplate(widgets);
    setTplOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-13 text-ink-soft">
          {editing ? t("editHint") : t("subtitle")}
        </p>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={reset}>
                {t("reset")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setTplOpen(true)}>
                {t("templates")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setLibOpen(true)}>
                {t("addWidget")}
              </Button>
              <Button variant="primary" size="sm" onClick={stopEditing}>
                {t("done")}
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              {t("customize")}
            </Button>
          )}
        </div>
      </div>

      {state.active.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-10 text-center">
          <p className="text-15 font-semibold text-ink">{t("emptyBoard")}</p>
          <p className="text-13 text-ink-soft">{t("emptyBoardHint")}</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditing(true);
                setTplOpen(true);
              }}
            >
              {t("templates")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditing(true);
                setLibOpen(true);
              }}
            >
              {t("addWidget")}
            </Button>
          </div>
        </div>
      ) : (
        <DashboardGrid
          active={state.active}
          layouts={state.layouts}
          editing={editing}
          onLayoutChange={onLayoutChange}
          onRemove={removeWidget}
        />
      )}

      <WidgetLibrary
        open={editing && libOpen}
        onClose={() => setLibOpen(false)}
        active={state.active}
        onAdd={addWidget}
      />

      <TemplatesDrawer
        open={editing && tplOpen}
        onClose={() => setTplOpen(false)}
        onApply={useTemplate}
      />
    </div>
  );
}
