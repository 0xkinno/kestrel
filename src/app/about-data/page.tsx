const SOURCES = [
  {
    name: "Open-Meteo",
    role: "Real current and forecast weather (rainfall, temperature, wind) for every seeded location.",
    note: "Free, no API key. Hazard severity is computed from these real readings with documented, auditable rule-based thresholds - see the source code in lib/hazardRules.ts. This is not an AI guess.",
    url: "https://open-meteo.com/",
  },
  {
    name: "Groq API (llama-3.3-70b-versatile)",
    role: "Turns an already-classified hazard reading into a short, plain-language, action-first warning, and reasons about escalation when confirmation lags.",
    note: "The original build spec called for the Anthropic API. This build substitutes Groq - disclosed here in full per the hackathon's data/tooling transparency rule. The AI layer never invents hazard facts; it only translates and reasons over data it's given.",
    url: "https://groq.com/",
  },
  {
    name: "Telegram Bot API",
    role: "The one real delivery channel in this build - recipients who have started the bot receive an actual message with tap-to-confirm buttons.",
    note: "Every other recipient is a simulated SMS/USSD dispatch, clearly labeled 'delivery simulation' throughout the UI - never presented as a real message.",
    url: "https://core.telegram.org/bots/api",
  },
  {
    name: "MapLibre GL JS + OpenFreeMap",
    role: "The live map - open-source rendering engine, free tile source, no vendor API key.",
    note: "Restyled at runtime to Kestrel's paper/ink/ochre palette rather than the default basemap look.",
    url: "https://maplibre.org/",
  },
  {
    name: "Unsplash",
    role: "All photography in this build - hero, section breaks, map backdrop.",
    note: "Real, open-license editorial photography, not illustration or generated imagery. Full attribution in ATTRIBUTIONS.md.",
    url: "https://unsplash.com/",
  },
];

const SUBSTITUTIONS = [
  "Next.js 16 (App Router) is used in place of the spec's suggested Next.js 14 - a newer stable release of the same framework and paradigm, not a different architecture.",
  "Fraunces and Hanken Grotesk (both free, Google Fonts) stand in for Tiempos/Canela and Söhne, which require paid licenses.",
];

export default function AboutDataPage() {
  return (
    <div className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-[11px] font-data uppercase tracking-[0.16em] text-ink-faint">
          About the data
        </p>
        <h1 className="mt-3 text-4xl">Where every number in Kestrel comes from.</h1>
        <p className="mt-4 text-ink-muted max-w-xl">
          Per the hackathon&rsquo;s transparency rules, every external API, dataset,
          and library this build depends on is listed here - nothing is a silent
          mock pretending to be a live feed.
        </p>

        <div className="mt-14 divide-y divide-hairline border-t border-b border-hairline">
          {SOURCES.map((s) => (
            <div key={s.name} className="py-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl">{s.name}</h2>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ink-faint underline underline-offset-4 hover:text-accent-ink shrink-0"
                >
                  {s.url.replace("https://", "")}
                </a>
              </div>
              <p className="mt-2 text-sm text-ink-muted">{s.role}</p>
              <p className="mt-2 text-xs text-ink-faint leading-relaxed">{s.note}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-sm font-data uppercase tracking-wide text-ink-faint">
          Disclosed substitutions
        </h2>
        <ul className="mt-4 space-y-3">
          {SUBSTITUTIONS.map((s) => (
            <li key={s} className="text-sm text-ink-muted leading-relaxed pl-4 border-l border-hairline">
              {s}
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-sm font-data uppercase tracking-wide text-ink-faint">
          On the beneficiary data represented here
        </h2>
        <p className="mt-4 text-sm text-ink-muted leading-relaxed max-w-xl">
          The at-risk community is represented only as aggregate delivery and
          confirmation numbers. Simulated recipients are synthetic - generated
          names with no connection to real individuals - used only to make the
          aggregate numbers demoable at a realistic scale alongside the real
          Telegram channel.
        </p>
      </div>
    </div>
  );
}
