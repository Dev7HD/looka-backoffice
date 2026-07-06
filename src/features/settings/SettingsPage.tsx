import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, Chip } from "@shared/ui";
import { LOCALES, LOCALE_LABELS, type Locale } from "@shared/i18n/config";
import { applyTheme, THEMES, type Theme } from "@shared/theme/theme";
import { DEFAULT_NOTIFICATION_PREFS } from "@shared/notifications/categories";
import { useAuth } from "@shared/auth/useAuth";
import { usePreferences, useUpdatePreferences } from "./hooks";
import { NotificationsCard } from "./NotificationsCard";
import "./settings.css";

export function SettingsPage() {
  const { t, i18n } = useTranslation("settings");
  const { user } = useAuth();
  const prefs = usePreferences();
  const update = useUpdatePreferences();

  const [language, setLanguage] = useState<Locale>(
    (i18n.resolvedLanguage ?? "fr") as Locale
  );
  const [theme, setTheme] = useState<Theme>("system");
  const [justSaved, setJustSaved] = useState(false);

  // Seed the form once preferences load.
  useEffect(() => {
    if (prefs.data) {
      setLanguage(prefs.data.language);
      setTheme(prefs.data.theme);
    }
  }, [prefs.data]);

  const changeLanguage = (lng: Locale) => {
    setLanguage(lng);
    setJustSaved(false);
    void i18n.changeLanguage(lng); // live preview
  };
  const changeTheme = (next: Theme) => {
    setTheme(next);
    setJustSaved(false);
    applyTheme(next); // live preview
  };

  const save = () =>
    update.mutate(
      {
        language,
        theme,
        // Preserve the saved notification subscriptions (edited separately).
        notifications: prefs.data?.notifications ?? DEFAULT_NOTIFICATION_PREFS,
      },
      { onSuccess: () => setJustSaved(true) }
    );

  return (
    <div className="settings">
      <Card>
        <CardHeader title={t("account")} />
        <CardBody>
          <div className="settings__account">
            <span className="settings__avatar" aria-hidden="true">
              {(user?.name ?? "?").slice(0, 1)}
            </span>
            <div>
              <p className="settings__name">{user?.name}</p>
              <p className="settings__email mono">{user?.email}</p>
            </div>
          </div>
          <div className="settings__roles">
            <span className="eyebrow">{t("roles")}</span>
            <div className="settings__role-chips">
              {(user?.roles ?? []).map((r) => (
                <Chip key={r} intent="primary" size="sm">
                  {r}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("preferences")} />
        <CardBody>
          <div className="settings__field">
            <label className="settings__label" htmlFor="pref-lang">
              {t("language")}
            </label>
            <p className="settings__hint">{t("languageHint")}</p>
            <select
              id="pref-lang"
              className="settings__select"
              value={language}
              onChange={(e) => changeLanguage(e.target.value as Locale)}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>

          <div className="settings__field">
            <span className="settings__label">{t("theme")}</span>
            <p className="settings__hint">{t("themeHint")}</p>
            <div className="settings__segmented" role="group" aria-label={t("theme")}>
              {THEMES.map((th) => (
                <button
                  key={th}
                  type="button"
                  className={"settings__seg" + (theme === th ? " settings__seg--active" : "")}
                  aria-pressed={theme === th}
                  onClick={() => changeTheme(th)}
                >
                  {t(`themeOption.${th}`)}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
        <div className="settings__footer">
          {justSaved && <Chip intent="success" size="sm" dot>{t("saved")}</Chip>}
          <Button variant="primary" size="sm" disabled={update.isPending} onClick={save}>
            {t("save")}
          </Button>
        </div>
      </Card>

      <NotificationsCard />
    </div>
  );
}
