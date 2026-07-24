import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeWarningStats } from "@/lib/warningStats";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const warning = await prisma.warning.findUnique({ where: { id } });
  if (!warning) return NextResponse.json({ error: "Warning not found" }, { status: 404 });

  const stats = await computeWarningStats(id);
  return NextResponse.json({ stats });
}
