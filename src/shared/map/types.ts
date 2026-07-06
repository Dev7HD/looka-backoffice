/** Geographic point shared by every map adapter. Structurally compatible
 *  with feature-level LngLat types. */
export interface GeofencePoint {
  lng: number;
  lat: number;
}

export interface GeofenceEditorProps {
  center: GeofencePoint;
  points: GeofencePoint[];
  onChange: (points: GeofencePoint[]) => void;
}
