import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiRequest,
  setAuthToken,
  setUnauthorizedHandler,
} from "./client";

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => headers[k] ?? null },
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

afterEach(() => {
  setAuthToken(null);
  setUnauthorizedHandler(null);
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { ok: true }));
    await expect(apiRequest("/ping")).resolves.toEqual({ ok: true });
  });

  it("attaches the bearer token", async () => {
    const fetchMock = mockFetch(200, {});
    vi.stubGlobal("fetch", fetchMock);
    setAuthToken("tok-123");
    await apiRequest("/secure");
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-123");
  });

  it("throws ApiError and fires the 401 handler on unauthorized", async () => {
    vi.stubGlobal("fetch", mockFetch(401, { code: "error.unauthorized" }));
    const onUnauth = vi.fn();
    setUnauthorizedHandler(onUnauth);
    await expect(apiRequest("/secure")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauth).toHaveBeenCalledOnce();
  });

  it("parses the RFC 7807 code + detail into ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(422, { code: "billing.points.insufficient", detail: "Pas assez de points" })
    );
    await expect(apiRequest("/rides")).rejects.toMatchObject({
      status: 422,
      code: "billing.points.insufficient",
      detail: "Pas assez de points",
    });
  });

  it("captures Retry-After on 429", async () => {
    vi.stubGlobal("fetch", mockFetch(429, {}, { "Retry-After": "12" }));
    await expect(apiRequest("/x")).rejects.toMatchObject({ status: 429, retryAfter: 12 });
  });

  it("sends the active locale as Accept-Language", async () => {
    document.documentElement.setAttribute("lang", "ar");
    const fetchMock = mockFetch(200, {});
    vi.stubGlobal("fetch", fetchMock);
    await apiRequest("/x");
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("ar");
    document.documentElement.removeAttribute("lang");
  });
});
