import { prisma } from "@/lib/db";

export type ConfirmationResponseValue = "UNDERSTOOD" | "NEED_MORE_INFO";

/**
 * Records a confirmation for a dispatch - used by both the real Telegram webhook
 * and the in-app delivery simulation, so the dashboard treats real and simulated
 * confirmations identically once they land.
 */
export async function recordConfirmation(dispatchId: string, response: ConfirmationResponseValue, respondedAt: Date = new Date()) {
  const dispatch = await prisma.dispatch.findUnique({ where: { id: dispatchId } });
  if (!dispatch) throw new Error(`Dispatch ${dispatchId} not found`);

  const existing = await prisma.confirmation.findUnique({ where: { dispatchId } });
  if (existing) return existing;

  const timeToConfirmSeconds = Math.max(
    1,
    Math.round((respondedAt.getTime() - dispatch.sentAt.getTime()) / 1000)
  );

  const [confirmation] = await prisma.$transaction([
    prisma.confirmation.create({
      data: { dispatchId, response, respondedAt, timeToConfirmSeconds },
    }),
    prisma.dispatch.update({
      where: { id: dispatchId },
      data: { status: "DELIVERED", deliveredAt: dispatch.deliveredAt ?? respondedAt },
    }),
  ]);

  return confirmation;
}
