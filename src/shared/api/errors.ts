import { useTranslation } from "react-i18next";
import { isApiError } from "./client";

/** Stable backend error `code` → i18n key under the `errors` namespace. */
const CODE_KEYS: Record<string, string> = {
  "error.unauthorized": "unauthorized",
  "error.forbidden": "forbidden",
  "error.validation": "validation",
  "billing.points.insufficient": "insufficientPoints",
  "billing.lock.illegal_transition": "lockIllegalTransition",
  "billing.lock.not_found": "lockNotFound",
  "catalog.poi.not_found": "poiNotFound",
  "logistics.ride.illegal_transition": "rideIllegalTransition",
  "logistics.ride.not_found": "rideNotFound",
  "media.not_found": "mediaNotFound",
  "ai.voice.insufficient_points": "voiceInsufficientPoints",
  "error.internal": "internal",
};

/** Resolve a thrown value to the best i18n key for the `errors` namespace.
 *  Prefers a mapped code; falls back to a generic message. `detail` (already
 *  localized by the backend via Accept-Language) is returned separately. */
export function apiErrorKey(err: unknown): { key: string; detail?: string } {
  if (isApiError(err)) {
    if (err.status === 429) return { key: "rateLimited" };
    const mapped = err.code ? CODE_KEYS[err.code] : undefined;
    if (mapped) return { key: mapped, detail: err.detail };
    if (err.detail) return { key: "generic", detail: err.detail };
  }
  return { key: "generic" };
}

/** Hook → translate any thrown error to a user-facing message. */
export function useApiErrorMessage() {
  const { t } = useTranslation("errors");
  return (err: unknown): string => {
    const { key, detail } = apiErrorKey(err);
    // For unmapped errors prefer the backend's localized detail.
    if (key === "generic" && detail) return detail;
    return t(key);
  };
}
