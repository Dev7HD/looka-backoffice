import { describe, expect, it } from "vitest";
import {
  DEFAULT_NOTIFICATION_PREFS,
  isSubscribed,
  normalizeNotificationPrefs,
  toggleSubscription,
} from "./categories";

describe("notification subscriptions", () => {
  it("defaults to all PUSH categories, no EMAIL", () => {
    expect(DEFAULT_NOTIFICATION_PREFS.PUSH).toHaveLength(4);
    expect(DEFAULT_NOTIFICATION_PREFS.EMAIL).toHaveLength(0);
  });

  it("normalizes an untrusted map to ordered, valid categories", () => {
    const p = normalizeNotificationPrefs({ PUSH: ["WALLET", "junk", "RIDES"], EMAIL: undefined });
    expect(p.PUSH).toEqual(["RIDES", "WALLET"]); // ordered, filtered
    expect(p.EMAIL).toEqual([]);
  });

  it("defaults when the map is missing", () => {
    const p = normalizeNotificationPrefs(null);
    expect(p.PUSH).toHaveLength(4);
  });

  it("toggles a cell on and off, keeping order", () => {
    let p = normalizeNotificationPrefs({ PUSH: [], EMAIL: [] });
    p = toggleSubscription(p, "PUSH", "TOURS");
    expect(isSubscribed(p, "PUSH", "TOURS")).toBe(true);
    p = toggleSubscription(p, "PUSH", "RIDES");
    expect(p.PUSH).toEqual(["RIDES", "TOURS"]); // canonical order preserved
    p = toggleSubscription(p, "PUSH", "TOURS");
    expect(isSubscribed(p, "PUSH", "TOURS")).toBe(false);
    expect(p.PUSH).toEqual(["RIDES"]);
  });
});
