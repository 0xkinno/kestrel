import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateWarningCopy, GROQ_MODEL_NAME } from "@/lib/groq";

export const dynamic = "force-dynamic";

/**
 * Takes a hazardSignalId, calls Groq to draft a plain-language action-first warning,
 * and stores it as DRAFT. Nothing is dispatched here - an officer must approve first
 * (see /api/warnings/[id]/approve), per the human-in-the-loop requirement for a
 * life-safety product.
 */
export async function POST(req: NextRequest) {
  const { hazardSignalId, language, literacyLevel } = await req.json();

  if (!hazardSignalId) {
    return NextResponse.json({ error: "hazardSignalId is required" }, { status: 400 });
  }

  const signal = await prisma.hazardSignal.findUnique({
    where: { id: hazardSignalId },
    include: { location: true },
  });

  if (!signal) {
    return NextResponse.json({ error: "Hazard signal not found" }, { status: 404 });
  }

  const existing = await prisma.warning.findUnique({
    where: { hazardSignalId },
    include: { location: true, hazardSignal: true },
  });
  if (existing) {
    return NextResponse.json({ warning: existing, reused: true });
  }

  const copy = await generateWarningCopy({
    hazardType: signal.type,
    severity: signal.severity,
    summary: signal.summary,
    locationName: signal.location.name,
    ward: signal.location.ward,
    country: signal.location.country,
    language: language ?? "en",
    literacyLevel: literacyLevel ?? "low",
  });

  const warning = await prisma.warning.create({
    data: {
      hazardSignalId: signal.id,
      locationId: signal.locationId,
      severity: signal.severity,
      title: copy.title,
      body: copy.body,
      language: language ?? "en",
      literacyLevel: literacyLevel ?? "low",
      status: "DRAFT",
      aiModel: GROQ_MODEL_NAME,
    },
    include: { location: true, hazardSignal: true },
  });

  return NextResponse.json({ warning });
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const warnings = await prisma.warning.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: { location: true, hazardSignal: true },
  });
  return NextResponse.json({ warnings });
}
