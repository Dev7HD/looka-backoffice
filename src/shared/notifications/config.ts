/** Firebase Cloud Messaging (web) config. When absent, FCM is disabled and the
 *  device-registration UI degrades gracefully (dev backend runs
 *  `guide.fcm.enabled=false`). */
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FCM_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FCM_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FCM_PROJECT_ID ?? "",
  messagingSenderId: import.meta.env.VITE_FCM_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FCM_APP_ID ?? "",
};

/** VAPID public key for web push (`getToken({ vapidKey })`). */
export const FCM_VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY ?? "";

/** FCM is usable only with a project config + VAPID key + a browser that
 *  supports the required APIs. */
export const HAS_FCM =
  FIREBASE_CONFIG.apiKey.length > 0 &&
  FIREBASE_CONFIG.projectId.length > 0 &&
  FCM_VAPID_KEY.length > 0;
