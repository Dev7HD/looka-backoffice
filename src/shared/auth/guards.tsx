import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./useAuth";
import type { AppRole } from "./roles";

function Splash({ label }: { label: string }) {
  return <div className="auth-splash">{label}</div>;
}

/** Gate a subtree behind authentication. */
export function RequireAuth() {
  const { status, mode, login } = useAuth();
  const { t } = useTranslation("auth");

  useEffect(() => {
    if (status === "unauthenticated" && mode === "keycloak") login();
  }, [status, mode, login]);

  if (status === "loading") return <Splash label={t("loading")} />;
  if (status === "unauthenticated") {
    // Keycloak self-redirects (effect above); mock + backend render the
    // in-app /login page (persona picker / credential form).
    return mode === "keycloak" ? (
      <Splash label={t("redirecting")} />
    ) : (
      <Navigate to="/login" replace />
    );
  }
  return <Outlet />;
}

/** Gate a subtree behind one of the given roles (ADMIN always passes). */
export function RequireRole({
  roles,
  children,
}: {
  roles: AppRole[];
  children?: ReactNode;
}) {
  const { hasAny } = useAuth();
  if (roles.length > 0 && !hasAny(roles)) return <Forbidden />;
  return <>{children ?? <Outlet />}</>;
}

export function Forbidden() {
  const { t } = useTranslation("auth");
  return (
    <div className="forbidden">
      <p className="eyebrow">403</p>
      <h2 className="display">{t("forbiddenTitle")}</h2>
      <p className="forbidden__msg">{t("forbiddenMsg")}</p>
    </div>
  );
}
