import { useEffect, useRef, useState } from "react";
import { USE_MOCK_WS, WS_BASE_URL, type ConnectionStatus } from "./config";

/** Drives a mock feed: push messages via `emit`, return a cleanup fn. */
export type MockSource<T> = (emit: (msg: T) => void) => () => void;

interface Options<T> {
  /** Channel path appended to WS_BASE_URL (e.g. "/dispatch"). */
  path: string;
  /** Called for every inbound message. */
  onMessage: (msg: T) => void;
  /** In-app feed used when USE_MOCK_WS (or no gateway URL). */
  mock?: MockSource<T>;
  /** JWT attached as a query token for gateway auth (browsers can't set an
   *  Authorization header on the WS handshake). */
  token?: string | null;
  /** When false, the channel stays disconnected (e.g. no rideId yet). */
  enabled?: boolean;
}

const MAX_BACKOFF = 15_000;

/**
 * Subscribe to a live channel. Uses a real reconnecting WebSocket against the
 * edge-gateway, or an in-app mock feed when USE_MOCK_WS. Returns the current
 * connection status.
 */
export function useLiveChannel<T>({
  path,
  onMessage,
  mock,
  token,
  enabled = true,
}: Options<T>): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  // Keep the latest onMessage without reconnecting.
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const useMock = (USE_MOCK_WS || !WS_BASE_URL) && !!mock;

  useEffect(() => {
    if (!enabled) {
      setStatus("closed");
      return;
    }

    // --- Mock feed --------------------------------------------------------
    if (useMock) {
      setStatus("open");
      const cleanup = mock!((msg) => onMessageRef.current(msg));
      return cleanup;
    }

    // No real gateway configured and no mock → nothing to connect to.
    if (!WS_BASE_URL) {
      setStatus("closed");
      return;
    }

    // --- Real reconnecting WebSocket -------------------------------------
    let ws: WebSocket | null = null;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const url = () => {
      const base = `${WS_BASE_URL}${path}`;
      return token ? `${base}?token=${encodeURIComponent(token)}` : base;
    };

    const connect = () => {
      setStatus(retry === 0 ? "connecting" : "reconnecting");
      ws = new WebSocket(url());

      ws.onopen = () => {
        retry = 0;
        setStatus("open");
      };
      ws.onmessage = (e) => {
        try {
          onMessageRef.current(JSON.parse(e.data) as T);
        } catch {
          /* ignore malformed frame */
        }
      };
      ws.onclose = () => {
        if (closed) return;
        const delay = Math.min(MAX_BACKOFF, 1000 * 2 ** retry);
        retry += 1;
        setStatus("reconnecting");
        timer = setTimeout(connect, delay);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      ws?.close();
      setStatus("closed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, token, useMock, enabled]);

  return status;
}
