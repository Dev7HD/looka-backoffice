import { describe, expect, it } from "vitest";
import { ApiError } from "./client";
import { apiErrorKey } from "./errors";

describe("apiErrorKey", () => {
  it("maps a known code to its i18n key", () => {
    expect(apiErrorKey(new ApiError(422, { code: "catalog.poi.not_found" }))).toEqual({
      key: "poiNotFound",
      detail: undefined,
    });
  });

  it("maps 429 to rateLimited regardless of code", () => {
    expect(apiErrorKey(new ApiError(429)).key).toBe("rateLimited");
  });

  it("falls back to generic + detail for an unmapped code", () => {
    const r = apiErrorKey(new ApiError(500, { code: "weird", detail: "boom" }));
    expect(r).toEqual({ key: "generic", detail: "boom" });
  });

  it("returns generic for non-API errors", () => {
    expect(apiErrorKey(new Error("x")).key).toBe("generic");
  });
});
