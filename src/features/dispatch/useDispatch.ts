import { useCallback, useMemo, useReducer } from "react";
import type { RideStatus } from "@shared/ui";
import { useLiveChannel } from "@shared/realtime/useLiveChannel";
import { useAuth } from "@shared/auth/useAuth";
import { createDispatchFeed } from "./mockFeed";
import { isTerminal, type LiveRide, type RideEvent } from "./types";

interface State {
  active: Record<string, LiveRide>;
  ended: LiveRide[]; // most-recent first, capped
}

const ORDER: RideStatus[] = ["IN_TOUR", "VALIDATED", "PENDING"];

function reducer(state: State, e: RideEvent): State {
  switch (e.type) {
    case "snapshot":
      return {
        ...state,
        active: Object.fromEntries(e.rides.map((r) => [r.id, r])),
      };
    case "position": {
      const r = state.active[e.id];
      if (!r) return state;
      return {
        ...state,
        active: { ...state.active, [e.id]: { ...r, pos: e.pos, updatedAt: e.at } },
      };
    }
    case "state": {
      const r = state.active[e.id];
      if (!r) return state;
      if (isTerminal(e.status)) {
        const { [e.id]: gone, ...rest } = state.active;
        return {
          active: rest,
          ended: [{ ...gone, status: e.status, updatedAt: e.at }, ...state.ended].slice(0, 6),
        };
      }
      return {
        ...state,
        active: { ...state.active, [e.id]: { ...r, status: e.status, updatedAt: e.at } },
      };
    }
    default:
      return state;
  }
}

export function useDispatch() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, { active: {}, ended: [] });
  const onMessage = useCallback((e: RideEvent) => dispatch(e), []);
  const mock = useMemo(() => createDispatchFeed(), []);

  const status = useLiveChannel<RideEvent>({
    path: "/dispatch",
    onMessage,
    mock,
    token: user ? `mock.${user.id}` : null,
  });

  const rides = useMemo(
    () =>
      Object.values(state.active).sort(
        (a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
      ),
    [state.active]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rides) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rides]);

  return { rides, ended: state.ended, counts, status };
}
