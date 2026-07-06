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

  // Apply a backend session: attach token, decode user, schedule refresh.
  const applySession = useCallback(
    (session: BackendSession) => {
      setAuthToken(session.accessToken);
      setUser(userFromToken(session.accessToken));
      setStatus("authenticated");
      clearRefresh();
      const delay = Math.max(1000, session.expiresAt - Date.now());
      refreshTimer.current = setTimeout(() => {
        backendRefresh(session.refreshToken).then(applySession).catch(endSession);
      }, delay);
    },
    [endSession]
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
      backendRefresh(session.refreshToken)
        .then(applySession)
        .catch(() => {
          clearSession();
          setStatus("unauthenticated");
        });
    }
    return clearRefresh;
  }, [applySession]);

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

  // Bridge backend 401s → force re-login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (AUTH_MODE === "backend") clearSession();
      endSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

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
