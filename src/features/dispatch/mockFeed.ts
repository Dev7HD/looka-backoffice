import type { RideStatus } from "@shared/ui";
import type { MockSource } from "@shared/realtime/useLiveChannel";
import type { LiveRide, RideEvent } from "./types";

const CENTER = { lng: -7.99, lat: 31.63 };
const SPAN = 0.03;
const PARTNERS = ["Medina Tours", "Atlas Guides", "Sahara Co.", "Coastal Trips"];
const DRIVERS = ["Rachid B.", "Hind K.", "Omar T.", "Leila M.", "Samir A.", "Nora F."];

let seq = 4800;
const rand = (span: number) => (Math.random() - 0.5) * span;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function spawn(status: RideStatus): LiveRide {
  seq += 1;
  return {
    id: `RD-${seq}`,
    status,
    partner: pick(PARTNERS),
    driver: pick(DRIVERS),
    passengers: 1 + Math.floor(Math.random() * 4),
    pos: { lng: CENTER.lng + rand(SPAN), lat: CENTER.lat + rand(SPAN) },
    updatedAt: 0,
  };
}

const NEXT: Partial<Record<RideStatus, RideStatus>> = {
  PENDING: "VALIDATED",
  VALIDATED: "IN_TOUR",
};

/** Live dispatch simulation: snapshot, then position + state churn. */
export function createDispatchFeed(): MockSource<RideEvent> {
  return (emit) => {
    const rides: LiveRide[] = [
      spawn("IN_TOUR"),
      spawn("IN_TOUR"),
      spawn("IN_TOUR"),
      spawn("VALIDATED"),
      spawn("PENDING"),
      spawn("PENDING"),
    ];
    let t = 1;
    rides.forEach((r) => (r.updatedAt = t));
    emit({ type: "snapshot", rides: rides.map((r) => ({ ...r })) });

    const active = new Map(rides.map((r) => [r.id, r]));

    const tick = () => {
      t += 1;
      // Move every in-tour ride a little.
      for (const r of active.values()) {
        if (r.status === "IN_TOUR") {
          r.pos = {
            lng: r.pos.lng + rand(0.0016),
            lat: r.pos.lat + rand(0.0016),
          };
          emit({ type: "position", id: r.id, pos: r.pos, at: t });
        }
      }
      // Occasionally advance one ride's state.
      if (Math.random() < 0.55) {
        const r = pick([...active.values()]);
        const next = NEXT[r.status];
        if (next) {
          r.status = next;
          emit({ type: "state", id: r.id, status: next, at: t });
        } else if (r.status === "IN_TOUR") {
          // End the tour: mostly completed, sometimes cancelled/abandoned.
          const roll = Math.random();
          const end: RideStatus =
            roll < 0.7 ? "COMPLETED" : roll < 0.85 ? "CANCELLED" : "ABANDONED";
          r.status = end;
          emit({ type: "state", id: r.id, status: end, at: t });
          active.delete(r.id);
          // Backfill a fresh pending ride.
          const fresh = spawn("PENDING");
          fresh.updatedAt = t;
          active.set(fresh.id, fresh);
          emit({ type: "snapshot", rides: [...active.values()].map((x) => ({ ...x })) });
        }
      }
    };

    const timer = setInterval(tick, 1500);
    return () => clearInterval(timer);
  };
}
