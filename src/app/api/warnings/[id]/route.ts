import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const warning = await prisma.warning.findUnique({
    where: { id },
    include: {
      location: true,
      hazardSignal: true,
      escalationSuggestions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!warning) return NextResponse.json({ error: "Warning not found" }, { status: 404 });
  return NextResponse.json({ warning });
}
