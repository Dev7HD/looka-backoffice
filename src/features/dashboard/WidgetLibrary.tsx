import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import type { WidgetId } from "./types";
import { WIDGETS, WIDGET_IDS } from "./registry";

/** Slide-in catalogue of every widget. Already-placed widgets show as added;
 *  the rest can be added to the board. Removed widgets reappear here. */
export function WidgetLibrary({
  open,
  onClose,
  active,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  active: WidgetId[];
  onAdd: (id: WidgetId) => void;
}) {
  const { t } = useTranslation("dashboard");
  const activeSet = new Set(active);

  return (
    <>
      <button
        type="button"
        aria-label={t("closeLibrary")}
        onClick={onClose}
        className={
          "fixed inset-0 z-dropdown bg-black/40 transition-opacity " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />
      <aside
        className={
          "fixed inset-y-0 end-0 z-modal flex w-80 max-w-[85vw] flex-col border-s border-line bg-surface shadow-pop transition-transform " +
          (open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full")
        }
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-15 font-bold text-ink">{t("library")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeLibrary")}
            className="grid size-7 place-items-center rounded-sm text-ink-soft hover:bg-paper hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <ul className="flex flex-col gap-2 overflow-auto p-4">
          {WIDGET_IDS.map((id) => {
            const added = activeSet.has(id);
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-md border border-line p-3"
              >
                <span aria-hidden="true" className="text-22">
                  {WIDGETS[id].icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-13 font-medium text-ink">
                  {t(`widgets.${id}`)}
                </span>
                <Button
                  size="sm"
                  variant={added ? "ghost" : "primary"}
                  disabled={added}
                  onClick={() => onAdd(id)}
                >
                  {added ? t("added") : t("add")}
                </Button>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
