import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import type { WidgetId } from "./types";
import { TEMPLATES } from "./templates";

/** Slide-in gallery of prebuilt boards. Applying one replaces the current
 *  layout with the template's widget set. */
export function TemplatesDrawer({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (widgets: WidgetId[]) => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <>
      <button
        type="button"
        aria-label={t("closeTemplates")}
        onClick={onClose}
        className={
          "fixed inset-0 z-dropdown bg-black/40 transition-opacity " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />
      <aside
        className={
          "fixed inset-y-0 end-0 z-modal flex w-96 max-w-[90vw] flex-col border-s border-line bg-surface shadow-pop transition-transform " +
          (open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full")
        }
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-15 font-bold text-ink">{t("templates")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeTemplates")}
            className="grid size-7 place-items-center rounded-sm text-ink-soft hover:bg-paper hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <p className="px-4 pt-3 text-12 text-ink-soft">{t("templatesHint")}</p>

        <ul className="flex flex-col gap-3 overflow-auto p-4">
          {TEMPLATES.map((tpl) => (
            <li key={tpl.id} className="flex flex-col gap-3 rounded-md border border-line p-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="text-22">
                  {tpl.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-14 font-semibold text-ink">
                    {t(`template.${tpl.id}.name`)}
                  </p>
                  <p className="truncate text-12 text-ink-soft">
                    {t(`template.${tpl.id}.desc`)}
                  </p>
                </div>
                <Button size="sm" variant="primary" onClick={() => onApply(tpl.widgets)}>
                  {t("apply")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tpl.widgets.map((w) => (
                  <span
                    key={w}
                    className="rounded-pill bg-paper px-2 py-0.5 text-11 text-ink-soft"
                  >
                    {t(`widgets.${w}`)}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
