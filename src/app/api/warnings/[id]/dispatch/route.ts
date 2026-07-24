import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWarningMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Fans a warning out to every recipient registered for its location. Real Telegram
 * recipients (people who /start'd the bot) get an actual message with tap-to-confirm
 * buttons. Everyone else gets a simulated SMS/USSD dispatch record - a stand-in for
 * channels this hackathon build can't wire to a real gateway, clearly labeled as such
 * in the UI (see components/DispatchChannelBadge).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const warning = await prisma.warning.findUnique({
    where: { id },
    include: { location: true },
  });
  if (!warning) return NextResponse.json({ error: "Warning not found" }, { status: 404 });
  if (warning.status !== "APPROVED") {
    return NextResponse.json({ error: "Only approved warnings can be dispatched" }, { status: 400 });
  }

  const recipients = await prisma.recipient.findMany({ where: { locationId: warning.locationId } });
  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients registered for this location" }, { status: 400 });
  }

  const locationLabel = `${warning.location.name}, ${warning.location.ward}, ${warning.location.country}`;
  const telegramRecipients = recipients.filter((r) => r.telegramChatId);
  const simulatedRecipients = recipients.filter((r) => !r.telegramChatId);
  const telegramErrors: string[] = [];

  // Simulated channels never make an external call, so they're safe to insert in one
  // batch rather than one round trip per recipient - matters once a location's
  // recipient pool is dozens deep. Real Telegram sends are handled individually just
  // below, since each is its own external API call and needs its dispatch row's id
  // embedded in the message's confirm buttons before sending.
  if (simulatedRecipients.length > 0) {
    await prisma.dispatch.createMany({
      data: simulatedRecipients.map((recipient) => ({
        warningId: warning.id,
        recipientId: recipient.id,
        channel: recipient.preferredChannel,
        status: "DELIVERED" as const,
        deliveredAt: new Date(),
      })),
    });
  }

  for (const recipient of telegramRecipients) {
    const dispatch = await prisma.dispatch.create({
      data: {
        warningId: warning.id,
        recipientId: recipient.id,
        channel: "TELEGRAM",
        status: "SENT",
        deliveredAt: null,
      },
    });

    try {
      await sendWarningMessage(recipient.telegramChatId!, {
        dispatchId: dispatch.id,
        title: warning.title,
        body: warning.body,
        severity: warning.severity,
        locationLabel,
      });
      await prisma.dispatch.update({
        where: { id: dispatch.id },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
    } catch (err) {
      telegramErrors.push(err instanceof Error ? err.message : String(err));
      await prisma.dispatch.update({ where: { id: dispatch.id }, data: { status: "FAILED" } });
    }
  }

  const updated = await prisma.warning.update({
    where: { id: warning.id },
    data: { status: "DISPATCHED", dispatchedAt: new Date() },
  });

  return NextResponse.json({
    warning: updated,
    dispatchCount: recipients.length,
    telegramErrors,
  });
}
