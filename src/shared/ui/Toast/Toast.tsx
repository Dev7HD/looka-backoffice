import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChipIntent } from "../Chip/Chip";
import "./Toast.css";

export interface ToastInput {
  title: string;
  body?: string;
  intent?: ChipIntent;
  /** Auto-dismiss after ms (default 6000; 0 = sticky). */
  duration?: number;
}
interface Toast extends ToastInput {
  id: number;
}

interface ToastApi {
  show: (t: ToastInput) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = ++seq.current;
      setToasts((list) => [...list, { ...input, id }]);
      const duration = input.duration ?? 6000;
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        );
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.intent ?? "neutral"}`} role="status">
            <div className="toast__body">
              <p className="toast__title">{t.title}</p>
              {t.body && <p className="toast__text">{t.body}</p>}
            </div>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
