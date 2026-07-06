import { apiRequest } from "@shared/api/client";
import { BACKEND_SESSION_KEY } from "./config";
import type { AppRole, AuthUser } from "./roles";

/** TokenResponse — identity-auth login/refresh. */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string;
}

export interface BackendSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when the access token expires. */
  expiresAt: number;
}

interface JwtClaims {
  sub?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  groups?: string[];
  realm_access?: { roles?: string[] };
}

/** Decode a JWT payload (no signature check — the backend verifies). */
export function decodeJwt(token: string): JwtClaims {
  const part = token.split(".")[1];
  if (!part) return {};
  const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
  // Handle UTF-8 payloads (names in Arabic, etc.).
  const decoded = decodeURIComponent(
    Array.from(json)
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(decoded) as JwtClaims;
}

/** Back-office is the `backoffice` group → full access (maps to ADMIN). */
export function userFromToken(accessToken: string): AuthUser | null {
  const c = decodeJwt(accessToken);
  if (!c.sub) return null;
  const groups = c.groups ?? [];
  const permissions = c.realm_access?.roles ?? [];
  const roles: AppRole[] = groups.includes("backoffice") ? ["ADMIN"] : [];
  return {
    id: c.sub,
    name: c.name ?? c.preferred_username ?? "Operator",
    email: c.email ?? "",
    roles,
    permissions,
    groups,
  };
}

function toSession(t: TokenResponse): BackendSession {
  return {
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    // Refresh a touch early to avoid edge-of-expiry 401s.
    expiresAt: nowMs() + Math.max(0, t.expiresIn - 30) * 1000,
  };
}

// `Date.now` indirection keeps this unit-testable.
function nowMs(): number {
  return Date.now();
}

export function loadSession(): BackendSession | null {
  try {
    const raw = localStorage.getItem(BACKEND_SESSION_KEY);
    return raw ? (JSON.parse(raw) as BackendSession) : null;
  } catch {
    return null;
  }
}
export function saveSession(s: BackendSession): void {
  localStorage.setItem(BACKEND_SESSION_KEY, JSON.stringify(s));
}
export function clearSession(): void {
  localStorage.removeItem(BACKEND_SESSION_KEY);
}

/** Admins hold session-bound (not offline) tokens → offline:false. */
export async function backendLogin(
  username: string,
  password: string
): Promise<BackendSession> {
  const t = await apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: { username, password, offline: false },
  });
  const s = toSession(t);
  saveSession(s);
  return s;
}

export async function backendRefresh(refreshToken: string): Promise<BackendSession> {
  const t = await apiRequest<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
  const s = toSession(t);
  saveSession(s);
  return s;
}

export async function backendLogout(refreshToken: string): Promise<void> {
  try {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
    });
  } finally {
    clearSession();
  }
}
