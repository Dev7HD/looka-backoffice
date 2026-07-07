import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setAuthToken, setUnauthorizedHandler } from "@shared/api/client";
import { AUTH_MODE, MOCK_SESSION_KEY } from "./config";
import { getKeycloak, userFromKeycloak } from "./keycloak";
import {
  backendLogin,
  backendLogout,
  backendRefresh,
  clearSession,
  loadSession,
  userFromToken,
  type BackendSession,
} from "./backend";
import {
  userHasAny,
  userHasPermission,
  userHasRole,
  type AppRole,
  type AuthUser,
  type Permission,
} from "./roles";

type Status = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  mode: "backend" | "keycloak" | "mock";
  status: Status;
  user: AuthUser | null;
  hasRole: (role: AppRole) => boolean;
  hasAny: (roles: AppRole[]) => boolean;
  hasPermission: (perm: Permission) => boolean;
  /** Trigger the login flow (Keycloak redirect). */
  login: () => void;
  /** Backend mode: sign in with credentials. Throws on failure. */
  loginBackend: (username: string, password: string) => Promise<void>;
  /** Mock-mode: sign in as a chosen user. */
  loginMock: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const didInit = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Guards against two refreshes racing (scheduled timer vs. focus revalidation),
  // which token rotation would turn into a spurious 401.
  const refreshing = useRef(false);

  const clearRefresh = () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = undefined;
  };

  const endSession = useCallback(() => {
    clearRefresh();
    setAuthToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // End the session AND drop the stored tokens — used whenever a refresh fails
  // (refresh token expired/revoked) so a dead session can't linger or loop.
  const failSession = useCallback(() => {
    if (AUTH_MODE === "backend") clearSession();
    endSession();
  }, [endSession]);

  // Apply a backend session: attach token, decode user, schedule refresh.
  const applySession = useCallback(
    (session: BackendSession) => {
      setAuthToken(session.accessToken);
      setUser(userFromToken(session.accessToken));
      setStatus("authenticated");
      clearRefresh();
      const delay = Math.max(1000, session.expiresAt - Date.now());
      refreshTimer.current = setTimeout(() => {
        if (refreshing.current) return;
        refreshing.current = true;
        backendRefresh(session.refreshToken)
          .then(applySession)
          .catch(failSession)
          .finally(() => {
            refreshing.current = false;
          });
      }, delay);
    },
    [failSession]
  );

  // --- Backend mode -------------------------------------------------------
  useEffect(() => {
    if (AUTH_MODE !== "backend" || didInit.current) return;
    didInit.current = true;
    const session = loadSession();
    if (!session) {
      setStatus("unauthenticated");
      return;
    }
    if (session.expiresAt > Date.now()) {
      applySession(session);
    } else {
      refreshing.current = true;
      backendRefresh(session.refreshToken)
        .then(applySession)
        .catch(failSession)
        .finally(() => {
          refreshing.current = false;
        });
    }
    return clearRefresh;
  }, [applySession, failSession]);

  // --- Keycloak mode ------------------------------------------------------
  useEffect(() => {
    if (AUTH_MODE !== "keycloak" || didInit.current) return;
    didInit.current = true;
    const kc = getKeycloak();

    kc.init({ onLoad: "check-sso", pkceMethod: "S256" })
      .then((authed) => {
        if (authed) {
          setAuthToken(kc.token ?? null);
          setUser(userFromKeycloak(kc));
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));

    kc.onTokenExpired = () => {
      void kc.updateToken(30).then((refreshed) => {
        if (refreshed) setAuthToken(kc.token ?? null);
      });
    };
    kc.onAuthLogout = endSession;
  }, [endSession]);

  // --- Mock mode ----------------------------------------------------------
  useEffect(() => {
    if (AUTH_MODE !== "mock" || didInit.current) return;
    didInit.current = true;
    try {
      const raw = localStorage.getItem(MOCK_SESSION_KEY);
      if (raw) {
        const u = JSON.parse(raw) as AuthUser;
        setAuthToken(`mock.${u.id}`);
        setUser(u);
        setStatus("authenticated");
        return;
      }
    } catch {
      /* corrupt session — fall through */
    }
    setStatus("unauthenticated");
  }, []);

  const login = useCallback(() => {
    if (AUTH_MODE === "keycloak") void getKeycloak().login();
  }, []);

  const loginBackend = useCallback(
    async (username: string, password: string) => {
      const session = await backendLogin(username, password);
      applySession(session);
    },
    [applySession]
  );

  const loginMock = useCallback((u: AuthUser) => {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(u));
    setAuthToken(`mock.${u.id}`);
    setUser(u);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearRefresh();
    if (AUTH_MODE === "keycloak") {
      setAuthToken(null);
      void getKeycloak().logout();
      return;
    }
    if (AUTH_MODE === "backend") {
      const session = loadSession();
      if (session) void backendLogout(session.refreshToken);
      endSession();
      return;
    }
    setAuthToken(null);
    localStorage.removeItem(MOCK_SESSION_KEY);
    setUser(null);
    setStatus("unauthenticated");
  }, [endSession]);

  // Bridge backend 401s (expired/invalid session) → drop tokens + force re-login.
  useEffect(() => {
    setUnauthorizedHandler(failSession);
    return () => setUnauthorizedHandler(null);
  }, [failSession]);

  // Backgrounded tabs throttle/skip the scheduled refresh, so a returning user
  // can be sitting on a dead session. On focus, if the access token has expired,
  // refresh proactively — or, if the refresh token is gone too, end the session
  // (→ RequireAuth redirects to /login) instead of waiting for the next 401.
  useEffect(() => {
    if (AUTH_MODE !== "backend") return;
    const revalidate = () => {
      if (document.visibilityState !== "visible" || refreshing.current) return;
      const session = loadSession();
      if (!session || session.expiresAt > Date.now()) return;
      refreshing.current = true;
      backendRefresh(session.refreshToken)
        .then(applySession)
        .catch(failSession)
        .finally(() => {
          refreshing.current = false;
        });
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("focus", revalidate);
    return () => {
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("focus", revalidate);
    };
  }, [applySession, failSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      mode: AUTH_MODE,
      status,
      user,
      hasRole: (role) => userHasRole(user, role),
      hasAny: (roles) => userHasAny(user, roles),
      hasPermission: (perm) => userHasPermission(user, perm),
      login,
      loginBackend,
      loginMock,
      logout,
    }),
    [status, user, login, loginBackend, loginMock, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
