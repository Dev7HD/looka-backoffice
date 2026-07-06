import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth/useAuth";
import { ROUTE_ROLES } from "@shared/auth/roles";
import { NAV } from "./nav";
import "./Sidebar.css";

export function Sidebar() {
  const { t } = useTranslation("nav");
  const { hasAny } = useAuth();
  const items = NAV.filter((item) => {
    const roles = ROUTE_ROLES[item.key] ?? [];
    return roles.length === 0 || hasAny(roles);
  });
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark" aria-hidden="true">
          L
        </span>
        <span className="sidebar__word">Loüka</span>
      </div>
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              "sidebar__link" + (isActive ? " sidebar__link--active" : "")
            }
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
