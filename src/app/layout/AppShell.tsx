import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@shared/ui";
import { useFcmLifecycle } from "@shared/notifications/useNotifications";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import "./AppShell.css";

export function AppShell() {
  const { pathname } = useLocation();
  // Off-canvas nav drawer state (mobile only; ignored at desktop widths).
  const [navOpen, setNavOpen] = useState(false);
  useFcmLifecycle();
  // Close the drawer whenever navigation happens (link click, back, etc.).
  useEffect(() => setNavOpen(false), [pathname]);
  return (
    <div className={"shell" + (navOpen ? " shell--nav-open" : "")}>
      <Sidebar open={navOpen} />
      <Topbar onMenu={() => setNavOpen((v) => !v)} />
      <button
        type="button"
        className="shell__scrim"
        aria-label="Close menu"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />
      <main className="shell__content">
        {/* Reset the boundary on navigation so a crashed screen recovers. */}
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
