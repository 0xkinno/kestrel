import { NextRequest, NextResponse } from "next/server";
import { setWebhook, getWebhookInfo } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * One-time (or after a URL change) registration of the Telegram webhook, pointed at
 * this deployment's /api/telegram/webhook. Guarded by KESTREL_ADMIN_SECRET since it's
 * a config-changing action, not a data read.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.KESTREL_ADMIN_SECRET || secret !== process.env.KESTREL_ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.PUBLIC_BASE_URL;
  if (!base) {
    return NextResponse.json({ error: "PUBLIC_BASE_URL is not set" }, { status: 400 });
  }

  const result = await setWebhook(`${base}/api/telegram/webhook`);
  return NextResponse.json({ result });
}

export async function GET() {
  const info = await getWebhookInfo();
  return NextResponse.json(info);
}
