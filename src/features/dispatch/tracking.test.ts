import { describe, expect, it } from "vitest";
import { applyTrackingFrame, type RideTrackingState } from "./tracking";

const empty: RideTrackingState = { status: null, position: null, updatedAt: null };

describe("applyTrackingFrame", () => {
  it("applies a STATUS frame", () => {
    const s = applyTrackingFrame(empty, {
      type: "STATUS",
      rideId: "RD-1",
      status: "ACCEPTED",
      occurredAt: "2026-07-06T10:00:00Z",
    });
    expect(s.status).toBe("ACCEPTED");
    expect(s.updatedAt).toBe("2026-07-06T10:00:00Z");
    expect(s.position).toBeNull();
  });

  it("applies a LOCATION frame", () => {
    const s = applyTrackingFrame(empty, {
      type: "LOCATION",
      rideId: "RD-1",
      latitude: 31.63,
      longitude: -7.99,
      occurredAt: "2026-07-06T10:00:05Z",
    });
    expect(s.position).toEqual({ lat: 31.63, lng: -7.99 });
  });

  it("ignores incomplete frames", () => {
    expect(applyTrackingFrame(empty, { type: "STATUS", rideId: "RD-1", occurredAt: "t" })).toBe(
      empty
    );
    expect(
      applyTrackingFrame(empty, { type: "LOCATION", rideId: "RD-1", occurredAt: "t" })
    ).toBe(empty);
  });
});
