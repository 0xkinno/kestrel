import Groq from "groq-sdk";

let client: Groq | null = null;

function getClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local - see .env.example."
    );
  }
  client ??= new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export interface WarningCopyInput {
  hazardType: string;
  severity: "WATCH" | "WARNING" | "EMERGENCY";
  summary: string;
  locationName: string;
  ward: string;
  country: string;
  language: string;
  literacyLevel: string;
}

export interface WarningCopy {
  title: string;
  body: string;
}

const WARNING_SYSTEM_PROMPT = `You are the warning-drafting layer inside Kestrel, an early-warning system for the IGAD region of East Africa (Kenya, Ethiopia, Somalia, Sudan, South Sudan, Uganda, Djibouti, Eritrea).

Your ONLY job is to turn an already-classified hazard reading into a short, plain-language, ACTION-FIRST warning that a person with low literacy, reading on a basic phone, in a hurry, can understand and act on in seconds. This is a life-safety message, not a slogan - it must be specific and concrete enough that someone unfamiliar with the hazard still knows exactly what to physically do next.

Rules:
- Never invent hazard facts beyond what's given - you are translating and advising, not forecasting.
- Name the place. Lead with the ONE most important concrete action for this specific hazard type and severity (e.g. for drought: which water/food priorities and rationing steps; for flood: which direction to move to and what to do with livestock/belongings; for extreme heat: who is most at risk and what shelter/hydration steps to take now). Do not settle for a generic instruction like "find water" or "stay safe" - name the specific first step a person would actually take.
- Follow the action with one short sentence of context: why, and roughly what timeframe this matters on.
- Short, plain sentences. No jargon, no numbers-heavy meteorological language, no percentages.
- Body should read as 1-2 short sentences - long enough to name a concrete action plus brief context, short enough to fit one SMS (under ~160 characters where possible). Never pad with filler.
- Title is at most 7 words, plain, no punctuation drama (no all-caps, no excessive exclamation points), and should reference the hazard type or place, not just the severity level.
- Respond with strict JSON only: {"title": string, "body": string}. No markdown, no commentary.`;

export async function generateWarningCopy(input: WarningCopyInput): Promise<WarningCopy> {
  const userPrompt = `Hazard type: ${input.hazardType}
Severity: ${input.severity}
Data summary: ${input.summary}
Location: ${input.locationName}, ${input.ward}, ${input.country}
Target language: ${input.language}
Target literacy level: ${input.literacyLevel}`;

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: WARNING_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq returned no content for warning generation");

  const parsed = JSON.parse(raw) as Partial<WarningCopy>;
  if (!parsed.title || !parsed.body) {
    throw new Error(`Groq response missing title/body: ${raw}`);
  }
  return { title: parsed.title, body: parsed.body };
}

export interface EscalationInput {
  warningTitle: string;
  locationName: string;
  ward: string;
  deliveryRate: number;
  confirmationRate: number;
  avgTimeToConfirmSeconds: number | null;
  totalRecipients: number;
  confirmedCount: number;
}

export interface EscalationSuggestionResult {
  reason: string;
  suggestedAction: string;
  aiRationale: string;
}

const ESCALATION_SYSTEM_PROMPT = `You are the escalation-reasoning layer inside Kestrel. You look at how a dispatched warning is performing - delivery and comprehension-confirmation numbers - and recommend ONE concrete next action to a disaster-management officer when confirmation is lagging.

Rules:
- Be specific to the numbers given, not generic.
- Suggested actions must be realistic for the IGAD region: e.g. switch to community radio broadcast, dispatch a local focal point in person, repeat via a second channel, escalate to a regional coordinator.
- Keep "reason" to one sentence. Keep "suggestedAction" to one short imperative sentence. Keep "aiRationale" to 2 sentences max explaining why, referencing the actual numbers.
- Respond with strict JSON only: {"reason": string, "suggestedAction": string, "aiRationale": string}. No markdown, no commentary.`;

export async function generateEscalationSuggestion(
  input: EscalationInput
): Promise<EscalationSuggestionResult> {
  const userPrompt = `Warning: "${input.warningTitle}" for ${input.locationName}, ${input.ward}
Total recipients: ${input.totalRecipients}
Delivery rate: ${(input.deliveryRate * 100).toFixed(0)}%
Confirmation rate: ${(input.confirmationRate * 100).toFixed(0)}% (${input.confirmedCount}/${input.totalRecipients} confirmed understanding)
Average time to confirm: ${input.avgTimeToConfirmSeconds !== null ? `${Math.round(input.avgTimeToConfirmSeconds)}s` : "no confirmations yet"}`;

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.5,
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ESCALATION_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq returned no content for escalation suggestion");

  const parsed = JSON.parse(raw) as Partial<EscalationSuggestionResult>;
  if (!parsed.reason || !parsed.suggestedAction || !parsed.aiRationale) {
    throw new Error(`Groq response missing fields: ${raw}`);
  }
  return {
    reason: parsed.reason,
    suggestedAction: parsed.suggestedAction,
    aiRationale: parsed.aiRationale,
  };
}

export const GROQ_MODEL_NAME = MODEL;
