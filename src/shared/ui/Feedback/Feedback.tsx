import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useApiErrorMessage } from "@shared/api/errors";
import { Button } from "../Button/Button";
import "./Feedback.css";

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label="loading"
      style={{ ["--sz" as string]: `${size}px` }}
    />
  );
}

export function ErrorState({
  message,
  detail,
  onRetry,
}: {
  /** Resolved, user-facing message (overrides the generic copy). */
  message?: string;
  /** Raw technical detail shown small (e.g. a render-error stack message). */
  detail?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="error-state" role="alert">
      <svg className="error-state__icon" viewBox="0 0 24 24" width="32" height="32"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
      <p className="error-state__title">{t("errorTitle")}</p>
      <p className="error-state__msg">{message ?? t("errorMsg")}</p>
      {detail && <p className="error-state__detail mono">{detail}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}

interface AsyncBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  children: ReactNode;
}

/** Query-state wrapper: spinner while loading, error card (with retry) on
 *  failure, otherwise the children. */
export function AsyncBoundary({
  isLoading,
  isError,
  error,
  onRetry,
  children,
}: AsyncBoundaryProps) {
  const toMessage = useApiErrorMessage();
  if (isLoading) {
    return (
      <div className="async-center">
        <Spinner size={28} />
      </div>
    );
  }
  if (isError) {
    return <ErrorState message={toMessage(error)} onRetry={onRetry} />;
  }
  return <>{children}</>;
}
