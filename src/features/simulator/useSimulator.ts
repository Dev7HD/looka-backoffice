import { useReducer } from "react";
import type {
  LegMode,
  NearbyDriver,
  SuggestedStop,
  TourPreference,
} from "./types";

export type Phase = "pick-origin" | "configure" | "route";

export interface SimState {
  phase: Phase;
  origin: { latitude: number; longitude: number } | null;
  preference: TourPreference;
  stops: number;
  route: SuggestedStop[];
  removedIds: string[];
  totalDistanceMeters: number;
  /** Per stop-index (0-based on route): the leg arriving at that stop. */
  legMode: Record<number, LegMode>;
  legDrivers: Record<number, NearbyDriver[]>;
}

export type SimAction =
  | { type: "pickOrigin"; latitude: number; longitude: number }
  | { type: "setPreference"; preference: TourPreference }
  | { type: "setStops"; stops: number }
  | { type: "goConfigure" }
  | { type: "setRoute"; stops: SuggestedStop[]; total: number }
  | { type: "appendStop"; stop: SuggestedStop }
  | { type: "removeStop"; poiId: string }
  | { type: "setLegDrivers"; index: number; drivers: NearbyDriver[] }
  | { type: "reset" };

const initial: SimState = {
  phase: "pick-origin",
  origin: null,
  preference: "TOURIST",
  stops: 5,
  route: [],
  removedIds: [],
  totalDistanceMeters: 0,
  legMode: {},
  legDrivers: {},
};

const EARTH = 6371008.8;
function haversine(a: SuggestedStop | { latitude: number; longitude: number },
                   b: SuggestedStop): number {
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.sqrt(h));
}

/** Recompute leg distances + cumulative from origin through the current route. */
function recomputeLegs(origin: SimState["origin"], route: SuggestedStop[]): {
  route: SuggestedStop[];
  total: number;
} {
  let prev: { latitude: number; longitude: number } = origin ?? route[0];
  let cumulative = 0;
  const rebuilt = route.map((s, i) => {
    const leg = prev ? haversine(prev, s) : 0;
    cumulative += leg;
    prev = s;
    return {
      ...s,
      order: i + 1,
      legDistanceMeters: Math.round(leg),
      cumulativeDistanceMeters: Math.round(cumulative),
    };
  });
  return { route: rebuilt, total: Math.round(cumulative) };
}

function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "pickOrigin":
      return {
        ...state,
        origin: { latitude: action.latitude, longitude: action.longitude },
        phase: state.phase === "pick-origin" ? "configure" : state.phase,
      };
    case "setPreference":
      return { ...state, preference: action.preference };
    case "setStops":
      return { ...state, stops: Math.min(15, Math.max(1, action.stops)) };
    case "goConfigure":
      return { ...state, phase: "configure" };
    case "setRoute": {
      const { route, total } = recomputeLegs(state.origin, action.stops);
      return { ...state, route, totalDistanceMeters: total, phase: "route", legMode: {}, legDrivers: {} };
    }
    case "appendStop": {
      const { route, total } = recomputeLegs(state.origin, [...state.route, action.stop]);
      return { ...state, route, totalDistanceMeters: total };
    }
    case "removeStop": {
      const filtered = state.route.filter((s) => s.poiId !== action.poiId);
      const { route, total } = recomputeLegs(state.origin, filtered);
      return {
        ...state,
        route,
        totalDistanceMeters: total,
        removedIds: [...state.removedIds, action.poiId],
        legMode: {},
        legDrivers: {},
      };
    }
    case "setLegDrivers": {
      const mode: LegMode = action.drivers.length > 0 ? "DRIVE" : "WALK";
      return {
        ...state,
        legDrivers: { ...state.legDrivers, [action.index]: action.drivers },
        legMode: { ...state.legMode, [action.index]: mode },
      };
    }
    case "reset":
      return initial;
    default:
      return state;
  }
}

export function useSimulator() {
  return useReducer(reducer, initial);
}
