import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

/** Chrome around every dashboard widget: a draggable header (the `.widget-drag`
 *  handle react-grid-layout listens to) with title + remove button, and a
 *  scrollable body that fills the resized cell. */
export function WidgetFrame({
  title,
  editing,
  onRemove,
  children,
}: {
  title: string;
  /** Edit mode: header is a drag handle and the remove button is shown. */
  editing: boolean;
  onRemove: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation("dashboard");
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface shadow-1">
      <header
        className={
          "widget-drag flex touch-none items-center justify-between gap-2 border-b border-line px-3 py-2 " +
          (editing ? "cursor-move" : "")
        }
      >
        <span className="truncate text-13 font-semibold text-ink">{title}</span>
        {editing && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t("removeWidget")}
            className="widget-action grid size-6 shrink-0 cursor-pointer place-items-center rounded-sm text-ink-soft hover:bg-paper hover:text-critical"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}
