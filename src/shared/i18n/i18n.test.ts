import { afterAll, describe, expect, it } from "vitest";
import i18n from "./index";

describe("i18n", () => {
  afterAll(async () => {
    await i18n.changeLanguage("en");
  });

  it("applies RTL direction for Arabic", async () => {
    await i18n.changeLanguage("ar");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    expect(document.documentElement.getAttribute("lang")).toBe("ar");
  });

  it("returns to LTR for a Latin locale", async () => {
    await i18n.changeLanguage("fr");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
  });

  it("resolves namespaced keys", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.t("dashboard", { ns: "nav" })).toBe("Dashboard");
    expect(i18n.t("actions.approve", { ns: "partners" })).toBe("Approve partner");
  });
});
