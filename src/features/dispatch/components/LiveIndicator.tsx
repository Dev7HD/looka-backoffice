import { useTranslation } from "react-i18next";
import type { ConnectionStatus } from "@shared/realtime/config";

export function LiveIndicator({ status }: { status: ConnectionStatus }) {
  const { t } = useTranslation("dispatch");
  const state =
    status === "open" ? "live" : status === "closed" ? "offline" : "connecting";
  return (
    <span className={`live live--${state}`}>
      <span className="live__dot" aria-hidden="true" />
      {t(`conn.${state}`)}
    </span>
  );
}
