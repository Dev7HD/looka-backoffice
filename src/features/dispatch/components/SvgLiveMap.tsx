import { MAP_CENTER, RIDE_COLOR, type LiveMapProps } from "./liveMap.shared";

const W = 560;
const H = 420;
const LNG_HALF = 0.045;
const LAT_HALF = 0.034;

/** Offline live-positions canvas. Same {rides, selectedId, onSelect} contract
 *  as the Mapbox layer — the fallback behind LiveMap. */
export function SvgLiveMap({ rides, selectedId, onSelect }: LiveMapProps) {
  const toXY = (lng: number, lat: number) => ({
    x: ((lng - (MAP_CENTER.lng - LNG_HALF)) / (2 * LNG_HALF)) * W,
    y: ((MAP_CENTER.lat + LAT_HALF - lat) / (2 * LAT_HALF)) * H,
  });

  return (
    <svg
      className="livemap"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Live ride positions"
    >
      <defs>
        <pattern id="lm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--c-line)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--c-paper)" />
      <rect width={W} height={H} fill="url(#lm-grid)" />

      {rides.map((r) => {
        const { x, y } = toXY(r.pos.lng, r.pos.lat);
        const color = RIDE_COLOR[r.status];
        const selected = r.id === selectedId;
        return (
          <g
            key={r.id}
            className="livemap__ride"
            transform={`translate(${x} ${y})`}
            onClick={() => onSelect(r.id)}
          >
            {r.status === "IN_TOUR" && (
              <circle r="12" fill={color} className="livemap__pulse" />
            )}
            {selected && <circle r="11" fill="none" stroke={color} strokeWidth="2" />}
            <circle r="6" fill={color} stroke="var(--c-surface)" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}
