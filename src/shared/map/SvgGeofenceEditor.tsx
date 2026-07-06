import { useRef, useState } from "react";
import type { GeofenceEditorProps, GeofencePoint } from "./types";

const W = 480;
const H = 360;
const LNG_HALF = 0.005;
const LAT_HALF = 0.004;

/**
 * Self-contained geofence editor — no map tiles, works offline / tokenless.
 * Fallback when VITE_MAPBOX_TOKEN is absent. Same lng/lat model as Mapbox:
 * drag vertex handles · click an edge to insert · double-click to remove.
 */
export function SvgGeofenceEditor({ center, points, onChange }: GeofenceEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const lngMin = center.lng - LNG_HALF;
  const lngMax = center.lng + LNG_HALF;
  const latMin = center.lat - LAT_HALF;
  const latMax = center.lat + LAT_HALF;

  const toXY = (p: GeofencePoint) => ({
    x: ((p.lng - lngMin) / (lngMax - lngMin)) * W,
    y: ((latMax - p.lat) / (latMax - latMin)) * H,
  });

  const toLngLat = (clientX: number, clientY: number): GeofencePoint => {
    const svg = svgRef.current!;
    const ctm = svg.getScreenCTM()!;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    const x = Math.max(0, Math.min(W, local.x));
    const y = Math.max(0, Math.min(H, local.y));
    return {
      lng: lngMin + (x / W) * (lngMax - lngMin),
      lat: latMax - (y / H) * (latMax - latMin),
    };
  };

  const startDrag = (idx: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragIdx(idx);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragIdx === null) return;
    const next = points.slice();
    next[dragIdx] = toLngLat(e.clientX, e.clientY);
    onChange(next);
  };
  const endDrag = () => setDragIdx(null);

  const insertOnEdge = (i: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const mid = { lng: (a.lng + b.lng) / 2, lat: (a.lat + b.lat) / 2 };
    const next = points.slice();
    next.splice(i + 1, 0, mid);
    onChange(next);
  };

  const removeVertex = (i: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (points.length <= 3) return;
    onChange(points.filter((_, idx) => idx !== i));
  };

  const xy = points.map(toXY);
  const ring = xy.map((p) => `${p.x},${p.y}`).join(" ");
  const c = toXY(center);

  return (
    <svg
      ref={svgRef}
      className="geofence"
      viewBox={`0 0 ${W} ${H}`}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      role="img"
      aria-label="Geofence polygon editor"
    >
      <defs>
        <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="var(--c-line)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--c-paper)" />
      <rect width={W} height={H} fill="url(#g)" />

      {points.length >= 3 && (
        <polygon
          points={ring}
          fill="var(--c-primary-soft)"
          fillOpacity="0.6"
          stroke="var(--c-primary)"
          strokeWidth="2"
        />
      )}

      {xy.map((p, i) => {
        const b = xy[(i + 1) % xy.length];
        return (
          <circle
            key={`e${i}`}
            cx={(p.x + b.x) / 2}
            cy={(p.y + b.y) / 2}
            r="5"
            className="geofence__add"
            onClick={insertOnEdge(i)}
          />
        );
      })}

      <circle cx={c.x} cy={c.y} r="4" fill="var(--c-brass)" />

      {xy.map((p, i) => (
        <circle
          key={`v${i}`}
          cx={p.x}
          cy={p.y}
          r="7"
          className="geofence__vertex"
          onPointerDown={startDrag(i)}
          onDoubleClick={removeVertex(i)}
        />
      ))}
    </svg>
  );
}
