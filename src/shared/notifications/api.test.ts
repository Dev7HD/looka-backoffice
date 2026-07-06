import { describe, expect, it } from "vitest";
import { deleteDevice, listDevices, registerDevice } from "./api";

describe("device registration (mock)", () => {
  it("registers, lists and removes a device token", async () => {
    await registerDevice("tok-abc", "WEB");
    let devices = await listDevices();
    expect(devices).toContainEqual({ token: "tok-abc", platform: "WEB" });

    // Idempotent upsert — no duplicate.
    await registerDevice("tok-abc", "WEB");
    devices = await listDevices();
    expect(devices.filter((d) => d.token === "tok-abc")).toHaveLength(1);

    await deleteDevice("tok-abc");
    devices = await listDevices();
    expect(devices.some((d) => d.token === "tok-abc")).toBe(false);
  });
});
