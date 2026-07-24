# Kestrel - Submission Copy (drafts for review/edit)

## Project Overview (250 words)

Most early-warning systems stop the moment an alert is issued. IGAD's own brief names the real gap: hazard information has to be generated, communicated, **understood**, and turned into **action** - and the "understood" step is where the region's current tools go silent. A flood bulletin sent as a technical SMS blast, in the wrong language or literacy level, with no way to check whether anyone actually grasped it, is not an early-warning system - it's a paper trail.

Kestrel closes that loop. Real weather data for eight IGAD-region locations feeds a transparent, rule-based hazard classifier, which hands off to an AI layer that drafts a short, plain-language, action-first warning - not a meteorological bulletin. A human disaster-management officer reviews and can edit that warning before anything goes out, because full automation without oversight is a red flag for a life-safety product. Once approved, the warning dispatches across a real channel (Telegram, with tap-to-confirm buttons) and a clearly labeled delivery simulation standing in for channels this build doesn't have a live gateway for. Recipients confirm receipt and comprehension with one tap. A live dashboard tracks delivery and confirmation rates per location in real time - and when confirmation lags below 50%, a second AI pass reads the actual numbers and recommends a concrete fallback, like switching to community radio.

Generate → communicate → understand → escalate, all demoable end to end, with every hazard reading, every warning, and every confirmation backed by real data - nothing in the path is mocked.

## Solution Details (250 words)

**Architecture:** Next.js 16 (App Router, TypeScript) with a fully custom editorial design system - warm paper background, ink-black type, a single ochre accent, no dark mode, no default Tailwind look. PostgreSQL via Prisma models the full loop: `Location → HazardSignal → Warning → Dispatch → Confirmation → EscalationSuggestion`.

**Data:** Open-Meteo supplies real current and forecast weather for eight seeded IGAD-region locations, one per member state. A documented, auditable rule-based threshold layer - not an AI guess - classifies each reading into a hazard type and severity (WATCH / WARNING / EMERGENCY).

**AI, twice:** Groq (`llama-3.3-70b-versatile`) turns a classified hazard reading into a short, plain-language, action-first warning, targeted at a stated literacy level. Separately, once a warning is dispatched, Groq reasons over real delivery/confirmation numbers to produce a specific escalation recommendation - the second AI touchpoint, and the one most teams in this space won't build at all.

**Human-in-the-loop:** nothing dispatches without an officer approving - and optionally editing - the draft first, via the `/admin` console.

**Delivery:** a real Telegram bot with inline confirm buttons and a webhook, plus an in-app SMS/USSD simulation for the rest of the seeded recipient pool - always labeled as simulation, never presented as live.

**Visualization:** a custom MapLibre map (no vendor key, restyled basemap) and hand-built D3 charts - a region-comparison bar chart and a cumulative confirmation curve - driving the `/dashboard` view.

---

*Word counts are approximate - trim to fit your submission form's exact limit before pasting.*
