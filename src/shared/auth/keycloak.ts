import Keycloak from "keycloak-js";
import { KEYCLOAK_CONFIG } from "./config";
import { ROLES, type AppRole, type AuthUser } from "./roles";

let instance: Keycloak | null = null;

export function getKeycloak(): Keycloak {
  if (!instance) {
    instance = new Keycloak({
      url: KEYCLOAK_CONFIG.url,
      realm: KEYCLOAK_CONFIG.realm,
      clientId: KEYCLOAK_CONFIG.clientId,
    });
  }
  return instance;
}

/** Extract known app roles from a decoded Keycloak token. */
export function rolesFromToken(kc: Keycloak): AppRole[] {
  const realm = kc.realmAccess?.roles ?? [];
  const client =
    kc.resourceAccess?.[KEYCLOAK_CONFIG.clientId]?.roles ?? [];
  const all = new Set([...realm, ...client]);
  return ROLES.filter((r) => all.has(r));
}

export function userFromKeycloak(kc: Keycloak): AuthUser | null {
  const t = kc.tokenParsed as
    | { sub?: string; name?: string; preferred_username?: string; email?: string }
    | undefined;
  if (!t?.sub) return null;
  return {
    id: t.sub,
    name: t.name ?? t.preferred_username ?? "Operator",
    email: t.email ?? "",
    roles: rolesFromToken(kc),
  };
}
