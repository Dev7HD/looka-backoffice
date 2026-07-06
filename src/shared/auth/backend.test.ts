import { describe, expect, it } from "vitest";
import { decodeJwt, userFromToken } from "./backend";
import { userHasPermission } from "./roles";

/** Build an unsigned JWT with the given payload (base64url). */
function makeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "none" })}.${b64(payload)}.sig`;
}

describe("backend auth", () => {
  it("decodes JWT claims", () => {
    const token = makeJwt({ sub: "u-1", preferred_username: "admin" });
    expect(decodeJwt(token).sub).toBe("u-1");
    expect(decodeJwt(token).preferred_username).toBe("admin");
  });

  it("maps a backoffice token to an ADMIN user with permissions", () => {
    const token = makeJwt({
      sub: "u-1",
      name: "Admin",
      email: "a@louka.app",
      groups: ["backoffice"],
      realm_access: { roles: ["poi:edit", "users:manage"] },
    });
    const user = userFromToken(token)!;
    expect(user.roles).toEqual(["ADMIN"]);
    expect(user.groups).toContain("backoffice");
    expect(userHasPermission(user, "poi:edit")).toBe(true);
    expect(userHasPermission(user, "prefs:manage")).toBe(false);
  });

  it("returns null when the token has no subject", () => {
    expect(userFromToken(makeJwt({ name: "x" }))).toBeNull();
  });
});
