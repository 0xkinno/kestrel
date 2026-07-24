"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MapView, { type MapLocation } from "@/components/MapView";
import SeverityBadge from "@/components/SeverityBadge";
import { EDITORIAL_IMAGES } from "@/lib/images";

interface LocationApiRow {
  id: string;
  name: string;
  ward: string;
  country: string;
  lat: number;
  lng: number;
  hazardSignals: { type: string; severity: "WATCH" | "WARNING" | "EMERGENCY"; summary: string; observedAt: string }[];
  warnings: { id: string; title: string; status: string }[];
  _count: { recipients: number };
}

export default function MapPage() {
  const [rows, setRows] = useState<LocationApiRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => setRows(d.locations ?? []))
      .finally(() => setLoading(false));
  }, []);

  const mapLocations: MapLocation[] = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        ward: r.ward,
        country: r.country,
        lat: r.lat,
        lng: r.lng,
        severity: r.hazardSignals[0]?.severity ?? null,
        hazardType: r.hazardSignals[0]?.type ?? null,
        warningStatus: r.warnings[0]?.status ?? null,
      })),
    [rows]
  );

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative h-40 w-full overflow-hidden shrink-0">
        <Image
          src={EDITORIAL_IMAGES.mapBackdrop.src}
          alt={EDITORIAL_IMAGES.mapBackdrop.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-6 md:px-10">
          <div>
            <p className="text-[11px] font-data uppercase tracking-[0.16em] text-paper/75">Live map</p>
            <h1 className="mt-1 text-3xl text-paper">Hazard signals across the region</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row min-h-[560px]">
        <div className="relative flex-1 min-h-[420px]">
          <MapView locations={mapLocations} onSelect={(loc) => setSelectedId(loc.id)} />
        </div>

        <aside className="w-full md:w-[380px] shrink-0 border-t md:border-t-0 md:border-l border-hairline overflow-y-auto max-h-[70vh] md:max-h-none">
          {loading && <p className="p-6 text-sm text-ink-faint">Loading locations…</p>}

          {!loading && selected ? (
            <div className="p-6">
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-ink-faint hover:text-ink-muted mb-4"
              >
                ← All locations
              </button>
              <h2 className="text-2xl">{selected.name}</h2>
              <p className="text-sm text-ink-muted">
                {selected.ward}, {selected.country}
              </p>

              {selected.hazardSignals[0] ? (
                <div className="mt-5">
                  <SeverityBadge severity={selected.hazardSignals[0].severity} />
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                    {selected.hazardSignals[0].summary}
                  </p>
                  <p className="mt-1 text-[11px] font-data text-ink-faint">
                    observed {new Date(selected.hazardSignals[0].observedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-sm text-ink-faint">No hazard signal recorded yet.</p>
              )}

              <p className="mt-5 text-xs font-data text-ink-faint uppercase tracking-wide">
                {selected._count.recipients} registered recipients
              </p>

              {selected.warnings[0] && (
                <Link
                  href={`/warnings/${selected.warnings[0].id}`}
                  className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-accent-ink"
                >
                  View latest warning →
                </Link>
              )}
            </div>
          ) : (
            !loading && (
              <ul>
                {rows.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelectedId(r.id)}
                      className="w-full text-left px-6 py-4 border-b border-hairline hover:bg-paper-dim transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm">
                          {r.name}, {r.ward}
                        </span>
                        {r.hazardSignals[0] && <SeverityBadge severity={r.hazardSignals[0].severity} />}
                      </div>
                      <span className="text-xs text-ink-faint">{r.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </aside>
      </div>
    </div>
  );
}
