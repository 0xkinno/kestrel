import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const locations = await prisma.location.findMany({
    include: {
      hazardSignals: { orderBy: { observedAt: "desc" }, take: 1 },
      warnings: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { recipients: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ locations });
}
