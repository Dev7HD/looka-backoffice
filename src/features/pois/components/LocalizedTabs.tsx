import { LOCALES, LOCALE_LABELS, type Locale } from "@shared/i18n/config";

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
    <div className="ltabs" role="tablist" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          role="tab"
          type="button"
          aria-selected={l === active}
          className={"ltabs__tab" + (l === active ? " ltabs__tab--active" : "")}
          onClick={() => onSelect(l)}
        >
          <span
            className={
              "ltabs__dot " + (complete[l] ? "ltabs__dot--ok" : "ltabs__dot--miss")
            }
            aria-hidden="true"
          />
          <span className="ltabs__code">{l.toUpperCase()}</span>
          <span className="ltabs__name">{LOCALE_LABELS[l]}</span>
        </button>
      ))}
    </div>
  );
}
