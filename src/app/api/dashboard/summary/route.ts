import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeWarningStats } from "@/lib/warningStats";

export const dynamic = "force-dynamic";

/**
 * Cross-location view for the dashboard: each location's most recently dispatched
 * warning plus its live stats, so the D3 charts can show gaps like
 * "only 40% of Ward 3 confirmed" against the rest of the region at a glance.
 */
export async function GET() {
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });

  const rows = await Promise.all(
    locations.map(async (location) => {
      const latestWarning = await prisma.warning.findFirst({
        where: { locationId: location.id, status: "DISPATCHED" },
        orderBy: { dispatchedAt: "desc" },
        select: { id: true, title: true },
      });

      const stats = latestWarning ? await computeWarningStats(latestWarning.id) : null;

      return {
        location,
        warning: latestWarning,
        stats,
      };
    })
  );

  const dispatchedRows = rows.filter((r) => r.warning && r.stats);
  const totals = dispatchedRows.reduce(
    (acc, r) => {
      acc.totalRecipients += r.stats!.totalRecipients;
      acc.confirmedCount += r.stats!.confirmedCount;
      acc.deliveredCount += r.stats!.deliveredCount;
      return acc;
    },
    { totalRecipients: 0, confirmedCount: 0, deliveredCount: 0 }
  );

  return NextResponse.json({
    rows,
    totals: {
      ...totals,
      overallConfirmationRate:
        totals.totalRecipients > 0 ? totals.confirmedCount / totals.totalRecipients : 0,
      overallDeliveryRate:
        totals.totalRecipients > 0 ? totals.deliveredCount / totals.totalRecipients : 0,
    },
  });
}
