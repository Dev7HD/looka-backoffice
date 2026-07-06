import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@shared/ui";
import { useFcmLifecycle } from "@shared/notifications/useNotifications";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import "./AppShell.css";

export function AppShell() {
  const { pathname } = useLocation();
  useFcmLifecycle();
  return (
    <div className="shell">
      <Sidebar />
      <Topbar />
      <main className="shell__content">
        {/* Reset the boundary on navigation so a crashed screen recovers. */}
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
