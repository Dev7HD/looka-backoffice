import { describe, expect, it } from "vitest";
import { userHasAny, userHasRole, type AuthUser } from "./roles";

const partnerMgr: AuthUser = { id: "1", name: "PM", email: "", roles: ["PARTNER_MANAGER"] };
const admin: AuthUser = { id: "2", name: "Ad", email: "", roles: ["ADMIN"] };

describe("role checks", () => {
  it("matches an exact role", () => {
    expect(userHasRole(partnerMgr, "PARTNER_MANAGER")).toBe(true);
    expect(userHasRole(partnerMgr, "FINANCE")).toBe(false);
  });

  it("treats ADMIN as a superuser", () => {
    expect(userHasRole(admin, "FINANCE")).toBe(true);
    expect(userHasAny(admin, ["MEDIA_MODERATOR"])).toBe(true);
  });

  it("returns false for no user", () => {
    expect(userHasRole(null, "ADMIN")).toBe(false);
    expect(userHasAny(null, ["ADMIN"])).toBe(false);
  });

  it("userHasAny needs at least one match", () => {
    expect(userHasAny(partnerMgr, ["FINANCE", "PARTNER_MANAGER"])).toBe(true);
    expect(userHasAny(partnerMgr, ["FINANCE", "DISPATCHER"])).toBe(false);
  });
});
