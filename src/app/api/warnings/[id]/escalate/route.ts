import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEscalationSuggestion, GROQ_MODEL_NAME } from "@/lib/groq";
import { computeWarningStats, ESCALATION_CONFIRMATION_THRESHOLD } from "@/lib/warningStats";

export const dynamic = "force-dynamic";

/**
 * The second AI touchpoint: looks at how a dispatched warning is actually performing
 * (delivery/confirmation numbers) and asks Groq for a concrete next action. Only
 * meaningful once a warning has been dispatched and has some response data.
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
  if (warning.status !== "DISPATCHED") {
    return NextResponse.json({ error: "Warning has not been dispatched yet" }, { status: 400 });
  }

  const stats = await computeWarningStats(id);
  if (!stats.belowEscalationThreshold) {
    return NextResponse.json({
      error: `Confirmation rate (${(stats.confirmationRate * 100).toFixed(0)}%) is at or above the ${
        ESCALATION_CONFIRMATION_THRESHOLD * 100
      }% escalation threshold - no escalation needed yet.`,
    }, { status: 400 });
  }

  const suggestion = await generateEscalationSuggestion({
    warningTitle: warning.title,
    locationName: warning.location.name,
    ward: warning.location.ward,
    deliveryRate: stats.deliveryRate,
    confirmationRate: stats.confirmationRate,
    avgTimeToConfirmSeconds: stats.avgTimeToConfirmSeconds,
    totalRecipients: stats.totalRecipients,
    confirmedCount: stats.confirmedCount,
  });

  const record = await prisma.escalationSuggestion.create({
    data: {
      warningId: id,
      reason: suggestion.reason,
      suggestedAction: suggestion.suggestedAction,
      aiRationale: suggestion.aiRationale,
      aiModel: GROQ_MODEL_NAME,
    },
  });

  return NextResponse.json({ escalation: record, stats });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const escalations = await prisma.escalationSuggestion.findMany({
    where: { warningId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ escalations });
}
