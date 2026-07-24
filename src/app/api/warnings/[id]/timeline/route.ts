import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Per-confirmation timing for one warning, used to draw the cumulative
 * "how fast did comprehension actually spread" chart on the warning detail page.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const dispatches = await prisma.dispatch.findMany({
    where: { warningId: id },
    include: { confirmation: true },
    orderBy: { sentAt: "asc" },
  });

  if (dispatches.length === 0) {
    return NextResponse.json({ totalRecipients: 0, points: [] });
  }

  const points = dispatches
    .filter((d) => d.confirmation)
    .map((d) => ({
      minutesSinceSent: d.confirmation!.timeToConfirmSeconds / 60,
      response: d.confirmation!.response,
    }))
    .sort((a, b) => a.minutesSinceSent - b.minutesSinceSent);

  return NextResponse.json({ totalRecipients: dispatches.length, points });
}
