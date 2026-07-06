import { useTranslation } from "react-i18next";
import { LOCALES, LOCALE_LABELS, type Locale } from "./config";
import "./LanguageSwitcher.css";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");
  const current = (i18n.resolvedLanguage ?? "fr") as Locale;

  return (
    <label className="lang">
      <span className="sr-only">{t("language")}</span>
      <select
        className="lang__select"
        value={current}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label={t("language")}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
