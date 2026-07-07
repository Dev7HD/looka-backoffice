import { useMemo } from "react";
import type { SuggestedStop } from "../types";

interface Props {
  origin: { latitude: number; longitude: number } | null;
  stops: SuggestedStop[];
  onPick: (latitude: number, longitude: number) => void;
}

const W = 640;
const H = 420;
const PAD = 40;
// default view: Marrakech medina
const DEFAULT = { minLat: 31.60, maxLat: 31.65, minLon: -8.02, maxLon: -7.96 };

/**
 * Self-contained SVG map: click anywhere to drop the tourist's position, then the suggested route
 * renders as numbered markers joined by a polyline. No Mapbox token needed — works fully offline.
 */
export function SimulatorMap({ origin, stops, onPick }: Props) {
  const bounds = useMemo(() => {
    const pts = [
      ...(origin ? [{ lat: origin.latitude, lon: origin.longitude }] : []),
      ...stops.map((s) => ({ lat: s.latitude, lon: s.longitude })),
    ];
    if (pts.length === 0) return DEFAULT;
    const lats = pts.map((p) => p.lat);
    const lons = pts.map((p) => p.lon);
    const padLat = Math.max(0.01, (Math.max(...lats) - Math.min(...lats)) * 0.3);
    const padLon = Math.max(0.01, (Math.max(...lons) - Math.min(...lons)) * 0.3);
    return {
      minLat: Math.min(...lats) - padLat,
      maxLat: Math.max(...lats) + padLat,
      minLon: Math.min(...lons) - padLon,
      maxLon: Math.max(...lons) + padLon,
    };
  }, [origin, stops]);

  const toXY = (lat: number, lon: number) => {
    const x = PAD + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (W - 2 * PAD);
    const y = PAD + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (H - 2 * PAD);
    return { x, y };
  };

  const toLatLon = (x: number, y: number) => {
    const lon = bounds.minLon + ((x - PAD) / (W - 2 * PAD)) * (bounds.maxLon - bounds.minLon);
    const lat = bounds.maxLat - ((y - PAD) / (H - 2 * PAD)) * (bounds.maxLat - bounds.minLat);
    return { lat, lon };
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const { lat, lon } = toLatLon(x, y);
    onPick(lat, lon);
  };

  const originXY = origin ? toXY(origin.latitude, origin.longitude) : null;
  const stopXY = stops.map((s) => ({ ...toXY(s.latitude, s.longitude), stop: s }));
  const polyline = [
    ...(originXY ? [originXY] : []),
    ...stopXY.map((p) => ({ x: p.x, y: p.y })),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg
      className="sim-map"
      viewBox={`0 0 ${W} ${H}`}
      onClick={handleClick}
      role="img"
      aria-label="Tour simulator map"
    >
      <defs>
        <pattern id="sim-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="var(--c-border, #e2e2e2)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#sim-grid)" />

      {stops.length > 0 && (
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--c-brass, #b5893a)"
          strokeWidth="2.5"
          strokeDasharray="2 0"
          opacity="0.7"
        />
      )}

      {originXY && (
        <g>
          <circle cx={originXY.x} cy={originXY.y} r="9" fill="#2563eb" opacity="0.25" />
          <circle cx={originXY.x} cy={originXY.y} r="5" fill="#2563eb" />
        </g>
      )}

      {stopXY.map((p) => (
        <g key={p.stop.poiId}>
          <circle
            cx={p.x}
            cy={p.y}
            r="13"
            fill={roleColor(p.stop.role)}
            stroke="#fff"
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#fff"
          >
            {p.stop.order}
          </text>
        </g>
      ))}
    </svg>
  );
}

function roleColor(role: SuggestedStop["role"]): string {
  switch (role) {
    case "FOOD":
      return "#d97706";
    case "COFFEE":
      return "#92400e";
    default:
      return "#b5893a";
  }
}
