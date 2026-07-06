/**
 * Typed API client — single layer over the backend REST contracts.
 * No ad-hoc fetch in components: features call typed endpoint functions
 * that use this wrapper. Auth token is attached here.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

/** When true, feature APIs serve in-memory fixtures (no backend yet). */
export const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API !== "false";

let authToken: string | null = null;
/** Set by the auth layer once a JWT is obtained (Keycloak). */
export function setAuthToken(token: string | null) {
  authToken = token;
}
/** Current bearer token — e.g. for the WebSocket handshake query param. */
export function getAuthToken(): string | null {
  return authToken;
}

let onUnauthorized: (() => void) | null = null;
/** Register a handler invoked when the backend returns 401 (expired/invalid
 *  session) so the auth layer can force a re-login. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/** RFC 7807 problem body returned by every backend service. */
export interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string; // localized message — do NOT branch on this
  code?: string; // stable i18n key — branch on this
  errors?: string[]; // present on 400 validation ("field: message")
  instance?: string;
}

/** Error thrown for any non-2xx response, carrying the RFC 7807 fields. */
export class ApiError extends Error {
  readonly status: number;
  /** Stable error code (e.g. `billing.points.insufficient`). */
  readonly code?: string;
  readonly detail?: string;
  readonly title?: string;
  readonly errors?: string[];
  /** Seconds to wait, parsed from `Retry-After` on 429. */
  readonly retryAfter?: number;

  constructor(status: number, problem?: ProblemDetail, retryAfter?: number) {
    super(problem?.code ?? problem?.detail ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = problem?.code;
    this.detail = problem?.detail;
    this.title = problem?.title;
    this.errors = problem?.errors;
    this.retryAfter = retryAfter;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** Active UI locale for `Accept-Language` (set on <html lang> by i18n). */
function acceptLanguage(): string {
  if (typeof document !== "undefined") {
    const lang = document.documentElement.getAttribute("lang");
    if (lang) return lang;
  }
  return "en";
}

async function raise(res: Response): Promise<never> {
  let problem: ProblemDetail | undefined;
  try {
    problem = (await res.json()) as ProblemDetail;
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 401) onUnauthorized?.();
  const retryHeader = res.headers?.get?.("Retry-After");
  const retryAfter = retryHeader ? Number(retryHeader) : undefined;
  throw new ApiError(res.status, problem, Number.isFinite(retryAfter) ? retryAfter : undefined);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : API_BASE_URL + "/";
  // Absolute bases resolve on their own; relative bases (e.g. "/api") are
  // resolved against the current origin so URL() has an absolute reference.
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const absoluteBase = /^https?:\/\//.test(base)
    ? base
    : new URL(base, origin).toString();
  const url = new URL(path.replace(/^\//, ""), absoluteBase);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal, query }: RequestOptions = {}
): Promise<T> {
  const res = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": acceptLanguage(),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) return raise(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Multipart upload (e.g. POST /media). The browser sets the boundary, so we
 *  must NOT set Content-Type ourselves. */
export async function apiUpload<T>(
  path: string,
  form: FormData,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": acceptLanguage(),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: form,
  });
  if (!res.ok) return raise(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Small helper for mock endpoints — resolve after a short delay. */
export function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
