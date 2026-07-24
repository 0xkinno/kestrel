"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapLocation {
  id: string;
  name: string;
  ward: string;
  country: string;
  lat: number;
  lng: number;
  severity: "WATCH" | "WARNING" | "EMERGENCY" | null;
  hazardType: string | null;
  warningStatus: string | null;
}

const SEVERITY_COLOR: Record<string, string> = {
  WATCH: "#e3c482",
  WARNING: "#c8873a",
  EMERGENCY: "#8b3f2a",
};

/**
 * MapLibre GL (open-source, no vendor key) on OpenFreeMap tiles, restyled at
 * runtime to the paper/ink/ochre palette - no default Mapbox-blue basemap.
 */
export default function MapView({
  locations,
  onSelect,
}: {
  locations: MapLocation[];
  onSelect?: (location: MapLocation) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [38, 6],
      zoom: 3.6,
      attributionControl: { compact: true },
    });

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      restyleToKestrelPalette(map);
      setReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const loc of locations) {
      const el = document.createElement("button");
      el.setAttribute("aria-label", `${loc.name}, ${loc.ward}`);
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid #f7f4ee";
      el.style.boxShadow = "0 1px 4px rgba(26,24,21,0.35)";
      el.style.background = loc.severity ? SEVERITY_COLOR[loc.severity] : "#8a847b";
      el.style.cursor = "pointer";

      const marker = new Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(
          new Popup({ offset: 14, closeButton: false }).setHTML(
            `<div style="font-family: var(--font-body), sans-serif; padding: 2px 2px; min-width: 160px;">
              <div style="font-weight:600; font-size:13px; color:#1a1815;">${loc.name}, ${loc.ward}</div>
              <div style="font-size:11px; color:#55504a; margin-top:2px;">${loc.country}</div>
              ${
                loc.hazardType
                  ? `<div style="font-size:11px; color:#6b4319; margin-top:6px; text-transform:uppercase; letter-spacing:0.06em;">${loc.hazardType} · ${loc.severity}</div>`
                  : `<div style="font-size:11px; color:#8a847b; margin-top:6px;">No active signal</div>`
              }
            </div>`
          )
        )
        .addTo(map);

      el.addEventListener("click", () => onSelect?.(loc));
      markersRef.current.push(marker);
    }
  }, [locations, ready, onSelect]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function restyleToKestrelPalette(map: MapLibreMap) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    try {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", "#F7F4EE");
      } else if (layer.type === "fill") {
        const id = layer.id.toLowerCase();
        if (id.includes("water")) {
          map.setPaintProperty(layer.id, "fill-color", "#E4DCC8");
        } else if (id.includes("landuse") || id.includes("land") || id.includes("park")) {
          map.setPaintProperty(layer.id, "fill-color", "#EFE9DE");
        } else if (id.includes("building")) {
          map.setPaintProperty(layer.id, "fill-color", "#E8E1D3");
        }
      } else if (layer.type === "line") {
        const id = layer.id.toLowerCase();
        if (id.includes("boundary")) {
          map.setPaintProperty(layer.id, "line-color", "#8A847B");
          map.setPaintProperty(layer.id, "line-opacity", 0.5);
        } else if (id.includes("road") || id.includes("highway")) {
          map.setPaintProperty(layer.id, "line-color", "#D8CFBE");
        }
      } else if (layer.type === "symbol") {
        map.setPaintProperty(layer.id, "text-color", "#55504A");
        map.setPaintProperty(layer.id, "text-halo-color", "#F7F4EE");
      }
    } catch {
      // Some layers don't support every paint property - safe to skip.
    }
  }
}
