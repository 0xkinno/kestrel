const API_BASE = "https://api.telegram.org";

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is not set. Add it to .env.local - see .env.example."
    );
  }
  return t;
}

async function callTelegram(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(json)}`);
  }
  return json.result;
}

export interface WarningMessagePayload {
  dispatchId: string;
  title: string;
  body: string;
  severity: "WATCH" | "WARNING" | "EMERGENCY";
  locationLabel: string;
}

const SEVERITY_EMOJI: Record<WarningMessagePayload["severity"], string> = {
  WATCH: "🟡",
  WARNING: "🟠",
  EMERGENCY: "🔴",
};

export async function sendWarningMessage(chatId: string, payload: WarningMessagePayload) {
  const text = `${SEVERITY_EMOJI[payload.severity]} *${escapeMd(payload.title)}*\n${escapeMd(
    payload.locationLabel
  )}\n\n${escapeMd(payload.body)}\n\n_${escapeMd("Kestrel early warning - please confirm below.")}_`;

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Understood", callback_data: `confirm:${payload.dispatchId}:UNDERSTOOD` },
          { text: "❓ Need more info", callback_data: `confirm:${payload.dispatchId}:NEED_MORE_INFO` },
        ],
      ],
    },
  });
}

export async function sendPlainMessage(chatId: string, text: string) {
  return callTelegram("sendMessage", { chat_id: chatId, text });
}

export async function answerCallbackQuery(callbackQueryId: string, text: string) {
  return callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

export async function setWebhook(url: string) {
  return callTelegram("setWebhook", { url });
}

export async function getWebhookInfo() {
  const res = await fetch(`${API_BASE}/bot${token()}/getWebhookInfo`, { cache: "no-store" });
  return res.json();
}

// MarkdownV2 requires escaping a specific set of characters.
function escapeMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
