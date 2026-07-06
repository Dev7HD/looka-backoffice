import { lazy, Suspense } from "react";
import { HAS_MAPBOX } from "./config";
import { SvgGeofenceEditor } from "./SvgGeofenceEditor";
import type { GeofenceEditorProps } from "./types";

// Mapbox GL is heavy — only pulled into the bundle when a token exists.
const MapboxGeofenceEditor = lazy(() =>
  import("./MapboxGeofenceEditor").then((m) => ({
    default: m.MapboxGeofenceEditor,
  }))
);

/** Geofence editor adapter selector: real Mapbox when a token is configured,
 *  otherwise the offline SVG fallback. Both honour the same props. */
export function GeofenceMap(props: GeofenceEditorProps) {
  if (!HAS_MAPBOX) return <SvgGeofenceEditor {...props} />;
  return (
    <Suspense fallback={<div className="geofence geofence--loading" />}>
      <MapboxGeofenceEditor {...props} />
    </Suspense>
  );
}

export type { GeofencePoint, GeofenceEditorProps } from "./types";
export { HAS_MAPBOX } from "./config";
