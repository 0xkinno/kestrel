import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const approvedBy: string = body.approvedBy || "Demo Officer";
  const editedTitle: string | undefined = body.title;
  const editedBody: string | undefined = body.body;

  const warning = await prisma.warning.findUnique({ where: { id } });
  if (!warning) return NextResponse.json({ error: "Warning not found" }, { status: 404 });
  if (warning.status !== "DRAFT") {
    return NextResponse.json({ error: "Only draft warnings can be approved" }, { status: 400 });
  }

  const updated = await prisma.warning.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedBy,
      approvedAt: new Date(),
      ...(editedTitle ? { title: editedTitle } : {}),
      ...(editedBody ? { body: editedBody } : {}),
    },
    include: { location: true, hazardSignal: true },
  });

  return NextResponse.json({ warning: updated });
}
