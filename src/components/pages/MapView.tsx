import * as React from "react";
import maplibregl from "maplibre-gl";
import type { MapMarker } from "../../types";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

// MapTiler Style (klassisch)
const styleUrl = (key: string) =>
  `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`;

export default function MapView({
  tabId,
  markers,
  onAddMarker,
}: {
  tabId: string;
  markers: MapMarker[];
  onAddMarker: (m: MapMarker) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markerObjsRef = React.useRef<maplibregl.Marker[]>([]);

  // Map init (re-init pro TabId, damit Tab-spezifisch und sauber)
  React.useEffect(() => {
    if (!containerRef.current) return;

    if (!MAPTILER_KEY) {
      // keine Map initialisieren ohne Key
      return;
    }

    // cleanup falls vorherige Map existiert
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl(MAPTILER_KEY),
      center: [13.405, 52.52], // Berlin default
      zoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("contextmenu", (e) => {
      onAddMarker({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [tabId, onAddMarker]);

  // Render markers whenever markers change
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove old marker objects
    markerObjsRef.current.forEach((m) => m.remove());
    markerObjsRef.current = [];

    markers.forEach((mm) => {
      const marker = new maplibregl.Marker().setLngLat([mm.lng, mm.lat]).addTo(map);
      markerObjsRef.current.push(marker);
    });
  }, [markers]);

  if (!MAPTILER_KEY) {
    return (
      <div style={{ padding: 12, color: "#ddd", fontFamily: "system-ui" }}>
        <b>MapTiler Key fehlt.</b>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          Lege <code>.env.local</code> an mit <code>VITE_MAPTILER_KEY=...</code> und starte{" "}
          <code>npm run dev</code> neu.
        </div>
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
