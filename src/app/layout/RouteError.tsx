import { useRouteError } from "react-router-dom";
import { ErrorState } from "@shared/ui";

/** Router-level errorElement — catches loader/render errors per route tree. */
export function RouteError() {
  const error = useRouteError();
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "statusText" in error
        ? String((error as { statusText: unknown }).statusText)
        : undefined;
  return (
    <div className="auth-splash">
      <ErrorState detail={detail} onRetry={() => window.location.reload()} />
    </div>
  );
}
