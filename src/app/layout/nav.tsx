import type { ReactNode } from "react";

export interface NavItem {
  /** Route path segment. */
  to: string;
  /** i18n key under the `nav` namespace. */
  key: string;
  icon: ReactNode;
}

/* Simple 20px stroke icons — inherit currentColor. */
const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);

export const NAV: NavItem[] = [
  { to: "/", key: "dashboard", icon: I("M3 12l9-9 9 9|M5 10v10h14V10") },
  { to: "/tours", key: "tours", icon: I("M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z|M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z") },
  { to: "/partners", key: "partners", icon: I("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8|M22 21v-2a4 4 0 0 0-3-3.9") },
  { to: "/drivers", key: "drivers", icon: I("M5 17h14l-1.5-6.5A2 2 0 0 0 15.6 9H8.4a2 2 0 0 0-1.9 1.5L5 17z|M7 17v2|M17 17v2") },
  { to: "/dispatch", key: "dispatch", icon: I("M12 2v4|M12 18v4|M2 12h4|M18 12h4|M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z") },
  { to: "/ledger", key: "ledger", icon: I("M4 4h16v16H4z|M8 9h8|M8 13h8|M8 17h5") },
  { to: "/media", key: "media", icon: I("M4 5h16v14H4z|M4 15l4-4 4 4 3-3 5 5|M9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z") },
  { to: "/settings", key: "settings", icon: I("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19 12a7 7 0 0 0-.1-1.4l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.4-1.4L11.8 2h-4l-.3 2.2a7 7 0 0 0-2.4 1.4l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.4 1.4l.3 2.2h4l.3-2.2a7 7 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.6c.06-.46.1-.93.1-1.4z") },
];
