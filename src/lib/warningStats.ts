import { prisma } from "@/lib/db";

export const ESCALATION_CONFIRMATION_THRESHOLD = 0.5;

export interface WarningStats {
  totalRecipients: number;
  deliveredCount: number;
  deliveryRate: number;
  confirmedCount: number;
  understoodCount: number;
  needMoreInfoCount: number;
  confirmationRate: number;
  avgTimeToConfirmSeconds: number | null;
  belowEscalationThreshold: boolean;
  byChannel: Record<string, { total: number; confirmed: number }>;
}

export async function computeWarningStats(warningId: string): Promise<WarningStats> {
  const dispatches = await prisma.dispatch.findMany({
    where: { warningId },
    include: { confirmation: true },
  });

  const totalRecipients = dispatches.length;
  const deliveredCount = dispatches.filter((d) => d.status === "DELIVERED").length;
  const confirmations = dispatches.map((d) => d.confirmation).filter(Boolean) as NonNullable<
    (typeof dispatches)[number]["confirmation"]
  >[];

  const understoodCount = confirmations.filter((c) => c.response === "UNDERSTOOD").length;
  const needMoreInfoCount = confirmations.filter((c) => c.response === "NEED_MORE_INFO").length;
  const confirmedCount = confirmations.length;

  const avgTimeToConfirmSeconds =
    confirmedCount > 0
      ? confirmations.reduce((sum, c) => sum + c.timeToConfirmSeconds, 0) / confirmedCount
      : null;

  const byChannel: WarningStats["byChannel"] = {};
  for (const d of dispatches) {
    byChannel[d.channel] ??= { total: 0, confirmed: 0 };
    byChannel[d.channel].total++;
    if (d.confirmation) byChannel[d.channel].confirmed++;
  }

  const confirmationRate = totalRecipients > 0 ? confirmedCount / totalRecipients : 0;

  return {
    totalRecipients,
    deliveredCount,
    deliveryRate: totalRecipients > 0 ? deliveredCount / totalRecipients : 0,
    confirmedCount,
    understoodCount,
    needMoreInfoCount,
    confirmationRate,
    avgTimeToConfirmSeconds,
    belowEscalationThreshold:
      totalRecipients > 0 && confirmationRate < ESCALATION_CONFIRMATION_THRESHOLD,
    byChannel,
  };
}
