"use client";

import { useCallback, useEffect, useState } from "react";
import CumulativeConfirmationChart, { type TimelinePoint } from "@/components/charts/CumulativeConfirmationChart";
import type { WarningStats } from "@/lib/warningStats";

interface EscalationSuggestion {
  id: string;
  reason: string;
  suggestedAction: string;
  aiRationale: string;
  createdAt: string;
}

export default function WarningLiveStats({ warningId }: { warningId: string }) {
  const [stats, setStats] = useState<WarningStats | null>(null);
  const [timeline, setTimeline] = useState<{ totalRecipients: number; points: TimelinePoint[] }>({
    totalRecipients: 0,
    points: [],
  });
  const [escalations, setEscalations] = useState<EscalationSuggestion[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [statsRes, timelineRes, escRes] = await Promise.all([
      fetch(`/api/warnings/${warningId}/stats`).then((r) => r.json()),
      fetch(`/api/warnings/${warningId}/timeline`).then((r) => r.json()),
      fetch(`/api/warnings/${warningId}/escalate`).then((r) => r.json()),
    ]);
    setStats(statsRes.stats ?? null);
    setTimeline(timelineRes);
    setEscalations(escRes.escalations ?? []);
  }, [warningId]);

  useEffect(() => {
    // Poll live stats for the demo - fetch-on-mount is a documented valid Effect use case
    // (react.dev/learn/synchronizing-with-effects#fetching-data).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function simulate(targetConfirmationRate: number, needMoreInfoRate: number) {
    setBusy("simulate");
    await fetch(`/api/warnings/${warningId}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetConfirmationRate, needMoreInfoRate }),
    });
    await refresh();
    setBusy(null);
  }

  async function escalate() {
    setBusy("escalate");
    const res = await fetch(`/api/warnings/${warningId}/escalate`, { method: "POST" });
    const json = await res.json();
    setBusy(null);
    if (!res.ok) {
      alert(json.error ?? "Could not generate an escalation suggestion.");
      return;
    }
    await refresh();
  }

  if (!stats) return <p className="text-sm text-ink-faint">Loading live stats…</p>;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <Stat label="Recipients" value={stats.totalRecipients.toString()} />
        <Stat label="Delivered" value={`${Math.round(stats.deliveryRate * 100)}%`} />
        <Stat
          label="Confirmed understood"
          value={`${Math.round(stats.confirmationRate * 100)}%`}
          warn={stats.belowEscalationThreshold}
        />
        <Stat label="Avg. time to confirm" value={formatDuration(stats.avgTimeToConfirmSeconds)} />
      </div>

      <div>
        <h3 className="text-sm font-data uppercase tracking-wide text-ink-faint mb-4">
          Confirmations over time
        </h3>
        <CumulativeConfirmationChart points={timeline.points} totalRecipients={timeline.totalRecipients} />
      </div>

      <div className="border-t border-hairline pt-8">
        <h3 className="text-sm font-data uppercase tracking-wide text-ink-faint mb-4">Demo controls</h3>
        <p className="text-xs text-ink-faint mb-4 max-w-lg">
          These buttons advance the simulated (non-Telegram) side of delivery - a
          stand-in for real recipients tapping confirm over time. Real Telegram
          taps update these same numbers automatically.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy !== null}
            onClick={() => simulate(0.85, 0.1)}
            className="px-4 py-2 text-xs font-data uppercase tracking-wide bg-accent text-paper hover:bg-accent-ink disabled:opacity-50"
          >
            Simulate strong response
          </button>
          <button
            disabled={busy !== null}
            onClick={() => simulate(0.3, 0.15)}
            className="px-4 py-2 text-xs font-data uppercase tracking-wide border border-ink text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            Simulate low turnout
          </button>
          <button
            disabled={busy !== null || !stats.belowEscalationThreshold}
            onClick={escalate}
            className="px-4 py-2 text-xs font-data uppercase tracking-wide border border-severity-emergency text-severity-emergency hover:bg-severity-emergency hover:text-paper disabled:opacity-40"
            title={!stats.belowEscalationThreshold ? "Confirmation rate is above the escalation threshold" : ""}
          >
            Get escalation suggestion
          </button>
        </div>
      </div>

      {escalations.length > 0 && (
        <div className="border-t border-hairline pt-8">
          <h3 className="text-sm font-data uppercase tracking-wide text-ink-faint mb-4">
            Escalation suggestions
          </h3>
          <div className="space-y-5">
            {escalations.map((e) => (
              <div key={e.id} className="border-l-2 border-severity-emergency pl-4">
                <p className="text-lg">{e.suggestedAction}</p>
                <p className="mt-1 text-sm text-ink-muted">{e.reason}</p>
                <p className="mt-2 text-xs text-ink-faint italic">{e.aiRationale}</p>
                <p className="mt-2 text-[11px] font-data text-ink-faint">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}m`;
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className={`text-3xl font-data ${warn ? "text-severity-emergency" : "text-ink"}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}
