import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Demo control: advances the simulated (non-Telegram) side of a dispatched warning
 * by confirming a target fraction of not-yet-confirmed simulated dispatches. This
 * stands in for real recipients tapping "confirm" over time, letting a presenter
 * deterministically drive the delivery/comprehension numbers live during a demo
 * (e.g. force a low-confirmation scenario to trigger the escalation suggestion).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const targetRate: number = Math.min(1, Math.max(0, body.targetConfirmationRate ?? 0.7));
  const needMoreInfoRate: number = Math.min(1, Math.max(0, body.needMoreInfoRate ?? 0.1));

  const warning = await prisma.warning.findUnique({ where: { id } });
  if (!warning) return NextResponse.json({ error: "Warning not found" }, { status: 404 });

  const simulatedDispatches = await prisma.dispatch.findMany({
    where: {
      warningId: id,
      channel: { in: ["SIMULATED_SMS", "SIMULATED_USSD"] },
      confirmation: null,
    },
  });

  const totalSimulated = await prisma.dispatch.count({
    where: { warningId: id, channel: { in: ["SIMULATED_SMS", "SIMULATED_USSD"] } },
  });
  const alreadyConfirmed = await prisma.confirmation.count({
    where: { dispatch: { warningId: id, channel: { in: ["SIMULATED_SMS", "SIMULATED_USSD"] } } },
  });

  const targetConfirmedTotal = Math.round(totalSimulated * targetRate);
  const toConfirmNow = Math.max(0, targetConfirmedTotal - alreadyConfirmed);

  const shuffled = [...simulatedDispatches].sort(() => Math.random() - 0.5);
  const batch = shuffled.slice(0, toConfirmNow);

  let confirmedCount = 0;
  let needMoreInfoCount = 0;
  const now = Date.now();

  // Batched: one createMany + one updateMany, instead of N sequential round
  // trips - matters here because a demo click may simulate dozens of
  // recipients confirming at once, unlike the real Telegram webhook, which
  // only ever records one confirmation per request.
  const confirmationRows = batch.map((dispatch) => {
    const isNeedMoreInfo = Math.random() < needMoreInfoRate;
    if (isNeedMoreInfo) needMoreInfoCount++;
    else confirmedCount++;
    const response: "UNDERSTOOD" | "NEED_MORE_INFO" = isNeedMoreInfo ? "NEED_MORE_INFO" : "UNDERSTOOD";

    const delaySeconds = 15 + Math.random() * 900; // 15s–15min, plausible human response spread
    const respondedAtMs = Math.min(dispatch.sentAt.getTime() + delaySeconds * 1000, now);
    const timeToConfirmSeconds = Math.max(1, Math.round((respondedAtMs - dispatch.sentAt.getTime()) / 1000));

    return {
      dispatchId: dispatch.id,
      response,
      respondedAt: new Date(respondedAtMs),
      timeToConfirmSeconds,
    };
  });

  if (confirmationRows.length > 0) {
    await prisma.$transaction([
      prisma.confirmation.createMany({ data: confirmationRows }),
      prisma.dispatch.updateMany({
        where: { id: { in: confirmationRows.map((r) => r.dispatchId) } },
        data: { status: "DELIVERED" },
      }),
    ]);
  }

  return NextResponse.json({
    simulatedThisBatch: batch.length,
    confirmedCount,
    needMoreInfoCount,
  });
}
