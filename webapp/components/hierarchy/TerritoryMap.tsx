"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { LatLng } from "@/lib/geo";

export type MapPin = {
  id: string;
  position: LatLng;
  label: string;
  sublabel?: string;
  color: string; // hex
  onClick?: () => void;
};

function FitBounds({
  pins,
  backgroundPins,
  locked,
}: {
  pins: MapPin[];
  backgroundPins: MapPin[];
  locked: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    const all = [...pins, ...backgroundPins];
    if (all.length === 0) return;
    if (all.length === 1) {
      map.setView([all[0].position.lat, all[0].position.lng], locked ? 9 : 12);
      return;
    }
    const bounds = all.map((p) => [p.position.lat, p.position.lng]) as [number, number][];
    // When the caller locks the viewport to a region (maxBounds set), cap how
    // far out fitBounds can zoom to something that still reads as "this
    // region", not the whole country — see KWARA_STATE_BOUNDS in lib/geo.ts.
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: locked ? 10 : 13 });
  }, [pins, backgroundPins, locked, map]);
  return null;
}

export default function TerritoryMap({
  pins,
  backgroundPins = [],
  maxBounds,
  regionLabel,
}: {
  pins: MapPin[];
  backgroundPins?: MapPin[];
  // Locks pan/zoom to a region so the map can't drift into a neighboring
  // state or, for Kwara specifically, across the Benin Republic border (whose
  // OSM base-tile labels are in French) — see KWARA_STATE_BOUNDS in
  // lib/geo.ts for how this box was chosen and its caveats.
  maxBounds?: [LatLng, LatLng];
  // Small on-map badge so the view visually self-identifies (e.g. "Kwara
  // State") regardless of how the underlying tile layer renders.
  regionLabel?: string;
}) {
  const center: [number, number] = pins.length
    ? [pins[0].position.lat, pins[0].position.lng]
    : [9.082, 8.6753];
  const leafletBounds: [[number, number], [number, number]] | undefined = maxBounds
    ? [
        [maxBounds[0].lat, maxBounds[0].lng],
        [maxBounds[1].lat, maxBounds[1].lng],
      ]
    : undefined;

  return (
    <div className="relative h-full w-full">
      {regionLabel && (
        <div className="pointer-events-none absolute left-2 top-2 z-[1000] rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-co-navy shadow">
          {regionLabel}
        </div>
      )}
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full rounded-xl"
        {...(leafletBounds
          ? { maxBounds: leafletBounds, maxBoundsViscosity: 1.0, minZoom: 8 }
          : {})}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds pins={pins} backgroundPins={backgroundPins} locked={!!maxBounds} />
        {/* Dimmed, non-highlighted markers — rendered first so the highlighted pins layer on top. */}
        {backgroundPins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.position.lat, pin.position.lng]}
            radius={4}
            pathOptions={{ color: "#a1a1aa", fillColor: "#a1a1aa", fillOpacity: 0.5, weight: 1 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div className="text-xs">{pin.label}</div>
            </Tooltip>
          </CircleMarker>
        ))}
        {pins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.position.lat, pin.position.lng]}
            radius={9}
            pathOptions={{ color: pin.color, fillColor: pin.color, fillOpacity: 0.85, weight: 2 }}
            eventHandlers={pin.onClick ? { click: pin.onClick } : undefined}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="text-xs">
                <div className="font-semibold">{pin.label}</div>
                {pin.sublabel && <div className="text-zinc-500">{pin.sublabel}</div>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
