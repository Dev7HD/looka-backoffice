/** Auth mode:
 *  - "backend"  → real backend-mediated login (POST /auth/login, JWT).
 *  - "keycloak" → direct Keycloak SSO (keycloak-js).
 *  - "mock"     → in-app dev login (default, no server).
 */
export const AUTH_MODE: "backend" | "keycloak" | "mock" =
  import.meta.env.VITE_AUTH_MODE === "backend"
    ? "backend"
    : import.meta.env.VITE_AUTH_MODE === "keycloak"
      ? "keycloak"
      : "mock";

/** Keycloak connection — used only when AUTH_MODE === "keycloak". */
export const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "louka",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "backoffice",
};

/** localStorage key for the mock session. */
export const MOCK_SESSION_KEY = "louka.mockAuth";
/** localStorage key for the backend token session. */
export const BACKEND_SESSION_KEY = "louka.session";
