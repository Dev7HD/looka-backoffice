import { LOCALES, LOCALE_LABELS, type Locale } from "@shared/i18n/config";
import { cx } from "@shared/ui";

/** Per-language tab bar. Each tab flags translation completeness. */
export function LocalizedTabs({
  active,
  onSelect,
  complete,
}: {
  active: Locale;
  onSelect: (l: Locale) => void;
  /** Whether every localized field is filled for that locale. */
  complete: Record<Locale, boolean>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Language"
      className="flex gap-1 rounded-sm border border-line bg-paper p-1"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          role="tab"
          type="button"
          aria-selected={l === active}
          onClick={() => onSelect(l)}
          className={cx(
            "flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-13 font-medium transition-colors duration-(--dur-fast) ease-out",
            l === active
              ? "bg-surface text-ink shadow-1"
              : "text-ink-soft hover:text-ink"
          )}
        >
          <span
            aria-hidden="true"
            className={cx(
              "size-2 shrink-0 rounded-pill",
              complete[l]
                ? "bg-success"
                : "bg-line ring-[1.5px] ring-inset ring-brass"
            )}
          />
          <span className="min-[1120px]:hidden">{l.toUpperCase()}</span>
          <span className="hidden min-[1120px]:inline">{LOCALE_LABELS[l]}</span>
        </button>
      ))}
    </div>
  );
}
