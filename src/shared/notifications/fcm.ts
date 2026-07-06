import type { Messaging, MessagePayload } from "firebase/messaging";
import { FCM_VAPID_KEY, FIREBASE_CONFIG, HAS_FCM } from "./config";

export type PermissionState = "default" | "granted" | "denied" | "unsupported";

let messagingPromise: Promise<Messaging | null> | null = null;

/** Current browser notification permission (no prompt). */
export function permissionState(): PermissionState {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission as PermissionState;
}

/** Lazily initialise Firebase Messaging (code-split; only pulled when FCM is
 *  configured and actually used). Returns null when unavailable. */
async function getMessaging(): Promise<Messaging | null> {
  if (!HAS_FCM) return null;
  if (!messagingPromise) {
    messagingPromise = (async () => {
      const [{ initializeApp, getApps }, { getMessaging, isSupported }] =
        await Promise.all([import("firebase/app"), import("firebase/messaging")]);
      if (!(await isSupported())) return null;
      const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
      return getMessaging(app);
    })().catch(() => null);
  }
  return messagingPromise;
}

async function swRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!("serviceWorker" in navigator)) return undefined;
  // The service worker is static — pass the Firebase config via query so it can
  // initialise messaging without a build step.
  const params = new URLSearchParams({
    apiKey: FIREBASE_CONFIG.apiKey,
    authDomain: FIREBASE_CONFIG.authDomain,
    projectId: FIREBASE_CONFIG.projectId,
    messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
    appId: FIREBASE_CONFIG.appId,
  });
  try {
    return await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${params.toString()}`
    );
  } catch {
    return undefined;
  }
}

/**
 * Request notification permission and mint an FCM web token. Returns the token,
 * or null if FCM is unconfigured / unsupported / permission denied.
 */
export async function requestFcmToken(): Promise<string | null> {
  if (!HAS_FCM || typeof Notification === "undefined") return null;
  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") return null;

  const messaging = await getMessaging();
  if (!messaging) return null;
  const { getToken } = await import("firebase/messaging");
  try {
    return await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: await swRegistration(),
    });
  } catch {
    return null;
  }
}

/** Subscribe to foreground push messages. Returns an unsubscribe fn. */
export function onForegroundMessage(
  cb: (payload: MessagePayload) => void
): () => void {
  let unsub = () => {};
  void getMessaging().then((messaging) => {
    if (!messaging) return;
    import("firebase/messaging").then(({ onMessage }) => {
      unsub = onMessage(messaging, cb);
    });
  });
  return () => unsub();
}
