import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_STYLE, MAPBOX_TOKEN } from "@shared/map/config";
import { MAP_CENTER, RIDE_COLOR, type LiveMapProps } from "./liveMap.shared";

/** Real Mapbox GL live-positions layer. Rides map to HTML markers that are
 *  upserted/moved/removed as the feed updates. Drop-in behind LiveMap. */
export function MapboxLiveMap({ rides, selectedId, onSelect }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const loadedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Init once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: 12.5,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      loadedRef.current = true;
    });
    return () => {
      markers.current.forEach((m) => m.remove());
      markers.current.clear();
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  // Diff rides → markers on every update.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();
    for (const r of rides) {
      seen.add(r.id);
      let marker = markers.current.get(r.id);
      if (!marker) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "livemap-marker";
        el.addEventListener("click", () => onSelectRef.current(r.id));
        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([r.pos.lng, r.pos.lat])
          .addTo(map);
        markers.current.set(r.id, marker);
      } else {
        marker.setLngLat([r.pos.lng, r.pos.lat]);
      }
      const el = marker.getElement();
      el.style.setProperty("--marker-color", RIDE_COLOR[r.status]);
      el.classList.toggle("livemap-marker--pulse", r.status === "IN_TOUR");
      el.classList.toggle("livemap-marker--selected", r.id === selectedId);
    }
    // Remove stale markers.
    for (const [id, marker] of markers.current) {
      if (!seen.has(id)) {
        marker.remove();
        markers.current.delete(id);
      }
    }
  }, [rides, selectedId]);

  return <div ref={containerRef} className="livemap livemap--gl" />;
}
