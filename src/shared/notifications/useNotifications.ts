import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/ui";
import { useAuth } from "@shared/auth/useAuth";
import { HAS_FCM } from "./config";
import { onForegroundMessage, permissionState, requestFcmToken } from "./fcm";
import { registerDevice } from "./api";
import { useRegisterDevice } from "./hooks";

/** User-initiated enable flow: prompt permission, mint a token, register it. */
export function useEnableNotifications() {
  const register = useRegisterDevice();
  const [busy, setBusy] = useState(false);

  const enable = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    try {
      const token = await requestFcmToken();
      if (!token) return false;
      await register.mutateAsync({ token, platform: "WEB" });
      return true;
    } finally {
      setBusy(false);
    }
  }, [register]);

  return { enable, busy, supported: HAS_FCM };
}

/**
 * App-level FCM wiring — mount once inside the authenticated shell:
 *  - surfaces foreground pushes as toasts,
 *  - silently (re)registers the web token when permission is already granted.
 */
export function useFcmLifecycle() {
  const { status } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation("notifications");
  const registered = useRef(false);

  // Foreground messages → toast.
  useEffect(() => {
    if (!HAS_FCM) return;
    return onForegroundMessage((payload) => {
      show({
        title: payload.notification?.title ?? t("newAlert"),
        body: payload.notification?.body,
        intent: "info",
      });
    });
  }, [show, t]);

  // Silent re-registration on login when already permitted.
  useEffect(() => {
    if (!HAS_FCM || status !== "authenticated" || registered.current) return;
    if (permissionState() !== "granted") return;
    registered.current = true;
    void requestFcmToken().then((token) => {
      if (token) void registerDevice(token, "WEB");
    });
  }, [status]);
}
