/** Realtime (WebSocket) config. Live ride feed flows through the edge-gateway. */
export const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? "";

/** When true (default), live channels run off an in-app simulated feed
 *  instead of a real socket — so the app runs without the gateway. */
export const USE_MOCK_WS = import.meta.env.VITE_USE_MOCK_WS !== "false";

export type ConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed";
