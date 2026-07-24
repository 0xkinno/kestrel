# Attributions

All photography in Kestrel is real, open-license editorial photography sourced from Unsplash - no SVG illustration, no AI-generated imagery, no stock-icon-in-a-circle art anywhere in this build.

| Use | Photo | Photographer | Source |
|---|---|---|---|
| Landing hero | "Before the rain" - lone tree on the African savanna | Felix Rottmann | https://unsplash.com/photos/lone-tree-stands-in-the-vast-african-savanna-BfiXzJQ-7zQ |
| Section break - the kestrel | "A kestrel hovers in the sky" | Doncoombez | https://unsplash.com/photos/a-kestrel-hovers-in-the-sky-gUs-Dm871GM |
| Section break - community | "Market day in the Gamo Highlands" | Hendrik Morkel | https://unsplash.com/photos/woman-selling-spices-at-an-outdoor-market-tE9Qsv_eV2o |
| Map section backdrop | "Aerial view of a river delta with dry earth" | Cosmin Andrei Buzamat | https://unsplash.com/photos/aerial-view-of-a-river-delta-with-dry-earth-B1FMTYfPk4Q |

Photos are used under the [Unsplash License](https://unsplash.com/license) (free to use, no permission needed, attribution appreciated but not required - provided here regardless, per this hackathon's IP transparency rule).

## Data & APIs

- **Weather / hazard data:** [Open-Meteo](https://open-meteo.com/) - free, no API key, real current + forecast readings for every seeded location.
- **AI - warning generation & escalation reasoning:** [Groq API](https://groq.com/) (`llama-3.3-70b-versatile` by default). The build spec originally called for the Anthropic API; the team substituted Groq for this build and is disclosing that substitution here per the hackathon's data/tooling transparency rule.
- **Maps:** [MapLibre GL JS](https://maplibre.org/) with [OpenFreeMap](https://openfreemap.org/) tiles - open-source, no API key.
- **Real delivery channel:** [Telegram Bot API](https://core.telegram.org/bots/api) - real messages with tap-to-confirm buttons. Every other simulated recipient in the demo is clearly labeled "Delivery simulation" in the UI; see the in-app "About the data" page.
- **Fonts:** Fraunces and Hanken Grotesk and IBM Plex Mono, all via Google Fonts, used as free-licensed substitutes for Tiempos/Canela and Söhne respectively (noted in README).
