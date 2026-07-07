import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@shared/i18n/LanguageSwitcher";
import { useAuth } from "@shared/auth/useAuth";
import { NAV } from "./nav";
import "./Topbar.css";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { t } = useTranslation(["nav", "common"]);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const match =
    NAV.find((n) => n.to !== "/" && pathname.startsWith(n.to)) ??
    NAV.find((n) => n.to === "/");
  const title = match ? t(match.key, { ns: "nav" }) : "";

  return (
    <header className="topbar">
      <button
        className="topbar__menu"
        type="button"
        onClick={onMenu}
        aria-label={t("menu", { ns: "common" })}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" width="20" height="20" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </svg>
      </button>
      <h1 className="topbar__title">{title}</h1>

      <div className="topbar__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" width="16" height="16" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        <input
          className="topbar__search-input"
          type="search"
          placeholder={t("search", { ns: "common" })}
          aria-label={t("search", { ns: "common" })}
        />
      </div>

      <div className="topbar__actions">
        <LanguageSwitcher />
        {user && (
          <div className="topbar__admin">
            <span className="topbar__avatar" aria-hidden="true">
              {initials(user.name)}
            </span>
            <span className="topbar__admin-name">{user.name}</span>
          </div>
        )}
        <button
          className="topbar__signout"
          type="button"
          onClick={logout}
          title={t("signOut", { ns: "common" })}
          aria-label={t("signOut", { ns: "common" })}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
