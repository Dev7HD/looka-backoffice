/** Operator roles (mirror Keycloak realm roles for this client). */
export const ROLES = [
  "ADMIN",
  "CATALOG_MANAGER",
  "PARTNER_MANAGER",
  "DISPATCHER",
  "FINANCE",
  "MEDIA_MODERATOR",
] as const;
export type AppRole = (typeof ROLES)[number];

/** Backend permissions (Keycloak realm roles) carried in the JWT. */
export type Permission =
  | "poi:view"
  | "poi:edit"
  | "tour:edit"
  | "media:upload"
  | "prefs:manage"
  | "permissions:manage"
  | "users:manage";

/** Backend group memberships. */
export type UserGroup = "backoffice" | "partner" | "driver" | "customer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: AppRole[];
  /** Raw backend permissions from `realm_access.roles` (backend mode). */
  permissions?: string[];
  /** Group memberships from the JWT (backend mode). */
  groups?: string[];
}

export function userHasPermission(user: AuthUser | null, perm: Permission): boolean {
  return !!user?.permissions?.includes(perm);
}

/** ADMIN is a superuser — implicitly satisfies every role check. */
export function userHasRole(user: AuthUser | null, role: AppRole): boolean {
  if (!user) return false;
  return user.roles.includes("ADMIN") || user.roles.includes(role);
}

export function userHasAny(user: AuthUser | null, roles: AppRole[]): boolean {
  if (!user) return false;
  if (user.roles.includes("ADMIN")) return true;
  return roles.some((r) => user.roles.includes(r));
}

/** Roles that grant access to each nav/route key. Empty = any authenticated. */
export const ROUTE_ROLES: Record<string, AppRole[]> = {
  dashboard: [],
  tours: ["CATALOG_MANAGER"],
  partners: ["PARTNER_MANAGER"],
  drivers: ["DISPATCHER"],
  dispatch: ["DISPATCHER"],
  ledger: ["FINANCE"],
  media: ["MEDIA_MODERATOR"],
  settings: [],
  simulator: ["CATALOG_MANAGER", "DISPATCHER"],
  fulfillment: ["DISPATCHER"],
  ads: ["MEDIA_MODERATOR"],
  reports: ["PARTNER_MANAGER"],
};
