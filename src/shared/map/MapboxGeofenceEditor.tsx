import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MAPBOX_STYLE, MAPBOX_TOKEN } from "./config";
import type { GeofencePoint } from "./types";

const FEATURE_ID = "geofence";

/** Closed GeoJSON ring [[lng,lat]…, first] from an open point list. */
function toRing(points: GeofencePoint[]): number[][] {
  const ring = points.map((p) => [p.lng, p.lat]);
  if (ring.length > 0) ring.push(ring[0]);
  return ring;
}
/** Open point list from a (possibly closed) GeoJSON ring. */
function fromRing(ring: number[][]): GeofencePoint[] {
  const open = ring.slice();
  const n = open.length;
  if (n > 1 && open[0][0] === open[n - 1][0] && open[0][1] === open[n - 1][1]) {
    open.pop();
  }
  return open.map(([lng, lat]) => ({ lng, lat }));
}
function ringKey(points: GeofencePoint[]): string {
  return points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
}

/**
 * Real Mapbox GL geofence editor. Same {center, points, onChange} contract as
 * the SVG fallback, so it is a drop-in adapter behind GeofenceMap.
 */
export function MapboxGeofenceEditor({
  center,
  points,
  onChange,
}: {
  center: GeofencePoint;
  points: GeofencePoint[];
  onChange: (points: GeofencePoint[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Latest onChange without forcing map re-init.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Key of the geometry we last emitted — guards the prop→draw sync loop.
  const lastEmitted = useRef<string>("");

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: [center.lng, center.lat],
      zoom: 15,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });
    drawRef.current = draw;
    map.addControl(draw, "top-left");

    markerRef.current = new mapboxgl.Marker({ color: "#C08A2D" })
      .setLngLat([center.lng, center.lat])
      .addTo(map);

    const emit = () => {
      const fc = draw.getAll();
      const poly = fc.features.find((f) => f.geometry.type === "Polygon");
      const next = poly
        ? fromRing((poly.geometry as GeoJSON.Polygon).coordinates[0])
        : [];
      lastEmitted.current = ringKey(next);
      onChangeRef.current(next);
    };

    map.on("load", () => {
      const ring = toRing(points);
      if (ring.length >= 4) {
        draw.add({
          id: FEATURE_ID,
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [ring] },
        });
        lastEmitted.current = ringKey(points);
      }
    });

    map.on("draw.create", emit);
    map.on("draw.update", emit);
    map.on("draw.delete", emit);

    return () => {
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
      markerRef.current = null;
    };
    // Init is intentionally one-shot; center only seeds the initial view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external point changes (e.g. Cancel/reset) into the draw layer.
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    if (ringKey(points) === lastEmitted.current) return; // our own edit — skip
    const ring = toRing(points);
    if (ring.length >= 4) {
      draw.set({
        type: "FeatureCollection",
        features: [
          {
            id: FEATURE_ID,
            type: "Feature",
            properties: {},
            geometry: { type: "Polygon", coordinates: [ring] },
          },
        ],
      });
    } else {
      draw.deleteAll();
    }
    lastEmitted.current = ringKey(points);
  }, [points]);

  // Keep the center marker in sync.
  useEffect(() => {
    markerRef.current?.setLngLat([center.lng, center.lat]);
  }, [center]);

  return <div ref={containerRef} className="geofence geofence--map" />;
}
