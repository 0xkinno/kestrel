"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RegionComparisonChart, { type RegionRow } from "@/components/charts/RegionComparisonChart";

interface SummaryRow {
  location: { id: string; name: string; ward: string; country: string };
  warning: { id: string; title: string } | null;
  stats: {
    totalRecipients: number;
    confirmationRate: number;
    deliveryRate: number;
    belowEscalationThreshold: boolean;
  } | null;
}

interface Summary {
  rows: SummaryRow[];
  totals: {
    totalRecipients: number;
    confirmedCount: number;
    deliveredCount: number;
    overallConfirmationRate: number;
    overallDeliveryRate: number;
  };
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setSummary);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 6000);
    return () => clearInterval(interval);
  }, [refresh]);

  const dispatchedRows = summary?.rows.filter((r) => r.warning && r.stats) ?? [];
  const chartRows: RegionRow[] = dispatchedRows.map((r) => ({
    label: `${r.location.name}, ${r.location.ward}`,
    ward: r.location.ward,
    confirmationRate: r.stats!.confirmationRate,
    belowThreshold: r.stats!.belowEscalationThreshold,
    totalRecipients: r.stats!.totalRecipients,
  }));

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-[11px] font-data uppercase tracking-[0.16em] text-ink-faint">
          Verification dashboard
        </p>
        <h1 className="mt-3 text-4xl">Delivery is easy. Understanding is the point.</h1>

        {summary && (
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-b border-hairline py-8">
            <Stat label="Total recipients" value={summary.totals.totalRecipients.toLocaleString()} />
            <Stat
              label="Delivery rate"
              value={`${Math.round(summary.totals.overallDeliveryRate * 100)}%`}
            />
            <Stat
              label="Confirmation rate"
              value={`${Math.round(summary.totals.overallConfirmationRate * 100)}%`}
            />
            <Stat label="Warnings dispatched" value={dispatchedRows.length.toString()} />
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-sm font-data uppercase tracking-wide text-ink-faint mb-8">
            Confirmation rate by location
          </h2>
          {chartRows.length > 0 ? (
            <RegionComparisonChart rows={chartRows} />
          ) : (
            <p className="text-ink-faint">
              No warnings dispatched yet. Draft and dispatch one from the{" "}
              <Link href="/admin" className="underline underline-offset-4">
                admin console
              </Link>
              .
            </p>
          )}
        </div>

        {dispatchedRows.some((r) => r.stats!.belowEscalationThreshold) && (
          <div className="mt-14 border-l-2 border-severity-emergency pl-6">
            <p className="text-sm font-data uppercase tracking-wide text-severity-emergency">
              Escalation flagged
            </p>
            <p className="mt-2 text-ink-muted max-w-xl">
              At least one location is below the 50% confirmation threshold. Open
              its warning to review the AI-suggested fallback action.
            </p>
            <ul className="mt-4 space-y-2">
              {dispatchedRows
                .filter((r) => r.stats!.belowEscalationThreshold)
                .map((r) => (
                  <li key={r.location.id}>
                    <Link
                      href={`/warnings/${r.warning!.id}`}
                      className="text-sm underline underline-offset-4 hover:text-accent-ink"
                    >
                      {r.location.name}, {r.location.ward} - {Math.round(r.stats!.confirmationRate * 100)}% confirmed →
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-3xl font-data">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}
