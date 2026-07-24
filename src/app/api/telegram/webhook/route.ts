import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { answerCallbackQuery } from "@/lib/telegram";
import { recordConfirmation } from "@/lib/confirmations";

export const dynamic = "force-dynamic";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { first_name?: string; last_name?: string; username?: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
  };
}

/**
 * Real Telegram webhook. Two things land here:
 *  - `/start [ward]` - registers this chat as a real (non-simulated) recipient,
 *    matched to a seeded location by name if given, otherwise the location with
 *    the fewest real recipients so demo testers spread out.
 *  - Inline-button taps (`callback_query`) - the actual "confirm receipt/understanding"
 *    signal that closes the loop for a real recipient, same as recordConfirmation
 *    does for simulated ones.
 */
export async function POST(req: NextRequest) {
  const update: TelegramUpdate = await req.json();

  if (update.message?.text?.startsWith("/start")) {
    await handleStart(update.message);
    return NextResponse.json({ ok: true });
  }

  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

async function handleStart(message: NonNullable<TelegramUpdate["message"]>) {
  const chatId = String(message.chat.id);
  const wardQuery = message.text?.replace("/start", "").trim();

  const existing = await prisma.recipient.findUnique({ where: { telegramChatId: chatId } });
  if (existing) return;

  let location = wardQuery
    ? await prisma.location.findFirst({
        where: { name: { contains: wardQuery, mode: "insensitive" } },
      })
    : null;

  if (!location) {
    const locations = await prisma.location.findMany({
      include: { _count: { select: { recipients: { where: { isSimulated: false } } } } },
    });
    location = locations.sort(
      (a, b) => a._count.recipients - b._count.recipients
    )[0] ?? null;
  }

  if (!location) return;

  const name =
    [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
    message.from?.username ||
    "Telegram recipient";

  await prisma.recipient.create({
    data: {
      name,
      locationId: location.id,
      isSimulated: false,
      telegramChatId: chatId,
      preferredChannel: "TELEGRAM",
    },
  });
}

async function handleCallback(callback: NonNullable<TelegramUpdate["callback_query"]>) {
  const data = callback.data ?? "";
  const [, dispatchId, response] = data.split(":");

  let toast = "Couldn't read that response.";

  if (dispatchId && (response === "UNDERSTOOD" || response === "NEED_MORE_INFO")) {
    try {
      await recordConfirmation(dispatchId, response);
      toast =
        response === "UNDERSTOOD" ? "Thanks - recorded as understood." : "Thanks - we'll follow up with more detail.";
    } catch {
      toast = "Already recorded, thank you.";
    }
  }

  // Best-effort only: this is just the toast Telegram shows the tapper. If the
  // callback query has expired (e.g. a delayed retry), that must never turn into
  // a 500 for the webhook - the confirmation above is already durably recorded,
  // and a 500 here would just make Telegram redeliver the same update forever.
  try {
    await answerCallbackQuery(callback.id, toast);
  } catch {
    // ignore - recordConfirmation already succeeded or failed above; nothing more to do.
  }
}
