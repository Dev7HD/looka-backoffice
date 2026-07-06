/** Mapbox configuration. Token via VITE_MAPBOX_TOKEN (Keycloak-gated deploys
 *  inject it at build time). When absent, the editor falls back to the
 *  self-contained SVG canvas so the app still runs offline / tokenless. */
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

export const MAPBOX_STYLE =
  import.meta.env.VITE_MAPBOX_STYLE ?? "mapbox://styles/mapbox/light-v11";

export const HAS_MAPBOX = MAPBOX_TOKEN.length > 0;
