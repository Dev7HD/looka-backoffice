/// <reference types="vite/client" />

declare module "*.css";

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_MAPBOX_TOKEN?: string;
  readonly VITE_MAPBOX_STYLE?: string;
  readonly VITE_AUTH_MODE?: string;
  readonly VITE_KEYCLOAK_URL?: string;
  readonly VITE_KEYCLOAK_REALM?: string;
  readonly VITE_KEYCLOAK_CLIENT_ID?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_USE_MOCK_WS?: string;
  readonly VITE_FCM_API_KEY?: string;
  readonly VITE_FCM_AUTH_DOMAIN?: string;
  readonly VITE_FCM_PROJECT_ID?: string;
  readonly VITE_FCM_SENDER_ID?: string;
  readonly VITE_FCM_APP_ID?: string;
  readonly VITE_FCM_VAPID_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
