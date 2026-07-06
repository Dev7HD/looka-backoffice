import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import type { AppRole } from "./roles";

/**
 * Render children only if the current user holds one of the given roles.
 * ADMIN always passes. Use for per-action gating (buttons, menu items) —
 * complements route-level RequireRole.
 */
export function Can({
  role,
  roles,
  fallback = null,
  children,
}: {
  role?: AppRole;
  roles?: AppRole[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { hasAny } = useAuth();
  const need = roles ?? (role ? [role] : []);
  const allowed = need.length === 0 || hasAny(need);
  return <>{allowed ? children : fallback}</>;
}

/** Imperative variant for disabling (vs hiding) an action. */
export function useCan(roles: AppRole[]): boolean {
  const { hasAny } = useAuth();
  return roles.length === 0 || hasAny(roles);
}
