import { lazy, Suspense } from "react";
import { HAS_MAPBOX } from "@shared/map/config";
import { SvgLiveMap } from "./SvgLiveMap";
import type { LiveMapProps } from "./liveMap.shared";

// Mapbox GL is heavy — loaded only when a token is configured.
const MapboxLiveMap = lazy(() =>
  import("./MapboxLiveMap").then((m) => ({ default: m.MapboxLiveMap }))
);

/** Live-positions adapter: real Mapbox marker layer when a token exists,
 *  otherwise the offline SVG canvas. Both honour the same props. */
export function LiveMap(props: LiveMapProps) {
  if (!HAS_MAPBOX) return <SvgLiveMap {...props} />;
  return (
    <Suspense fallback={<div className="livemap livemap--loading" />}>
      <MapboxLiveMap {...props} />
    </Suspense>
  );
}
