import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { RouteError } from "./layout/RouteError";
import { RequireAuth, RequireRole } from "@shared/auth/guards";
import { ROUTE_ROLES } from "@shared/auth/roles";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PartnersPage } from "@/features/partners/PartnersPage";
import { PoiEditorPage } from "@/features/pois/PoiEditorPage";
import { DispatchPage } from "@/features/dispatch/DispatchPage";
import { LedgerPage } from "@/features/ledger/LedgerPage";
import { DriversPage } from "@/features/drivers/DriversPage";
import { MediaPage } from "@/features/media/MediaPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { SimulatorPage } from "@/features/simulator/SimulatorPage";
import { FulfillmentPage } from "@/features/fulfillment/FulfillmentPage";
import { AdsPage } from "@/features/ads/AdsPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ShowcasePage } from "@/features/showcase/ShowcasePage";
import type { ReactElement } from "react";

/** Wrap an element in the role gate for a given route key. */
const gate = (key: keyof typeof ROUTE_ROLES, el: ReactElement) => (
  <RequireRole roles={ROUTE_ROLES[key]}>{el}</RequireRole>
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: gate("dashboard", <DashboardPage />) },
          { path: "tours", element: gate("tours", <PoiEditorPage />) },
          { path: "partners", element: gate("partners", <PartnersPage />) },
          { path: "drivers", element: gate("drivers", <DriversPage />) },
          { path: "dispatch", element: gate("dispatch", <DispatchPage />) },
          { path: "ledger", element: gate("ledger", <LedgerPage />) },
          { path: "media", element: gate("media", <MediaPage />) },
          { path: "settings", element: gate("settings", <SettingsPage />) },
          { path: "simulator", element: gate("simulator", <SimulatorPage />) },
          { path: "fulfillment", element: gate("fulfillment", <FulfillmentPage />) },
          { path: "ads", element: gate("ads", <AdsPage />) },
          { path: "reports", element: gate("reports", <ReportsPage />) },
          { path: "design", element: <ShowcasePage /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
