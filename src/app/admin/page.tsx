"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";

interface HazardSignal {
  id: string;
  type: string;
  severity: "WATCH" | "WARNING" | "EMERGENCY";
  summary: string;
  observedAt: string;
  location: { id: string; name: string; ward: string; country: string };
}

interface WarningRow {
  id: string;
  hazardSignalId: string;
  title: string;
  status: "DRAFT" | "APPROVED" | "DISPATCHED";
  severity: "WATCH" | "WARNING" | "EMERGENCY";
  location: { name: string; ward: string };
}

export default function AdminPage() {
  const [signals, setSignals] = useState<HazardSignal[]>([]);
  const [warnings, setWarnings] = useState<WarningRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSignals = useCallback(async () => {
    const res = await fetch("/api/hazards/refresh");
    const json = await res.json();
    setSignals(json.signals ?? []);
  }, []);

  const loadWarnings = useCallback(async () => {
    const res = await fetch("/api/warnings/generate");
    const json = await res.json();
    setWarnings(json.warnings ?? []);
  }, []);

  useEffect(() => {
    // Fetch-on-mount, refreshed again after officer actions via the same callbacks -
    // a documented valid Effect use case (react.dev/learn/synchronizing-with-effects#fetching-data).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSignals();
    loadWarnings();
  }, [loadSignals, loadWarnings]);

  async function refreshHazards() {
    setRefreshing(true);
    setError(null);
    const res = await fetch("/api/hazards/refresh", { method: "POST" });
    const json = await res.json();
    setRefreshing(false);
    if (!res.ok) {
      setError(json.error ?? "Could not refresh hazard data.");
      return;
    }
    await loadSignals();
  }

  async function generateWarning(signalId: string) {
    setGeneratingId(signalId);
    setError(null);
    const res = await fetch("/api/warnings/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hazardSignalId: signalId }),
    });
    const json = await res.json();
    setGeneratingId(null);
    if (!res.ok) {
      setError(json.error ?? "Could not generate warning.");
      return;
    }
    await loadWarnings();
  }

  const draftWarnings = warnings.filter((w) => w.status === "DRAFT");
  const approvedWarnings = warnings.filter((w) => w.status === "APPROVED");
  const warningBySignalId = new Map(warnings.map((w) => [w.hazardSignalId, w]));

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-[11px] font-data uppercase tracking-[0.16em] text-ink-faint">
          Officer console
        </p>
        <h1 className="mt-3 text-4xl">Review before anything goes out.</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Nothing in Kestrel dispatches automatically. Pull the latest real hazard
          readings, draft a plain-language warning, review or edit it, then approve
          and dispatch - in that order, every time.
        </p>

        {error && <p className="mt-6 text-sm text-severity-emergency">{error}</p>}

        <section className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-data uppercase tracking-wide text-ink-faint">
              1 · Live hazard readings
            </h2>
            <button
              onClick={refreshHazards}
              disabled={refreshing}
              className="px-4 py-2 text-xs font-data uppercase tracking-wide bg-accent text-paper hover:bg-accent-ink disabled:opacity-50"
            >
              {refreshing ? "Pulling Open-Meteo data…" : "Pull latest hazard data"}
            </button>
          </div>

          <div className="divide-y divide-hairline border-t border-b border-hairline">
            {signals.length === 0 && (
              <p className="py-8 text-ink-faint text-sm">
                No hazard signals yet - click &ldquo;Pull latest hazard data&rdquo; to fetch real
                readings for every seeded location.
              </p>
            )}
            {signals.map((s) => {
              const existingWarning = warningBySignalId.get(s.id);
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <SeverityBadge severity={s.severity} />
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        {s.location.name}, {s.location.ward} · {s.type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-ink-faint truncate">{s.summary}</p>
                    </div>
                  </div>
                  {existingWarning ? (
                    <Link
                      href={`/warnings/${existingWarning.id}`}
                      className="shrink-0 px-3 py-2 text-xs font-data uppercase tracking-wide text-ink-faint hover:text-accent-ink"
                    >
                      Already drafted, view →
                    </Link>
                  ) : (
                    <button
                      onClick={() => generateWarning(s.id)}
                      disabled={generatingId === s.id}
                      className="shrink-0 px-3 py-2 text-xs font-data uppercase tracking-wide border border-ink hover:bg-ink hover:text-paper disabled:opacity-50"
                    >
                      {generatingId === s.id ? "Drafting…" : "Draft warning"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-sm font-data uppercase tracking-wide text-ink-faint mb-6">
            2 · Awaiting review ({draftWarnings.length})
          </h2>
          <WarningList rows={draftWarnings} empty="No drafts waiting on review." />
        </section>

        <section className="mt-16">
          <h2 className="text-sm font-data uppercase tracking-wide text-ink-faint mb-6">
            3 · Approved - ready to dispatch ({approvedWarnings.length})
          </h2>
          <WarningList rows={approvedWarnings} empty="Nothing approved yet." />
        </section>
      </div>
    </div>
  );
}

function WarningList({ rows, empty }: { rows: WarningRow[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-ink-faint">{empty}</p>;
  return (
    <div className="divide-y divide-hairline border-t border-b border-hairline">
      {rows.map((w) => (
        <Link
          key={w.id}
          href={`/warnings/${w.id}`}
          className="flex items-center justify-between gap-4 py-4 hover:bg-paper-dim transition-colors px-2 -mx-2"
        >
          <div className="flex items-center gap-4 min-w-0">
            <SeverityBadge severity={w.severity} />
            <p className="text-sm truncate">
              {w.title} - {w.location.name}, {w.location.ward}
            </p>
          </div>
          <span className="shrink-0 text-xs text-ink-faint">Review →</span>
        </Link>
      ))}
    </div>
  );
}
